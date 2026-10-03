// Harita, Engeller ve Sürekli Çarpışma Denetimi (Raycasting)
class GameMap {
    constructor(width = 3400, height = 3400) {
        this.width = width;
        this.height = height;
        this.obstacles = [];
        this.groundItems = [];
        this.buildings = [];

        this.generateMap();
    }

    generateMap() {
        this.obstacles = [];
        this.groundItems = [];
        this.buildings = [];

        // 1. Askeri Sığınaklar / Binalar
        const buildingCount = 7;
        for (let i = 0; i < buildingCount; i++) {
            const bx = 300 + Math.random() * (this.width - 800);
            const by = 300 + Math.random() * (this.height - 800);
            const bw = 240 + Math.random() * 80;
            const bh = 200 + Math.random() * 80;
            this.createBuilding(bx, by, bw, bh);
        }

        // 2. Sandıklar
        const crateCount = 70;
        for (let i = 0; i < crateCount; i++) {
            const x = 120 + Math.random() * (this.width - 240);
            const y = 120 + Math.random() * (this.height - 240);
            if (!this.isPositionBlocked(x, y, 35)) {
                this.obstacles.push({
                    type: 'crate',
                    x, y,
                    width: 44,
                    height: 44,
                    health: 45,
                    maxHealth: 45,
                    isDestructible: true
                });
            }
        }

        // 3. Patlayıcı Variller
        const barrelCount = 35;
        for (let i = 0; i < barrelCount; i++) {
            const x = 120 + Math.random() * (this.width - 240);
            const y = 120 + Math.random() * (this.height - 240);
            if (!this.isPositionBlocked(x, y, 30)) {
                this.obstacles.push({
                    type: 'barrel',
                    x, y,
                    radius: 20,
                    health: 35,
                    maxHealth: 35,
                    isDestructible: true
                });
            }
        }

        // 4. Sert Kayalar
        const rockCount = 55;
        for (let i = 0; i < rockCount; i++) {
            const x = 100 + Math.random() * (this.width - 200);
            const y = 100 + Math.random() * (this.height - 200);
            const radius = 22 + Math.random() * 16;
            if (!this.isPositionBlocked(x, y, radius + 20)) {
                this.obstacles.push({
                    type: 'rock',
                    x, y,
                    radius: radius,
                    health: 9999,
                    isDestructible: false
                });
            }
        }

        // 5. Kamuflaj Ağaçları
        const treeCount = 90;
        for (let i = 0; i < treeCount; i++) {
            const x = 100 + Math.random() * (this.width - 200);
            const y = 100 + Math.random() * (this.height - 200);
            if (!this.isPositionBlocked(x, y, 35)) {
                this.obstacles.push({
                    type: 'tree',
                    x, y,
                    trunkRadius: 18,
                    canopyRadius: 52 + Math.random() * 14,
                    health: 9999,
                    isDestructible: false
                });
            }
        }

        this.spawnInitialLoot();
    }

    createBuilding(x, y, w, h) {
        const wallThick = 18;
        const doorSize = 64;

        this.buildings.push({ x, y, w, h });

        // Üst Duvar
        this.obstacles.push({
            type: 'wall',
            x: x + w / 2,
            y: y + wallThick / 2,
            width: w,
            height: wallThick
        });
        // Sol Duvar
        this.obstacles.push({
            type: 'wall',
            x: x + wallThick / 2,
            y: y + h / 2,
            width: wallThick,
            height: h
        });
        // Sağ Duvar
        this.obstacles.push({
            type: 'wall',
            x: x + w - wallThick / 2,
            y: y + h / 2,
            width: wallThick,
            height: h
        });
        // Alt Duvar (Kapı Açıklıklı)
        const leftWidth = (w - doorSize) / 2;
        this.obstacles.push({
            type: 'wall',
            x: x + leftWidth / 2,
            y: y + h - wallThick / 2,
            width: leftWidth,
            height: wallThick
        });
        this.obstacles.push({
            type: 'wall',
            x: x + w - leftWidth / 2,
            y: y + h - wallThick / 2,
            width: leftWidth,
            height: wallThick
        });

        // Oda içine nadir silah veya yüksek seviye dürbün/çanta
        this.spawnLoot(x + w / 2, y + h / 2, 'rare');
        this.spawnLoot(x + w / 3, y + h / 3);
    }

    isPositionBlocked(x, y, radius) {
        for (const obs of this.obstacles) {
            const dist = Math.hypot(obs.x - x, obs.y - y);
            if (obs.radius && dist < (obs.radius + radius)) return true;
            if (obs.width && dist < (Math.max(obs.width, obs.height) + radius)) return true;
        }
        return false;
    }

    // Başlangıç Ganimet Dağıtımı
    spawnInitialLoot() {
        const weaponPool = ['pistol', 'smg', 'shotgun', 'rifle', 'dmr', 'sniper', 'rpg'];
        const itemPool = [
            'scope_2x', 'scope_4x', 'scope_8x',
            'backpack_1', 'backpack_2', 'backpack_3',
            'medkit', 'bandage', 'shield_potion', 'armor_vest',
            'ammo_pistol', 'ammo_shotgun', 'ammo_rifle', 'ammo_sniper', 'ammo_rocket'
        ];

        for (let i = 0; i < 90; i++) {
            const x = 150 + Math.random() * (this.width - 300);
            const y = 150 + Math.random() * (this.height - 300);

            if (Math.random() < 0.45) {
                const wId = weaponPool[Math.floor(Math.random() * weaponPool.length)];
                this.groundItems.push({
                    x, y,
                    type: 'weapon',
                    weaponId: wId,
                    ammo: window.WEAPONS[wId].magSize * 2,
                    bobOffset: Math.random() * Math.PI * 2
                });
            } else {
                const itemId = itemPool[Math.floor(Math.random() * itemPool.length)];
                this.groundItems.push({
                    x, y,
                    type: 'item',
                    itemId: itemId,
                    bobOffset: Math.random() * Math.PI * 2
                });
            }
        }
    }

    spawnLoot(x, y, tier = 'normal') {
        const weapons = tier === 'rare' ? ['dmr', 'sniper', 'rpg', 'rifle'] : ['smg', 'shotgun', 'pistol', 'rifle'];
        const items = tier === 'rare' ?
            ['scope_4x', 'scope_8x', 'backpack_2', 'backpack_3', 'medkit', 'shield_potion', 'armor_vest', 'ammo_rocket'] :
            ['scope_2x', 'backpack_1', 'medkit', 'shield_potion', 'armor_vest', 'ammo_rifle', 'ammo_shotgun', 'bandage'];

        const pick = Math.random();
        if (pick < 0.55) {
            const wId = weapons[Math.floor(Math.random() * weapons.length)];
            this.groundItems.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                type: 'weapon',
                weaponId: wId,
                ammo: window.WEAPONS[wId].magSize * 2,
                bobOffset: Math.random() * Math.PI * 2
            });
        } else {
            const it = items[Math.floor(Math.random() * items.length)];
            this.groundItems.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                type: 'item',
                itemId: it,
                bobOffset: Math.random() * Math.PI * 2
            });
        }
    }

    damageObstacle(obs, amount, gameInstance) {
        if (!obs.isDestructible) return false;

        obs.health -= amount;
        if (obs.health <= 0) {
            const idx = this.obstacles.indexOf(obs);
            if (idx !== -1) this.obstacles.splice(idx, 1);

            if (obs.type === 'crate') {
                window.soundManager.playCrateBreak();
                window.particleManager.createWoodDebris(obs.x, obs.y, 14);
                this.spawnLoot(obs.x, obs.y, Math.random() < 0.3 ? 'rare' : 'normal');
            } else if (obs.type === 'barrel') {
                window.soundManager.playExplosion();
                window.particleManager.createExplosion(obs.x, obs.y);
                if (gameInstance) {
                    gameInstance.applyAreaDamage(obs.x, obs.y, 140, 95, null);
                }
            }
            return true;
        }
        return false;
    }

    // ==========================================
    // SÜREKLİ ÇARPIŞMA DENETİMİ (RAYCASTING / CCD)
    // Mermilerin duvardan geçmesini %100 engeller!
    // ==========================================
    checkRaycastObstacle(x1, y1, x2, y2) {
        let closestHit = null;
        let minFraction = 1.0;

        for (const obs of this.obstacles) {
            let hit = null;

            if (obs.type === 'wall' || obs.type === 'crate') {
                hit = this.raycastBox(x1, y1, x2, y2, obs.x - obs.width / 2, obs.y - obs.height / 2, obs.width, obs.height);
            } else if (obs.type === 'tree') {
                hit = this.raycastCircle(x1, y1, x2, y2, obs.x, obs.y, obs.trunkRadius);
            } else if (obs.type === 'rock' || obs.type === 'barrel') {
                hit = this.raycastCircle(x1, y1, x2, y2, obs.x, obs.y, obs.radius);
            }

            if (hit && hit.fraction < minFraction) {
                minFraction = hit.fraction;
                closestHit = {
                    obstacle: obs,
                    point: hit.point,
                    fraction: hit.fraction
                };
            }
        }

        return closestHit;
    }

    // Doğru Parçası - Dikdörtgen Kesişimi (Liang-Barsky Algoritması)
    raycastBox(x1, y1, x2, y2, bx, by, bw, bh) {
        const dx = x2 - x1;
        const dy = y2 - y1;

        let p = [-dx, dx, -dy, dy];
        let q = [x1 - bx, (bx + bw) - x1, y1 - by, (by + bh) - y1];

        let u1 = 0.0;
        let u2 = 1.0;

        for (let i = 0; i < 4; i++) {
            if (p[i] === 0) {
                if (q[i] < 0) return null;
            } else {
                const t = q[i] / p[i];
                if (p[i] < 0) {
                    if (t > u1) u1 = t;
                } else {
                    if (t < u2) u2 = t;
                }
            }
        }

        if (u1 > u2 || u1 > 1.0 || u2 < 0.0) return null;

        const fraction = Math.max(0, u1);
        return {
            fraction: fraction,
            point: {
                x: x1 + dx * fraction,
                y: y1 + dy * fraction
            }
        };
    }

    // Doğru Parçası - Daire Kesişimi
    raycastCircle(x1, y1, x2, y2, cx, cy, r) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy);
        if (len === 0) return null;

        const u = ((cx - x1) * dx + (cy - y1) * dy) / (len * len);
        const clampedU = Math.max(0, Math.min(1, u));

        const closestX = x1 + clampedU * dx;
        const closestY = y1 + clampedU * dy;

        const distSq = (cx - closestX) * (cx - closestX) + (cy - closestY) * (cy - closestY);
        if (distSq <= r * r) {
            return {
                fraction: clampedU,
                point: { x: closestX, y: closestY }
            };
        }
        return null;
    }

    resolveEntityCollision(entity) {
        entity.x = Math.max(entity.radius, Math.min(this.width - entity.radius, entity.x));
        entity.y = Math.max(entity.radius, Math.min(this.height - entity.radius, entity.y));

        for (const obs of this.obstacles) {
            if (obs.type === 'tree') {
                this.resolveCircleCollision(entity, obs.x, obs.y, obs.trunkRadius);
            } else if (obs.type === 'rock' || obs.type === 'barrel') {
                this.resolveCircleCollision(entity, obs.x, obs.y, obs.radius);
            } else if (obs.type === 'crate' || obs.type === 'wall') {
                this.resolveBoxCollision(entity, obs.x, obs.y, obs.width, obs.height);
            }
        }
    }

    resolveCircleCollision(entity, cx, cy, cRadius) {
        const dx = entity.x - cx;
        const dy = entity.y - cy;
        const dist = Math.hypot(dx, dy);
        const minDist = entity.radius + cRadius;

        if (dist < minDist && dist > 0.001) {
            const overlap = minDist - dist;
            entity.x += (dx / dist) * overlap;
            entity.y += (dy / dist) * overlap;
        }
    }

    resolveBoxCollision(entity, bx, by, bw, bh) {
        const halfW = bw / 2;
        const halfH = bh / 2;

        const closestX = Math.max(bx - halfW, Math.min(bx + halfW, entity.x));
        const closestY = Math.max(by - halfH, Math.min(by + halfH, entity.y));

        const dx = entity.x - closestX;
        const dy = entity.y - closestY;
        const dist = Math.hypot(dx, dy);

        if (dist < entity.radius) {
            if (dist > 0.001) {
                const overlap = entity.radius - dist;
                entity.x += (dx / dist) * overlap;
                entity.y += (dy / dist) * overlap;
            } else {
                entity.x += entity.radius;
            }
        }
    }

    drawGround(ctx, camera, viewW, viewH) {
        ctx.fillStyle = '#408035';
        ctx.fillRect(-camera.x, -camera.y, this.width, this.height);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        const gridSize = 100;
        const startX = Math.max(0, Math.floor(camera.x / gridSize) * gridSize);
        const endX = Math.min(this.width, startX + viewW + gridSize * 2);
        const startY = Math.max(0, Math.floor(camera.y / gridSize) * gridSize);
        const endY = Math.min(this.height, startY + viewH + gridSize * 2);

        ctx.beginPath();
        for (let x = startX; x <= endX; x += gridSize) {
            ctx.moveTo(x - camera.x, -camera.y);
            ctx.lineTo(x - camera.x, this.height - camera.y);
        }
        for (let y = startY; y <= endY; y += gridSize) {
            ctx.moveTo(-camera.x, y - camera.y);
            ctx.lineTo(this.width - camera.x, y - camera.y);
        }
        ctx.stroke();

        for (const b of this.buildings) {
            ctx.fillStyle = '#60646b';
            ctx.fillRect(b.x - camera.x, b.y - camera.y, b.w, b.h);
            ctx.strokeStyle = '#4e5259';
            ctx.strokeRect(b.x - camera.x, b.y - camera.y, b.w, b.h);
        }

        const time = Date.now() * 0.004;
        for (const item of this.groundItems) {
            const ix = item.x - camera.x;
            const iy = item.y - camera.y + Math.sin(time + item.bobOffset) * 3;

            ctx.save();
            ctx.beginPath();
            ctx.arc(ix, iy, 17, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 230, 100, 0.22)';
            ctx.fill();

            if (item.type === 'weapon') {
                const w = window.WEAPONS[item.weaponId];
                ctx.fillStyle = '#ffffff';
                ctx.font = '17px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(w ? (w.icon || '🔫') : '🔫', ix, iy);

                ctx.font = '10px sans-serif';
                ctx.fillStyle = '#f8f9fa';
                ctx.fillText(w ? w.name : 'Silah', ix, iy + 15);
            } else {
                const it = window.ITEM_TYPES[item.itemId];
                ctx.font = '16px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(it ? it.icon : '📦', ix, iy);

                ctx.font = '10px sans-serif';
                ctx.fillStyle = '#f8f9fa';
                ctx.fillText(it ? it.name : 'Eşya', ix, iy + 15);
            }
            ctx.restore();
        }
    }

    drawObstacles(ctx, camera) {
        for (const obs of this.obstacles) {
            const ox = obs.x - camera.x;
            const oy = obs.y - camera.y;

            if (obs.type === 'wall') {
                ctx.fillStyle = '#373a40';
                ctx.fillRect(ox - obs.width / 2, oy - obs.height / 2, obs.width, obs.height);
                ctx.strokeStyle = '#25262b';
                ctx.lineWidth = 2;
                ctx.strokeRect(ox - obs.width / 2, oy - obs.height / 2, obs.width, obs.height);
            } else if (obs.type === 'crate') {
                ctx.save();
                ctx.fillStyle = '#8d5b4c';
                ctx.fillRect(ox - obs.width / 2, oy - obs.height / 2, obs.width, obs.height);
                ctx.strokeStyle = '#5c3a21';
                ctx.lineWidth = 2.5;
                ctx.strokeRect(ox - obs.width / 2, oy - obs.height / 2, obs.width, obs.height);
                ctx.beginPath();
                ctx.moveTo(ox - obs.width / 2, oy - obs.height / 2);
                ctx.lineTo(ox + obs.width / 2, oy + obs.height / 2);
                ctx.moveTo(ox + obs.width / 2, oy - obs.height / 2);
                ctx.lineTo(ox - obs.width / 2, oy + obs.height / 2);
                ctx.stroke();
                ctx.restore();
            } else if (obs.type === 'barrel') {
                ctx.save();
                ctx.beginPath();
                ctx.arc(ox, oy, obs.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#d9383a';
                ctx.fill();
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#8a1f20';
                ctx.stroke();
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 13px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('⚠️', ox, oy);
                ctx.restore();
            } else if (obs.type === 'rock') {
                ctx.save();
                ctx.beginPath();
                ctx.arc(ox, oy, obs.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#79808a';
                ctx.fill();
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#555a61';
                ctx.stroke();
                ctx.restore();
            } else if (obs.type === 'tree') {
                ctx.save();
                ctx.beginPath();
                ctx.arc(ox, oy, obs.trunkRadius, 0, Math.PI * 2);
                ctx.fillStyle = '#5c3d2e';
                ctx.fill();
                ctx.strokeStyle = '#3d261b';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();
            }
        }
    }

    drawCanopies(ctx, camera, playerX, playerY) {
        for (const obs of this.obstacles) {
            if (obs.type !== 'tree') continue;

            const ox = obs.x - camera.x;
            const oy = obs.y - camera.y;

            const distToPlayer = Math.hypot(obs.x - playerX, obs.y - playerY);
            const isNear = distToPlayer < obs.canopyRadius + 20;

            ctx.save();
            ctx.globalAlpha = isNear ? 0.35 : 0.94;
            ctx.beginPath();
            ctx.arc(ox, oy, obs.canopyRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#2f6627';
            ctx.fill();
            ctx.strokeStyle = '#20461a';
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.restore();
        }
    }
}

window.GameMap = GameMap;
