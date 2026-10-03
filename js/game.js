// Ana Oyun Motoru ve Döngüsü (Zoom, Raycasting, Lobi ve Ayarlar)
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.map = new GameMap(3400, 3400);
        this.storm = new StormSystem(this.map.width, this.map.height);
        this.ui = new UIManager(this);

        this.camera = { x: 0, y: 0 };
        this.currentZoom = 1.0;
        this.targetZoom = 1.0;

        this.bullets = [];
        this.bots = [];
        this.totalPlayers = 25;

        this.player = null;
        this.keys = {};
        this.mouse = { x: 0, y: 0, isDown: false };

        this.lastTime = performance.now();
        this.gameState = 'LOBBY'; // 'LOBBY', 'PLAYING', 'GAMEOVER', 'VICTORY'
        this.spectatingEntity = null;
        this.selectedSkin = 'default';

        this.settings = {
            masterVolume: 0.8,
            sfxVolume: 0.8,
            autoLoot: true,
            uiOpacity: 0.85
        };

        this.initInput();
        this.applySettings();
        this.initLobby('Savaşçı', 'default');
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    applySettings() {
        window.soundManager.setMasterVolume(this.settings.masterVolume);
        window.soundManager.setSfxVolume(this.settings.sfxVolume);
    }

    // Başlangıç Lobi Durumu
    initLobby(playerName = 'Savaşçı', skinId = 'default') {
        this.gameState = 'LOBBY';
        this.spectatingEntity = null;
        this.bullets = [];
        this.currentZoom = 1.0;
        this.targetZoom = 1.0;

        this.map = new GameMap(3400, 3400);
        this.storm = new StormSystem(this.map.width, this.map.height);

        const px = this.map.width / 2;
        const py = this.map.height / 2;
        this.selectedSkin = skinId || 'default';
        this.player = new Player(px, py, playerName || 'Savaşçı', false);
        this.player.applySkin(this.selectedSkin);

        this.bots = [];

        this.camera.x = Math.max(0, Math.min(this.map.width - this.canvas.width, px - this.canvas.width / 2));
        this.camera.y = Math.max(0, Math.min(this.map.height - this.canvas.height, py - this.canvas.height / 2));

        const lobbyModal = document.getElementById('lobbyModal');
        if (lobbyModal) lobbyModal.classList.add('active');

        this.updateHUD();
    }

    // Lobiden Oyunu Başlat
    startNewMatch(playerName = 'Sen', skinId = 'default') {
        this.gameState = 'PLAYING';
        this.spectatingEntity = null;
        this.bullets = [];
        this.currentZoom = 1.0;
        this.targetZoom = 1.0;

        this.map = new GameMap(3400, 3400);
        this.storm = new StormSystem(this.map.width, this.map.height);

        // Oyuncuyu haritanın güvenli bir yerine yerleştir
        const px = this.map.width / 2 + (Math.random() - 0.5) * 800;
        const py = this.map.height / 2 + (Math.random() - 0.5) * 800;
        this.selectedSkin = skinId || this.selectedSkin || 'default';
        this.player = new Player(px, py, playerName || 'Sen', false);
        this.player.applySkin(this.selectedSkin);

        // 24 Botu Haritaya Dağıt
        this.bots = [];
        for (let i = 0; i < this.totalPlayers - 1; i++) {
            const bx = 200 + Math.random() * (this.map.width - 400);
            const by = 200 + Math.random() * (this.map.height - 400);
            const bot = new Bot(bx, by);
            // Botlara da rastgele kamuflaj ver
            const skins = ['default', 'desert', 'night', 'jungle', 'cyber'];
            bot.applySkin(skins[Math.floor(Math.random() * skins.length)]);
            this.bots.push(bot);
        }

        // Ekranları Kapat
        const lobbyModal = document.getElementById('lobbyModal');
        if (lobbyModal) lobbyModal.classList.remove('active');

        const endScreen = document.getElementById('endScreen');
        if (endScreen) endScreen.classList.remove('active');

        this.camera.x = Math.max(0, Math.min(this.map.width - this.canvas.width, px - this.canvas.width / 2));
        this.camera.y = Math.max(0, Math.min(this.map.height - this.canvas.height, py - this.canvas.height / 2));
        this.updateHUD();

        this.showDeployNotice();
    }

    getCareerStats() {
        try {
            return JSON.parse(localStorage.getItem('survivor_career')) || { matches: 0, wins: 0, kills: 0 };
        } catch (e) {
            return { matches: 0, wins: 0, kills: 0 };
        }
    }

    saveCareerStats(isVictory) {
        const stats = this.getCareerStats();
        stats.matches += 1;
        if (isVictory) stats.wins += 1;
        if (this.player) stats.kills += this.player.kills;
        try {
            localStorage.setItem('survivor_career', JSON.stringify(stats));
        } catch (e) {}
    }

    showDeployNotice() {
        const banner = document.getElementById('deployNotice');
        if (banner) {
            banner.classList.add('active');
            setTimeout(() => {
                banner.classList.remove('active');
            }, 2500);
        }
    }

    initInput() {
        window.addEventListener('keydown', (e) => {
            window.soundManager.ensureContext();
            this.keys[e.key.toLowerCase()] = true;
            this.keys[e.code] = true;

            // M Tuşu ile Büyük Taktik Haritasını Aç / Kapat
            if (e.key === 'm' || e.key === 'M') {
                this.ui.toggleTacticalMap();
                return;
            }

            if (this.gameState !== 'PLAYING') return;

            if (e.key === 'r' || e.key === 'R') {
                if (this.player && !this.player.isDead) this.player.startReload();
            }
            if (e.key === 'e' || e.key === 'E' || e.key === ' ') {
                if (this.player && !this.player.isDead) this.player.manualPickupItem(this);
            }
            if (e.key === '1') this.player.switchWeapon(0);
            if (e.key === '2') this.player.switchWeapon(1);
            if (e.key === '3') this.player.switchWeapon(2);
            if (e.key === '4') this.player.useItem('bandage');
            if (e.key === '5') this.player.useItem('medkit');
            if (e.key === '6') this.player.useItem('shield_potion');
            if (e.key === 'm' || e.key === 'M') {
                window.soundManager.enabled = !window.soundManager.enabled;
                window.soundManager.updateGain();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
            this.keys[e.code] = false;
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                window.soundManager.ensureContext();
                this.mouse.isDown = true;
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.mouse.isDown = false;
            }
        });
    }

    addBullet(bullet) {
        this.bullets.push(bullet);
    }

    applyAreaDamage(x, y, radius, maxDamage, source) {
        if (this.player && !this.player.isDead) {
            const d = Math.hypot(this.player.x - x, this.player.y - y);
            if (d < radius) {
                const dmg = Math.round(maxDamage * (1 - d / radius));
                this.player.takeDamage(dmg, source, this);
            }
        }

        for (const bot of this.bots) {
            if (bot.isDead) continue;
            const d = Math.hypot(bot.x - x, bot.y - y);
            if (d < radius) {
                const dmg = Math.round(maxDamage * (1 - d / radius));
                bot.takeDamage(dmg, source, this);
            }
        }

        for (const obs of this.map.obstacles) {
            if (!obs.isDestructible) continue;
            const d = Math.hypot(obs.x - x, obs.y - y);
            if (d < radius && d > 5) {
                const dmg = Math.round(maxDamage * (1 - d / radius));
                this.map.damageObstacle(obs, dmg, this);
            }
        }
    }

    getEntitiesNear(x, y, range) {
        const list = [];
        if (this.player && !this.player.isDead) {
            if (Math.hypot(this.player.x - x, this.player.y - y) <= range) list.push(this.player);
        }
        for (const bot of this.bots) {
            if (!bot.isDead && Math.hypot(bot.x - x, bot.y - y) <= range) {
                list.push(bot);
            }
        }
        return list;
    }

    onEntityKilled(victim, killer) {
        const killerName = killer ? killer.name : 'Fırtına';
        const weaponName = killer ? (killer.getActiveWeapon() ? killer.getActiveWeapon().name : 'Yumruk') : 'Gaz';

        this.ui.addKillMessage(killerName, victim.name, weaponName);

        const aliveCount = this.getAliveCount();

        if (victim === this.player) {
            this.gameState = 'GAMEOVER';
            this.saveCareerStats(false);
            this.spectatingEntity = killer || this.bots.find(b => !b.isDead);
            this.showEndGameModal(false, aliveCount + 1);
        } else {
            if (aliveCount === 1 && !this.player.isDead) {
                this.gameState = 'VICTORY';
                this.saveCareerStats(true);
                window.soundManager.playVictory();
                this.showEndGameModal(true, 1);
            }
        }
    }

    getAliveCount() {
        let count = (this.player && !this.player.isDead) ? 1 : 0;
        for (const bot of this.bots) {
            if (!bot.isDead) count++;
        }
        return count;
    }

    showEndGameModal(isVictory, rank) {
        const modal = document.getElementById('endScreen');
        const title = document.getElementById('endTitle');
        const desc = document.getElementById('endDesc');
        const killsEl = document.getElementById('endKills');

        if (modal && title && desc && killsEl) {
            if (isVictory) {
                title.textContent = '🏆 1. OLDUN - ÇORBA PARASI ÇIKTI!';
                title.className = 'title victory';
                desc.textContent = 'Tüm rakiplerini eleyerek hayatta kalan son savaşçı oldun!';
            } else {
                title.textContent = 'ELENDİN!';
                title.className = 'title defeat';
                desc.textContent = `Sıralaman: #${rank} / ${this.totalPlayers}`;
            }
            killsEl.textContent = `Toplam Leş: ${this.player.kills}`;
            modal.classList.add('active');
        }
    }

    handlePlayerInput(dt) {
        if (!this.player || this.player.isDead) return;

        let moveX = 0;
        let moveY = 0;

        if (this.keys['w'] || this.keys['arrowup']) moveY -= 1;
        if (this.keys['s'] || this.keys['arrowdown']) moveY += 1;
        if (this.keys['a'] || this.keys['arrowleft']) moveX -= 1;
        if (this.keys['d'] || this.keys['arrowright']) moveX += 1;

        if (this.ui.touchControls.move.active) {
            moveX = this.ui.touchControls.move.vx;
            moveY = this.ui.touchControls.move.vy;
        }

        const len = Math.hypot(moveX, moveY);
        if (len > 0) {
            const currentSpeed = (this.keys['shift'] ? this.player.speed * 1.25 : this.player.speed);
            this.player.vx = (moveX / len) * currentSpeed;
            this.player.vy = (moveY / len) * currentSpeed;
        } else {
            this.player.vx = 0;
            this.player.vy = 0;
        }

        // Nişan Alma (Zoom hesabı katılarak)
        if (this.ui.touchControls.aim.active) {
            this.player.angle = this.ui.touchControls.aim.angle;
            if (this.ui.touchControls.aim.isShooting) {
                this.player.shoot(this);
            }
        } else {
            const cx = this.canvas.width / 2;
            const cy = this.canvas.height / 2;
            const worldMouseX = (this.mouse.x - cx) / this.currentZoom + cx + this.camera.x;
            const worldMouseY = (this.mouse.y - cy) / this.currentZoom + cy + this.camera.y;

            this.player.angle = Math.atan2(worldMouseY - this.player.y, worldMouseX - this.player.x);

            if (this.mouse.isDown) {
                this.player.shoot(this);
            }
        }
    }

    // ==========================================
    // SÜREKLİ MERMİ ÇARPIŞMA SİSTEMİ (CCD)
    // Mermilerin duvardan geçmesini %100 engeller
    // ==========================================
    updateBullets(dt) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            const oldX = b.x;
            const oldY = b.y;

            b.x += b.vx;
            b.y += b.vy;
            b.traveled += Math.hypot(b.vx, b.vy);

            // Roket arkasında duman efekti
            if (b.isRocket) {
                window.particleManager.particles.push({
                    x: b.x, y: b.y,
                    vx: -b.vx * 0.15 + (Math.random() - 0.5) * 1.5,
                    vy: -b.vy * 0.15 + (Math.random() - 0.5) * 1.5,
                    size: 6 + Math.random() * 4,
                    color: '#888888',
                    alpha: 0.6,
                    decay: 0.03,
                    type: 'circle'
                });
            } else {
                window.particleManager.addTracer(oldX, oldY, b.x, b.y, b.color, b.size);
            }

            // Menzil aşımı
            if (b.traveled >= b.range) {
                if (b.isRocket) {
                    window.soundManager.playExplosion();
                    window.particleManager.createExplosion(b.x, b.y);
                    this.applyAreaDamage(b.x, b.y, 160, 130, b.shooter);
                }
                this.bullets.splice(i, 1);
                continue;
            }

            // 1. DUVAR VE ENGEL RAYCAST KONTROLÜ
            const hitObs = this.map.checkRaycastObstacle(oldX, oldY, b.x, b.y);
            if (hitObs) {
                if (b.isRocket) {
                    window.soundManager.playExplosion();
                    window.particleManager.createExplosion(hitObs.point.x, hitObs.point.y);
                    this.applyAreaDamage(hitObs.point.x, hitObs.point.y, 160, 130, b.shooter);
                } else {
                    this.map.damageObstacle(hitObs.obstacle, b.damage, this);
                }
                this.bullets.splice(i, 1);
                continue;
            }

            // 2. OYUNCU VE BOTLARA ÇARPIŞMA KONTROLÜ
            const targets = this.getEntitiesNear(b.x, b.y, 45);
            let hitTarget = false;
            for (const target of targets) {
                if (target === b.shooter || target.isDead) continue;
                const d = Math.hypot(b.x - target.x, b.y - target.y);
                if (d < target.radius + b.size) {
                    if (b.isRocket) {
                        window.soundManager.playExplosion();
                        window.particleManager.createExplosion(b.x, b.y);
                        this.applyAreaDamage(b.x, b.y, 160, 130, b.shooter);
                    } else {
                        target.takeDamage(b.damage, b.shooter, this);
                    }
                    this.bullets.splice(i, 1);
                    hitTarget = true;
                    break;
                }
            }
        }
    }

    // Kamera Takibi ve Dürbün Zoom Ayarı
    updateCamera(dt) {
        let focusEntity = this.player;
        if (this.player && this.player.isDead && this.spectatingEntity && !this.spectatingEntity.isDead) {
            focusEntity = this.spectatingEntity;
        }

        // Dürbün Yakınlaştırması (Zoom Hedefi)
        if (this.player && this.player.equippedScope) {
            this.targetZoom = this.player.equippedScope.zoom;
        } else {
            this.targetZoom = 1.0;
        }
        // Yumuşak geçiş
        this.currentZoom += (this.targetZoom - this.currentZoom) * 0.08;

        if (focusEntity) {
            const targetCamX = focusEntity.x - this.canvas.width / 2;
            const targetCamY = focusEntity.y - this.canvas.height / 2;

            this.camera.x += (targetCamX - this.camera.x) * 0.12;
            this.camera.y += (targetCamY - this.camera.y) * 0.12;
        }

        this.camera.x = Math.max(0, Math.min(this.map.width - this.canvas.width, this.camera.x));
        this.camera.y = Math.max(0, Math.min(this.map.height - this.canvas.height, this.camera.y));
    }

    update(dt) {
        if (this.gameState === 'LOBBY') return;

        this.handlePlayerInput(dt);

        if (this.player) {
            this.player.update(dt, this);
        }

        for (const bot of this.bots) {
            bot.update(dt, this);
        }

        this.storm.update(dt);
        this.updateBullets(dt);
        window.particleManager.update();
        this.updateCamera(dt);
        this.updateHUD();
        this.ui.checkRegionUpdate(this.player, this.map, dt);
    }

    updateHUD() {
        if (!this.player) return;

        const hpBar = document.getElementById('healthFill');
        const hpText = document.getElementById('healthText');
        const spBar = document.getElementById('shieldFill');
        const spText = document.getElementById('shieldText');

        if (hpBar) hpBar.style.width = `${Math.max(0, this.player.health)}%`;
        if (hpText) hpText.textContent = `${Math.round(this.player.health)}`;

        if (spBar) spBar.style.width = `${Math.max(0, this.player.shield)}%`;
        if (spText) spText.textContent = `${Math.round(this.player.shield)}`;

        const aliveEl = document.getElementById('aliveCount');
        if (aliveEl) aliveEl.textContent = this.getAliveCount();

        const killsEl = document.getElementById('killsCount');
        if (killsEl) killsEl.textContent = this.player.kills;

        // Dürbün Göstergesi
        const scopeBadge = document.getElementById('scopeBadge');
        if (scopeBadge) {
            if (this.player.equippedScope) {
                scopeBadge.textContent = `${this.player.equippedScope.icon} ${this.player.equippedScope.name}`;
                scopeBadge.style.display = 'inline-flex';
            } else {
                scopeBadge.style.display = 'none';
            }
        }

        // Çanta Göstergesi
        const backpackBadge = document.getElementById('backpackBadge');
        if (backpackBadge) {
            if (this.player.backpackLevel > 0) {
                backpackBadge.textContent = `🎒 Sev. ${this.player.backpackLevel} Çanta`;
                backpackBadge.style.display = 'inline-flex';
            } else {
                backpackBadge.style.display = 'none';
            }
        }

        // Silah ve Cephane
        const weapon = this.player.getActiveWeapon();
        const curWName = document.getElementById('currentWeaponName');
        const curAmmo = document.getElementById('currentAmmo');

        if (weapon && curWName && curAmmo) {
            curWName.textContent = weapon.name;
            if (weapon.unlimitedAmmo) {
                curAmmo.textContent = '∞';
            } else {
                const reserve = this.player.ammoPouch[weapon.ammoType] || 0;
                curAmmo.textContent = `${weapon.ammo} / ${reserve}`;
            }
        }

        for (let i = 0; i < 3; i++) {
            const slot = document.getElementById(`slot-${i}`);
            if (slot) {
                const w = this.player.weapons[i];
                slot.className = `weapon-slot ${this.player.activeWeaponIndex === i ? 'active' : ''}`;
                slot.textContent = w ? `${w.icon || '🔫'} ${w.name}` : '(Boş)';
            }
        }

        const stormStatus = document.getElementById('stormStatus');
        if (stormStatus) {
            if (this.storm.state === 'WAITING') {
                stormStatus.textContent = `⏳ ${Math.ceil(this.storm.timer)}s`;
                stormStatus.style.color = '#fff';
            } else if (this.storm.state === 'SHRINKING') {
                stormStatus.textContent = `⚠️ Gaz Daralıyor!`;
                stormStatus.style.color = '#ff6b6b';
            } else {
                stormStatus.textContent = `⚡ Son Bölge!`;
            }
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Dürbün Zoom Dönüşümü
        this.ctx.save();
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        this.ctx.translate(cx, cy);
        this.ctx.scale(this.currentZoom, this.currentZoom);
        this.ctx.translate(-cx, -cy);

        // 1. Zemin
        this.map.drawGround(this.ctx, this.camera, this.canvas.width, this.canvas.height);

        // 2. Engeller
        this.map.drawObstacles(this.ctx, this.camera);

        // 3. Karakterler
        for (const bot of this.bots) {
            bot.draw(this.ctx, this.camera);
        }
        if (this.player) {
            this.player.draw(this.ctx, this.camera);
        }

        // 4. Ağaç Yaprakları (Kamuflaj Katmanı)
        if (this.player) {
            this.map.drawCanopies(this.ctx, this.camera, this.player.x, this.player.y);
        }

        // 5. Gaz Fırtınası
        this.storm.draw(this.ctx, this.camera);

        // 6. Parçacıklar
        window.particleManager.draw(this.ctx, this.camera);

        this.ctx.restore();

        // 7. Arayüz Elemanları (1:1 ölçekte)
        if (this.gameState === 'PLAYING') {
            this.ui.drawVirtualJoysticks(this.ctx);
            if (this.player) {
                this.ui.drawMiniMap(this.ctx, this.map, this.storm, this.player);
            }
            this.ui.drawKillFeed(this.ctx);
            this.ui.drawRegionBanner(this.ctx);
        }
        this.ui.drawTacticalMapModal(this.ctx, this.map, this.storm, this.player);
    }

    run() {
        const loop = (currentTime) => {
            const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
            this.lastTime = currentTime;

            try {
                this.update(dt);
                this.render();
            } catch (err) {
                console.error("Oyun döngüsü hatası:", err);
            }

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}

// Güvenli ve Hızlı Başlatıcı
function launchGame() {
    try {
        if (!window.game) {
            window.game = new Game();
            window.game.run();
        }
    } catch (e) {
        console.error("Oyun başlatılırken kritik hata:", e);
    }
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(launchGame, 10);
} else {
    window.addEventListener('DOMContentLoaded', launchGame);
    window.addEventListener('load', launchGame);
}
