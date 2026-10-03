// Oyuncu ve Karakter Temel Sınıfı (Gelişmiş Çanta, Dürbün ve Otomatik Toplama)
class Player {
    constructor(x, y, name = 'Oyuncu', isBot = false) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.isBot = isBot;
        this.radius = 19;
        this.angle = 0;

        // Hız ve Hareket
        this.speed = 220;
        this.vx = 0;
        this.vy = 0;

        // Can ve Kalkan
        this.health = 100;
        this.maxHealth = 100;
        this.shield = 50;
        this.maxShield = 100;
        this.isDead = false;
        this.kills = 0;

        // Çanta ve Dürbün Donanımları
        this.backpackLevel = 0; // 0: Çanta yok, 1, 2, 3
        this.equippedScope = null; // null = 1x, veya scope_2x, scope_4x, scope_8x

        // Silah Yuvaları: [Birincil, İkincil, Yumruk]
        this.weapons = [
            { ...window.WEAPONS.pistol, ammo: 15 },
            null,
            { ...window.WEAPONS.fists }
        ];
        this.activeWeaponIndex = 0;

        // Temel Cephane Kapasiteleri
        this.baseMaxAmmo = {
            pistol_ammo: 60,
            shotgun_ammo: 24,
            rifle_ammo: 120,
            sniper_ammo: 15,
            rocket_ammo: 3
        };

        // Cephane Çantası
        this.ammoPouch = {
            pistol_ammo: 45,
            shotgun_ammo: 12,
            rifle_ammo: 60,
            sniper_ammo: 5,
            rocket_ammo: 1
        };

        // Envanter
        this.inventory = {
            bandage: 3,
            medkit: 1,
            shield_potion: 1
        };

        // Zamanlayıcılar & Durumlar
        this.lastShotTime = 0;
        this.isReloading = false;
        this.reloadTimer = 0;
        this.reloadDuration = 0;

        this.isHealing = false;
        this.healingTimer = 0;
        this.healingDuration = 0;
        this.healingItem = null;

        // Yumruk Animasyonu
        this.punchHand = 0;
        this.punchAnim = 0;

        this.bodyColor = isBot ? '#e06c75' : '#61afef';
        this.skinColor = '#f5cba7';
    }

    // Çantaya göre maksimum cephane kapasitesini hesapla
    getMaxAmmo(ammoType) {
        let mult = 1.0;
        if (this.backpackLevel > 0) {
            const bp = window.ITEM_TYPES[`backpack_${this.backpackLevel}`];
            if (bp) mult = bp.capMult;
        }
        return Math.round((this.baseMaxAmmo[ammoType] || 50) * mult);
    }

    // Çantaya göre maksimum ilk yardım eşyası kapasitesi
    getMaxItemCount() {
        return 2 + (this.backpackLevel * 2); // Çantasız 2, Seviye 3 çanta ile 8 adet
    }

    // Aktif silahı getir
    getActiveWeapon() {
        return this.weapons[this.activeWeaponIndex] || this.weapons[2];
    }

    switchWeapon(index) {
        if (index < 0 || index > 2) return;
        if (!this.weapons[index]) return;
        if (this.isReloading) this.cancelReload();
        if (this.isHealing) this.cancelHealing();
        this.activeWeaponIndex = index;
    }

    startReload() {
        const weapon = this.getActiveWeapon();
        if (!weapon || weapon.unlimitedAmmo) return;
        if (this.isReloading) return;
        if (weapon.ammo >= weapon.magSize) return;

        const reserve = this.ammoPouch[weapon.ammoType] || 0;
        if (reserve <= 0) return;

        this.isReloading = true;
        this.reloadDuration = weapon.reloadTime;
        this.reloadTimer = weapon.reloadTime;

        if (!this.isBot) {
            window.soundManager.playReload();
        }
    }

    cancelReload() {
        this.isReloading = false;
        this.reloadTimer = 0;
    }

    useItem(itemId) {
        if (this.isDead || this.isHealing) return;
        const count = this.inventory[itemId] || 0;
        if (count <= 0) return;

        const item = window.ITEM_TYPES[itemId];
        if (!item) return;

        if (item.type === 'heal' && this.health >= item.maxTarget) return;
        if (item.type === 'shield' && this.shield >= item.maxTarget) return;

        this.isHealing = true;
        this.healingItem = item;
        this.healingDuration = item.useTime;
        this.healingTimer = item.useTime;
    }

    cancelHealing() {
        this.isHealing = false;
        this.healingItem = null;
        this.healingTimer = 0;
    }

    shoot(game) {
        if (this.isDead || this.isHealing) return;
        const now = Date.now();
        const weapon = this.getActiveWeapon();
        if (!weapon) return;

        if (now - this.lastShotTime < weapon.fireRate) return;

        if (weapon.type === 'melee') {
            this.lastShotTime = now;
            this.punchAnim = 1.0;
            this.punchHand = 1 - this.punchHand;

            const reachX = this.x + Math.cos(this.angle) * weapon.range;
            const reachY = this.y + Math.sin(this.angle) * weapon.range;

            let hitSomething = false;
            const targets = game.getEntitiesNear(this.x, this.y, weapon.range + 20);
            for (const t of targets) {
                if (t === this || t.isDead) continue;
                const d = Math.hypot(t.x - reachX, t.y - reachY);
                if (d < t.radius + 15) {
                    t.takeDamage(weapon.damage, this, game);
                    hitSomething = true;
                    break;
                }
            }

            if (!hitSomething) {
                for (const obs of game.map.obstacles) {
                    if (!obs.isDestructible) continue;
                    const d = Math.hypot(obs.x - reachX, obs.y - reachY);
                    if (d < 30) {
                        game.map.damageObstacle(obs, weapon.damage, game);
                        hitSomething = true;
                        break;
                    }
                }
            }

            if (!this.isBot) {
                window.soundManager.playPunch(hitSomething);
            }
            return;
        }

        // Ateşli Silah
        if (this.isReloading) return;

        if (weapon.ammo <= 0) {
            this.startReload();
            return;
        }

        weapon.ammo--;
        this.lastShotTime = now;

        if (!this.isBot) {
            window.soundManager.playShoot(weapon.soundType);
        }

        const barrelLen = weapon.barrelLength || 25;
        const muzzleX = this.x + Math.cos(this.angle) * barrelLen;
        const muzzleY = this.y + Math.sin(this.angle) * barrelLen;

        const pelletCount = weapon.pellets || 1;
        for (let i = 0; i < pelletCount; i++) {
            const spread = (Math.random() - 0.5) * weapon.spread * 2;
            const bulletAngle = this.angle + spread;

            game.addBullet({
                x: muzzleX,
                y: muzzleY,
                vx: Math.cos(bulletAngle) * weapon.bulletSpeed,
                vy: Math.sin(bulletAngle) * weapon.bulletSpeed,
                damage: weapon.damage,
                range: weapon.range,
                traveled: 0,
                color: weapon.bulletColor,
                size: weapon.bulletSize,
                shooter: this,
                isRocket: !!weapon.isRocket
            });
        }

        if (weapon.ammo === 0) {
            this.startReload();
        }
    }

    takeDamage(amount, attacker, game) {
        if (this.isDead) return;

        if (this.isHealing) this.cancelHealing();

        let shieldDamage = 0;
        let healthDamage = 0;

        if (this.shield > 0) {
            shieldDamage = Math.min(this.shield, Math.round(amount * 0.7));
            this.shield -= shieldDamage;
            healthDamage = amount - shieldDamage;
        } else {
            healthDamage = amount;
        }

        this.health -= healthDamage;

        if (shieldDamage > 0) {
            window.particleManager.addDamageText(this.x, this.y, shieldDamage, 'shield');
        }
        if (healthDamage > 0) {
            window.particleManager.addDamageText(this.x, this.y, healthDamage, 'health');
            window.particleManager.createBlood(this.x, this.y, (attacker ? Math.atan2(this.y - attacker.y, this.x - attacker.x) : 0), 6);
        }

        if (!this.isBot) {
            window.soundManager.playHurt();
        }

        if (this.health <= 0) {
            this.health = 0;
            this.die(attacker, game);
        }
    }

    die(killer, game) {
        this.isDead = true;
        if (killer && killer !== this) {
            killer.kills = (killer.kills || 0) + 1;
        }

        window.particleManager.createBlood(this.x, this.y, 0, 16);

        // Sahip olduğu silah ve eşyaları haritaya düşür
        for (let i = 0; i < 2; i++) {
            const w = this.weapons[i];
            if (w) {
                game.map.groundItems.push({
                    x: this.x + (Math.random() - 0.5) * 40,
                    y: this.y + (Math.random() - 0.5) * 40,
                    type: 'weapon',
                    weaponId: w.id,
                    ammo: w.ammo,
                    bobOffset: Math.random() * Math.PI * 2
                });
            }
        }

        if (this.equippedScope) {
            game.map.groundItems.push({
                x: this.x + 20,
                y: this.y,
                type: 'item',
                itemId: this.equippedScope.id,
                bobOffset: 0
            });
        }

        if (this.backpackLevel > 0) {
            game.map.groundItems.push({
                x: this.x - 20,
                y: this.y,
                type: 'item',
                itemId: `backpack_${this.backpackLevel}`,
                bobOffset: 0
            });
        }

        game.map.spawnLoot(this.x, this.y);
        game.onEntityKilled(this, killer);
    }

    // Akıllı Otomatik Toplama ve Yakındaki Eşyaları Alma
    checkAutoLoot(game) {
        if (this.isDead) return;

        for (let i = game.map.groundItems.length - 1; i >= 0; i--) {
            const item = game.map.groundItems[i];
            const dist = Math.hypot(this.x - item.x, this.y - item.y);

            if (dist < this.radius + 20) {
                let picked = false;

                if (item.type === 'weapon') {
                    const def = window.WEAPONS[item.weaponId];
                    // Boş yuva varsa otomatik al, doluysa oyuncunun elindeki silahı bozma!
                    if (!this.weapons[0]) {
                        this.weapons[0] = { ...def, ammo: item.ammo };
                        this.activeWeaponIndex = 0;
                        picked = true;
                    } else if (!this.weapons[1]) {
                        this.weapons[1] = { ...def, ammo: item.ammo };
                        this.activeWeaponIndex = 1;
                        picked = true;
                    }
                } else if (item.type === 'item') {
                    const it = window.ITEM_TYPES[item.itemId];
                    if (!it) continue;

                    if (it.type === 'ammo') {
                        const maxCap = this.getMaxAmmo(it.ammoType);
                        const cur = this.ammoPouch[it.ammoType] || 0;
                        if (cur < maxCap) {
                            const toAdd = Math.min(it.amount, maxCap - cur);
                            this.ammoPouch[it.ammoType] = cur + toAdd;
                            picked = true;
                        }
                    } else if (it.type === 'armor') {
                        if (this.shield < 100) {
                            this.shield = Math.min(this.maxShield, this.shield + it.amount);
                            picked = true;
                        }
                    } else if (it.type === 'backpack') {
                        // Daha yüksek seviye çanta bulunursa otomatik kuşan!
                        if (it.level > this.backpackLevel) {
                            this.backpackLevel = it.level;
                            picked = true;
                            if (!this.isBot) {
                                window.particleManager.addDamageText(this.x, this.y, `${it.name} Kuşanıldı!`, 'heal');
                            }
                        }
                    } else if (it.type === 'scope') {
                        // Daha yüksek seviye dürbün bulunursa otomatik kuşan!
                        if (!this.equippedScope || it.level > this.equippedScope.level) {
                            this.equippedScope = it;
                            picked = true;
                            if (!this.isBot) {
                                window.particleManager.addDamageText(this.x, this.y, `${it.name} Takıldı!`, 'heal');
                            }
                        }
                    } else if (it.type === 'heal' || it.type === 'shield') {
                        const curCount = this.inventory[item.itemId] || 0;
                        if (curCount < this.getMaxItemCount()) {
                            this.inventory[item.itemId] = curCount + 1;
                            picked = true;
                        }
                    }
                }

                if (picked) {
                    game.map.groundItems.splice(i, 1);
                    if (!this.isBot) {
                        window.soundManager.playPickup();
                    }
                    break;
                }
            }
        }
    }

    // Yakındaki Eşyaları Alma (Botlar ve Butonlar İçin)
    pickupNearbyItem(game) {
        this.manualPickupItem(game);
    }

    // Manuel Eşya Değiştirme (E tuşuna basıldığında dolu yuvalı silahı takas eder)
    manualPickupItem(game) {
        for (let i = game.map.groundItems.length - 1; i >= 0; i--) {
            const item = game.map.groundItems[i];
            const dist = Math.hypot(this.x - item.x, this.y - item.y);

            if (dist < this.radius + 25) {
                if (item.type === 'weapon') {
                    const def = window.WEAPONS[item.weaponId];
                    const cur = this.weapons[this.activeWeaponIndex];
                    if (cur && cur.id !== 'fists') {
                        // Mevcut silahı yere bırak
                        game.map.groundItems.push({
                            x: this.x,
                            y: this.y,
                            type: 'weapon',
                            weaponId: cur.id,
                            ammo: cur.ammo,
                            bobOffset: 0
                        });
                    }
                    this.weapons[this.activeWeaponIndex] = { ...def, ammo: item.ammo };
                    game.map.groundItems.splice(i, 1);
                    window.soundManager.playPickup();
                    return;
                }
            }
        }
        // Eğer yerdeki silah değilse otomatik toplamayı tetikle
        this.checkAutoLoot(game);
    }

    update(dt, game) {
        if (this.isDead) return;

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        game.map.resolveEntityCollision(this);

        // Otomatik eşya toplama kontrolü
        this.checkAutoLoot(game);

        // Şarjör süreci
        if (this.isReloading) {
            this.reloadTimer -= dt * 1000;
            if (this.reloadTimer <= 0) {
                const w = this.getActiveWeapon();
                if (w && !w.unlimitedAmmo) {
                    const needed = w.magSize - w.ammo;
                    const available = this.ammoPouch[w.ammoType] || 0;
                    const toLoad = Math.min(needed, available);
                    w.ammo += toLoad;
                    this.ammoPouch[w.ammoType] -= toLoad;
                }
                this.isReloading = false;
            }
        }

        // İyileşme süreci
        if (this.isHealing) {
            this.healingTimer -= dt * 1000;
            if (this.healingTimer <= 0) {
                if (this.healingItem.type === 'heal') {
                    const healAmt = Math.min(this.healingItem.amount, this.healingItem.maxTarget - this.health);
                    this.health = Math.min(this.maxHealth, this.health + healAmt);
                    window.particleManager.addDamageText(this.x, this.y, healAmt, 'heal');
                } else if (this.healingItem.type === 'shield') {
                    const shieldAmt = Math.min(this.healingItem.amount, this.healingItem.maxTarget - this.shield);
                    this.shield = Math.min(this.maxShield, this.shield + shieldAmt);
                    window.particleManager.addDamageText(this.x, this.y, shieldAmt, 'shield');
                }
                window.particleManager.createHealEffect(this.x, this.y);
                this.inventory[this.healingItem.id]--;
                this.cancelHealing();
            }
        }

        if (this.punchAnim > 0) {
            this.punchAnim = Math.max(0, this.punchAnim - dt * 4);
        }

        if (game.storm && game.storm.isInStorm(this.x, this.y)) {
            const stormDamage = game.storm.dps * dt;
            this.takeDamage(stormDamage, null, game);
        }
    }

    draw(ctx, camera) {
        if (this.isDead) return;

        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(this.angle);

        // Gölge
        ctx.beginPath();
        ctx.arc(2, 4, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fill();

        // Sırt Çantası Görseli (Varsa sırtında çizilir)
        if (this.backpackLevel > 0) {
            ctx.beginPath();
            ctx.arc(-14, 0, 8 + this.backpackLevel, 0, Math.PI * 2);
            ctx.fillStyle = this.backpackLevel === 3 ? '#e67700' : this.backpackLevel === 2 ? '#5c940d' : '#868e96';
            ctx.fill();
            ctx.strokeStyle = '#212529';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        const activeWeapon = this.getActiveWeapon();

        // Silah / Eller Çizimi
        if (activeWeapon && activeWeapon.type !== 'melee') {
            const bLen = activeWeapon.barrelLength || 25;
            ctx.fillStyle = '#22252a';
            ctx.fillRect(8, -4, bLen - 6, 8);

            ctx.fillStyle = '#111215';
            ctx.fillRect(bLen - 2, -3, 6, 6);

            // Dürbün Varsa Silah Üstünde Çiz
            if (this.equippedScope) {
                ctx.fillStyle = '#343a40';
                ctx.fillRect(14, -6, 12, 4);
            }

            // Eller
            ctx.beginPath();
            ctx.arc(14, -10, 6, 0, Math.PI * 2);
            ctx.arc(20, 7, 6, 0, Math.PI * 2);
            ctx.fillStyle = this.skinColor;
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        } else {
            const punchDist = this.punchAnim * 12;
            const leftOffset = this.punchHand === 1 ? punchDist : 0;
            const rightOffset = this.punchHand === 0 ? punchDist : 0;

            ctx.beginPath();
            ctx.arc(12 + leftOffset, -12, 6.5, 0, Math.PI * 2);
            ctx.fillStyle = this.skinColor;
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(12 + rightOffset, 12, 6.5, 0, Math.PI * 2);
            ctx.fillStyle = this.skinColor;
            ctx.fill();
            ctx.stroke();
        }

        // Oyuncu Gövdesi
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.bodyColor;
        ctx.fill();
        ctx.strokeStyle = '#1a1c23';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Kalkan Görsel Halkası
        if (this.shield > 0) {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 3, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(51, 154, 240, ${0.4 + (this.shield / this.maxShield) * 0.4})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.restore();

        this.drawHealthBar(ctx, screenX, screenY);
    }

    drawHealthBar(ctx, sx, sy) {
        const barW = 44;
        const barH = 5;
        const barY = sy - this.radius - 14;

        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 3;
        ctx.fillText(this.name, sx, barY - 4);
        ctx.shadowBlur = 0;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(sx - barW / 2, barY, barW, barH);

        if (this.shield > 0) {
            const shieldRatio = Math.max(0, this.shield / this.maxShield);
            ctx.fillStyle = '#339af0';
            ctx.fillRect(sx - barW / 2, barY - 3, barW * shieldRatio, 2);
        }

        const healthRatio = Math.max(0, this.health / this.maxHealth);
        ctx.fillStyle = healthRatio > 0.5 ? '#51cf66' : healthRatio > 0.25 ? '#fcc419' : '#ff6b6b';
        ctx.fillRect(sx - barW / 2, barY, barW * healthRatio, barH);

        if (this.isReloading || this.isHealing) {
            const progress = this.isReloading ?
                1.0 - (this.reloadTimer / this.reloadDuration) :
                1.0 - (this.healingTimer / this.healingDuration);
            ctx.fillStyle = '#fab005';
            ctx.fillRect(sx - barW / 2, barY + barH + 2, barW * Math.max(0, Math.min(1, progress)), 3);
        }
    }
}

window.Player = Player;
