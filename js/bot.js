// Akıllı Yapay Zeka Bot Sistemi
const BOT_NAMES = [
    'KurtKapanı', 'BordoBereli', 'PusucuDayı', 'Rüzgar_TR', 'EfsaneSniper',
    'CesurYürek', 'Atmaca34', 'Kasırga99', 'GölgeAvcı', 'Şahin_06',
    'AslanYürek', 'Bozkurt_1', 'FırtınaAli', 'AkrepKral', 'Yıldırım',
    'KorkusuzTR', 'DemirYumruk', 'Pars_35', 'KartalGözü', 'SonSamuray'
];

class Bot extends Player {
    constructor(x, y, name) {
        super(x, y, name || BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)], true);

        // Bot Yapay Zeka Ayarları
        this.visionRange = 550;
        this.targetEnemy = null;
        this.targetItem = null;
        this.targetObstacle = null;

        this.decisionTimer = 0;
        this.state = 'WANDER'; // 'WANDER', 'LOOT', 'FIGHT', 'FLEE_STORM', 'HEAL'

        this.wanderAngle = Math.random() * Math.PI * 2;
        this.strafeDir = Math.random() < 0.5 ? 1 : -1;
        this.strafeTimer = 0;

        this.aimInaccuracy = 0.08 + Math.random() * 0.08;
    }

    updateAI(dt, game) {
        if (this.isDead) return;

        this.decisionTimer -= dt;
        this.strafeTimer -= dt;
        if (this.strafeTimer <= 0) {
            this.strafeDir = -this.strafeDir;
            this.strafeTimer = 1.0 + Math.random() * 1.5;
        }

        // 1. Öncelik: Fırtınadan Kaçış
        const inStorm = game.storm && game.storm.isInStorm(this.x, this.y);
        const nearStorm = game.storm && Math.hypot(this.x - game.storm.target.x, this.y - game.storm.target.y) > (game.storm.target.radius - 80);

        if (inStorm || nearStorm) {
            this.state = 'FLEE_STORM';
            const safeX = game.storm.target.x;
            const safeY = game.storm.target.y;
            this.moveTowards(safeX, safeY);
            this.angle = Math.atan2(this.vy, this.vx);

            // Fırtınadan kaçarken de önüne düşman çıkarsa ateş edebilir
            this.checkForEnemies(game, 0.4);
            return;
        }

        // 2. Öncelik: Canı Azsa ve İyileşme Eşyası Varsa Can Basma
        if (this.health < 65 && !this.isHealing) {
            if (this.inventory.medkit > 0) {
                this.useItem('medkit');
            } else if (this.inventory.bandage > 0) {
                this.useItem('bandage');
            } else if (this.shield < 50 && this.inventory.shield_potion > 0) {
                this.useItem('shield_potion');
            }
        }

        // 3. Öncelik: Düşman Tespiti ve Çatışma
        const enemy = this.findNearestEnemy(game);
        if (enemy) {
            this.targetEnemy = enemy;
            this.state = 'FIGHT';
            this.handleCombat(dt, enemy, game);
            return;
        }

        // 4. Öncelik: Silahsızsa veya Etrafta Ganimet/Sandık Varsa Yağmalama
        const hasGun = this.weapons[0] || this.weapons[1];
        if (!hasGun || this.health < 80) {
            const item = this.findNearestGroundItem(game);
            if (item) {
                this.state = 'LOOT';
                this.moveTowards(item.x, item.y);
                this.angle = Math.atan2(item.y - this.y, item.x - this.x);
                this.checkAutoLoot(game);
                return;
            }

            const crate = this.findNearestCrate(game);
            if (crate) {
                this.state = 'LOOT';
                const dist = Math.hypot(crate.x - this.x, crate.y - this.y);
                if (dist > 35) {
                    this.moveTowards(crate.x, crate.y);
                } else {
                    this.vx = 0;
                    this.vy = 0;
                }
                this.angle = Math.atan2(crate.y - this.y, crate.x - this.x);
                this.shoot(game);
                return;
            }
        }

        // 5. Normal Dolaşma ve Keşif
        this.state = 'WANDER';
        if (this.decisionTimer <= 0) {
            this.wanderAngle += (Math.random() - 0.5) * 1.5;
            this.decisionTimer = 1.5 + Math.random() * 2.0;
        }

        this.vx = Math.cos(this.wanderAngle) * (this.speed * 0.7);
        this.vy = Math.sin(this.wanderAngle) * (this.speed * 0.7);
        this.angle = this.wanderAngle;

        // Yürürken üzerinden geçtiği eşyaları otomatik topla
        this.checkAutoLoot(game);
    }

    // Hedefe Doğru İlerle
    moveTowards(tx, ty, speedMult = 1.0) {
        const dx = tx - this.x;
        const dy = ty - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 5) {
            this.vx = (dx / dist) * this.speed * speedMult;
            this.vy = (dy / dist) * this.speed * speedMult;
        } else {
            this.vx = 0;
            this.vy = 0;
        }
    }

    // Çatışma Mantığı
    handleCombat(dt, enemy, game) {
        const dx = enemy.x - this.x;
        const dy = enemy.y - this.y;
        const dist = Math.hypot(dx, dy);

        // Hedefe nişan al (küçük sapma ile insansı nişan alma)
        const perfectAngle = Math.atan2(dy, dx);
        this.angle = perfectAngle + (Math.sin(Date.now() * 0.005) * this.aimInaccuracy);

        // Silah Tercihi Seç
        if (this.weapons[0] && this.weapons[0].type !== 'melee') {
            this.activeWeaponIndex = 0;
        } else if (this.weapons[1] && this.weapons[1].type !== 'melee') {
            this.activeWeaponIndex = 1;
        }

        const weapon = this.getActiveWeapon();
        const preferredDist = weapon.id === 'shotgun' ? 110 :
            weapon.id === 'smg' ? 160 :
            (weapon.id === 'sniper' || weapon.id === 'dmr') ? 450 :
            weapon.id === 'rpg' ? 320 : 240;

        // Düşmana göre konumlanma (strafe ve mesafeyi koruma)
        const perpX = -Math.sin(this.angle) * this.strafeDir;
        const perpY = Math.cos(this.angle) * this.strafeDir;

        let moveX = perpX * 0.6;
        let moveY = perpY * 0.6;

        if (dist > preferredDist + 40) {
            // Yaklaş
            moveX += (dx / dist) * 0.8;
            moveY += (dy / dist) * 0.8;
        } else if (dist < preferredDist - 40) {
            // Geri çekil
            moveX -= (dx / dist) * 0.8;
            moveY -= (dy / dist) * 0.8;
        }

        const totalLen = Math.hypot(moveX, moveY) || 1;
        this.vx = (moveX / totalLen) * this.speed;
        this.vy = (moveY / totalLen) * this.speed;

        // Görüş hattı engellenmemişse ateş et
        if (dist < (weapon.range || 500)) {
            this.shoot(game);
        }
    }

    // En Yakın Düşmanı Bul (Oyuncu veya diğer botlar)
    findNearestEnemy(game) {
        let nearest = null;
        let minDist = this.visionRange;

        // İnsan Oyuncu Kontrolü
        if (!game.player.isDead) {
            const d = Math.hypot(game.player.x - this.x, game.player.y - this.y);
            if (d < minDist) {
                nearest = game.player;
                minDist = d;
            }
        }

        // Diğer Botlar Kontrolü
        for (const bot of game.bots) {
            if (bot === this || bot.isDead) continue;
            const d = Math.hypot(bot.x - this.x, bot.y - this.y);
            if (d < minDist) {
                nearest = bot;
                minDist = d;
            }
        }

        return nearest;
    }

    checkForEnemies(game, prob = 0.5) {
        if (Math.random() < prob) {
            const enemy = this.findNearestEnemy(game);
            if (enemy) {
                const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
                if (dist < 400) {
                    this.angle = Math.atan2(enemy.y - this.y, enemy.x - this.x);
                    this.shoot(game);
                }
            }
        }
    }

    // En Yakın Sandığı Bul
    findNearestCrate(game) {
        let nearest = null;
        let minDist = 400;
        for (const obs of game.map.obstacles) {
            if (obs.type === 'crate') {
                const d = Math.hypot(obs.x - this.x, obs.y - this.y);
                if (d < minDist) {
                    minDist = d;
                    nearest = obs;
                }
            }
        }
        return nearest;
    }

    // En Yakın Yer Ganimetini Bul
    findNearestGroundItem(game) {
        let nearest = null;
        let minDist = 450;
        for (const item of game.map.groundItems) {
            const d = Math.hypot(item.x - this.x, item.y - this.y);
            if (d < minDist) {
                minDist = d;
                nearest = item;
            }
        }
        return nearest;
    }

    update(dt, game) {
        if (this.isDead) return;
        this.updateAI(dt, game);
        super.update(dt, game);
    }
}

window.Bot = Bot;
