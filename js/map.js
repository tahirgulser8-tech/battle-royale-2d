// Zengin Harita, Farklı Yapılar ve Taktiksel Bölgeler Motoru
class GameMap {
    constructor(width = 3600, height = 3600) {
        this.width = width;
        this.height = height;
        this.obstacles = [];
        this.groundItems = [];
        this.buildings = [];
        this.containers = [];
        this.paths = [];
        this.waterAreas = [];
        this.decorations = [];

        // Belirli Taktiksel Bölgeler
        this.regions = [
            { id: 'manor', name: 'Terk Edilmiş Köşk', x: 950, y: 800, radius: 280, icon: '🏛️', desc: 'Lüks Odalar ve Avlu' },
            { id: 'military', name: 'Askeri Üs', x: 2750, y: 750, radius: 300, icon: '🎖️', desc: 'Ağır Silah Cephaneliği' },
            { id: 'cave', name: 'Sisli Mağara', x: 2750, y: 2750, radius: 260, icon: '🪨', desc: 'Gizli Kristal Mağarası' },
            { id: 'docks', name: 'Konteyner Limanı', x: 850, y: 2750, radius: 290, icon: '📦', desc: 'Kargo Hangarları' },
            { id: 'village', name: 'Çam Dağ Köyü', x: 1800, y: 2100, radius: 250, icon: '🏕️', desc: 'Ahşap Dağ Kulübeleri' },
            { id: 'center', name: 'Vadi Meydanı', x: 1800, y: 1100, radius: 220, icon: '⚔️', desc: 'Açık Çatışma Alanı' }
        ];

        this.generateMap();
    }

    generateMap() {
        this.obstacles = [];
        this.groundItems = [];
        this.buildings = [];
        this.containers = [];
        this.waterAreas = [];
        this.decorations = [];

        // 1. Vadi Nehri ve Köprüler (Haritayı çapraz kesen mavi nehir)
        this.createRiver();

        // 2. Terk Edilmiş Köşk (Büyük lüks villa, ahşap zemin, odalar, avlu)
        this.createManor(750, 600);

        // 3. Askeri Üs (Beton sığınaklar, helipad, kum torbası siperleri, cephanelik)
        this.createMilitaryBase(2500, 550);

        // 4. Sisli Mağara (Karanlık zemin, kaya labirenti, parlayan kristaller)
        this.createCave(2550, 2550);

        // 5. Konteyner Limanı (Renkli endüstriyel kargo konteynerleri, hangarlar)
        this.createCargoDocks(650, 2550);

        // 6. Çam Dağ Köyü (Ahşap dağ evleri, kamp ateşi, çitler)
        this.createPineVillage(1650, 1950);

        // 7. Doğal Engeller (Rastgele ağaçlar, kayalar, kırmızı variller, sandıklar)
        this.populateWilderness();

        // 8. Zengin Ganimet Dağıtımı
        this.spawnInitialLoot();
    }

    // 1. Nehir ve Gölet
    createRiver() {
        // Vadiyi boydan boya geçen nehir segmentleri
        this.waterAreas.push({
            type: 'river',
            x: 1700, y: 0, w: 160, h: 3600
        });
        // Nehir üzerindeki 2 ahşap köprü
        this.decorations.push({ type: 'bridge', x: 1670, y: 1200, w: 220, h: 90 });
        this.decorations.push({ type: 'bridge', x: 1670, y: 2400, w: 220, h: 90 });
    }

    // 2. Terk Edilmiş Köşk
    createManor(x, y) {
        const mw = 420;
        const mh = 320;
        this.buildings.push({
            x, y, w: mw, h: mh,
            floorType: 'wood',
            name: 'Terk Edilmiş Köşk'
        });

        const wallT = 16;
        // Dış Duvarlar (Giriş kapısı açıklıklı)
        this.obstacles.push({ type: 'wall', x: x + mw / 2, y: y + wallT / 2, width: mw, height: wallT });
        this.obstacles.push({ type: 'wall', x: x + wallT / 2, y: y + mh / 2, width: wallT, height: mh });
        this.obstacles.push({ type: 'wall', x: x + mw - wallT / 2, y: y + mh / 2, width: wallT, height: mh });

        // Alt Duvar (Geniş çift kanat kapı)
        const doorW = 80;
        const sideW = (mw - doorW) / 2;
        this.obstacles.push({ type: 'wall', x: x + sideW / 2, y: y + mh - wallT / 2, width: sideW, height: wallT });
        this.obstacles.push({ type: 'wall', x: x + mw - sideW / 2, y: y + mh - wallT / 2, width: sideW, height: wallT });

        // İç Odalar (Salon, Kütüphane bölmeleri)
        this.obstacles.push({ type: 'wall', x: x + mw / 2, y: y + mh / 2, width: wallT, height: mh * 0.55 });
        this.obstacles.push({ type: 'wall', x: x + mw * 0.28, y: y + mh * 0.45, width: mw * 0.5, height: wallT });

        // Köşk içi altın sandıklar ve nadir silahlar
        this.spawnLoot(x + mw * 0.25, y + mh * 0.25, 'rare');
        this.spawnLoot(x + mw * 0.75, y + mh * 0.25, 'rare');
        this.spawnLoot(x + mw * 0.75, y + mh * 0.75, 'rare');
    }

    // 3. Askeri Üs
    createMilitaryBase(x, y) {
        const bw = 460;
        const bh = 360;
        this.buildings.push({
            x, y, w: bw, h: bh,
            floorType: 'concrete',
            name: 'Askeri Üs'
        });

        // Helipad sembolü dekorasyonu
        this.decorations.push({ type: 'helipad', x: x + 120, y: y + 120, radius: 65 });

        // Beton Sığınak Duvarları
        const wallT = 18;
        const bunkerX = x + 230;
        const bunkerY = y + 180;
        const bW = 200;
        const bH = 150;

        this.obstacles.push({ type: 'wall', x: bunkerX + bW / 2, y: bunkerY + wallT / 2, width: bW, height: wallT });
        this.obstacles.push({ type: 'wall', x: bunkerX + wallT / 2, y: bunkerY + bH / 2, width: wallT, height: bH });
        this.obstacles.push({ type: 'wall', x: bunkerX + bW - wallT / 2, y: bunkerY + bH / 2, width: wallT, height: bH });

        // Kum torbaları (Defansif koruma siperleri)
        for (let i = 0; i < 4; i++) {
            this.obstacles.push({
                type: 'sandbag',
                x: x + 60 + i * 80,
                y: y + bh - 20,
                width: 70,
                height: 18,
                health: 9999,
                isDestructible: false
            });
        }

        // Askeri mühimmat sandıkları ve ağır silahlar
        for (let i = 0; i < 4; i++) {
            this.obstacles.push({
                type: 'crate',
                x: bunkerX + 40 + (i % 2) * 80,
                y: bunkerY + 50 + Math.floor(i / 2) * 50,
                width: 44,
                height: 44,
                health: 50,
                maxHealth: 50,
                isDestructible: true
            });
        }
        this.spawnLoot(bunkerX + 100, bunkerY + 75, 'rare');
    }

    // 4. Sisli Mağara
    createCave(x, y) {
        const caveRadius = 240;
        this.buildings.push({
            x: x - caveRadius,
            y: y - caveRadius,
            w: caveRadius * 2,
            h: caveRadius * 2,
            floorType: 'cave',
            name: 'Sisli Mağara'
        });

        // Mağara etrafını çevreleyen dev kayalıklar
        const rockCount = 20;
        for (let i = 0; i < rockCount; i++) {
            const ang = (i / rockCount) * Math.PI * 2;
            if (i === 4 || i === 5) continue; // Mağara giriş açıklığı
            const rx = x + Math.cos(ang) * (caveRadius - 20);
            const ry = y + Math.sin(ang) * (caveRadius - 20);
            this.obstacles.push({
                type: 'rock',
                x: rx, y: ry,
                radius: 34 + Math.random() * 12,
                health: 9999,
                isDestructible: false
            });
        }

        // Mağara içi sarkıt ve parlayan kristal dekorasyonları
        this.decorations.push({ type: 'crystal', x: x - 50, y: y - 40, color: '#38bdf8' });
        this.decorations.push({ type: 'crystal', x: x + 60, y: y + 30, color: '#c084fc' });

        // Mağara içi gizli ganimetler
        this.spawnLoot(x, y, 'rare');
        this.spawnLoot(x + 40, y - 30, 'rare');
    }

    // 5. Konteyner Limanı & Depolar
    createCargoDocks(x, y) {
        const dw = 450;
        const dh = 360;
        this.buildings.push({
            x, y, w: dw, h: dh,
            floorType: 'docks',
            name: 'Konteyner Limanı'
        });

        // Renkli çelik kargo konteynerleri (Kırmızı, Mavi, Yeşil, Sarı)
        const containerColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
        const cWidth = 90;
        const cHeight = 42;

        const positions = [
            { cx: x + 80, cy: y + 80, rot: 0 },
            { cx: x + 80, cy: y + 150, rot: 0 },
            { cx: x + 240, cy: y + 90, rot: 1 },
            { cx: x + 340, cy: y + 90, rot: 1 },
            { cx: x + 160, cy: y + 250, rot: 0 },
            { cx: x + 280, cy: y + 250, rot: 0 }
        ];

        positions.forEach((p, idx) => {
            const w = p.rot === 1 ? cHeight : cWidth;
            const h = p.rot === 1 ? cWidth : cHeight;
            const color = containerColors[idx % containerColors.length];

            this.containers.push({ x: p.cx, y: p.cy, w, h, color });
            this.obstacles.push({
                type: 'container',
                x: p.cx + w / 2,
                y: p.cy + h / 2,
                width: w,
                height: h,
                color: color,
                health: 9999,
                isDestructible: false
            });
        });

        // Liman içi patlayıcı variller
        this.obstacles.push({ type: 'barrel', x: x + 190, y: y + 150, radius: 20, health: 35, isDestructible: true });
        this.obstacles.push({ type: 'barrel', x: x + 200, y: y + 180, radius: 20, health: 35, isDestructible: true });
        this.spawnLoot(x + 180, y + 100, 'rare');
    }

    // 6. Çam Dağ Köyü
    createPineVillage(x, y) {
        // 3 ahşap kulübe
        const cabins = [
            { cx: x + 40, cy: y + 40 },
            { cx: x + 260, cy: y + 50 },
            { cx: x + 150, cy: y + 240 }
        ];

        cabins.forEach((c) => {
            const cw = 140;
            const ch = 110;
            this.buildings.push({ x: c.cx, y: c.cy, w: cw, h: ch, floorType: 'wood', name: 'Ahşap Kulübe' });

            const wallT = 14;
            this.obstacles.push({ type: 'wall', x: c.cx + cw / 2, y: c.cy + wallT / 2, width: cw, height: wallT });
            this.obstacles.push({ type: 'wall', x: c.cx + wallT / 2, y: c.cy + ch / 2, width: wallT, height: ch });
            this.obstacles.push({ type: 'wall', x: c.cx + cw - wallT / 2, y: c.cy + ch / 2, width: wallT, height: ch });
            // Kapı boşluğu
            this.obstacles.push({ type: 'wall', x: c.cx + 35, y: c.cy + ch - wallT / 2, width: 70, height: wallT });

            this.spawnLoot(c.cx + cw / 2, c.cy + ch / 2);
        });

        // Köy meydanında kamp ateşi
        this.decorations.push({ type: 'campfire', x: x + 190, y: y + 150 });
    }

    // 7. Yaban Hayatı (Ağaçlar, Kayalar, Kırılabilir Sandıklar)
    populateWilderness() {
        // 75 Sandık
        for (let i = 0; i < 75; i++) {
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

        // 35 Patlayıcı Kırmızı Varil
        for (let i = 0; i < 35; i++) {
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

        // 55 Sert Kaya
        for (let i = 0; i < 55; i++) {
            const x = 100 + Math.random() * (this.width - 200);
            const y = 100 + Math.random() * (this.height - 200);
            const radius = 24 + Math.random() * 16;
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

        // 100 Kamuflaj Ağacı
        for (let i = 0; i < 100; i++) {
            const x = 100 + Math.random() * (this.width - 200);
            const y = 100 + Math.random() * (this.height - 200);
            if (!this.isPositionBlocked(x, y, 35)) {
                this.obstacles.push({
                    type: 'tree',
                    x, y,
                    trunkRadius: 18,
                    canopyRadius: 54 + Math.random() * 16,
                    health: 9999,
                    isDestructible: false
                });
            }
        }
    }

    isPositionBlocked(x, y, radius) {
        // Nehir kontrolü
        for (const w of this.waterAreas) {
            if (x >= w.x - radius && x <= w.x + w.w + radius) return true;
        }

        for (const obs of this.obstacles) {
            const dist = Math.hypot(obs.x - x, obs.y - y);
            if (obs.radius && dist < (obs.radius + radius)) return true;
            if (obs.width && dist < (Math.max(obs.width, obs.height) + radius)) return true;
        }
        return false;
    }

    spawnInitialLoot() {
        const weaponPool = ['pistol', 'smg', 'shotgun', 'rifle', 'dmr', 'sniper', 'rpg'];
        const itemPool = [
            'scope_2x', 'scope_4x', 'scope_8x',
            'backpack_1', 'backpack_2', 'backpack_3',
            'medkit', 'bandage', 'shield_potion', 'armor_vest',
            'ammo_pistol', 'ammo_shotgun', 'ammo_rifle', 'ammo_sniper', 'ammo_rocket'
        ];

        for (let i = 0; i < 100; i++) {
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
                // Sandıktan her zaman mermi ve ganimet fışkırır
                this.spawnLoot(obs.x, obs.y, Math.random() < 0.35 ? 'rare' : 'normal');
            } else if (obs.type === 'barrel') {
                window.soundManager.playExplosion();
                window.particleManager.createExplosion(obs.x, obs.y);
                if (gameInstance) {
                    gameInstance.applyAreaDamage(obs.x, obs.y, 150, 100, null);
                }
            }
            return true;
        }
        return false;
    }

    // Raycasting Sürekli Çarpışma Denetimi (CCD)
    checkRaycastObstacle(x1, y1, x2, y2) {
        let closestHit = null;
        let minFraction = 1.0;

        for (const obs of this.obstacles) {
            let hit = null;

            if (obs.type === 'wall' || obs.type === 'crate' || obs.type === 'sandbag' || obs.type === 'container') {
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
            point: { x: x1 + dx * fraction, y: y1 + dy * fraction }
        };
    }

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
            } else if (obs.type === 'crate' || obs.type === 'wall' || obs.type === 'sandbag' || obs.type === 'container') {
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

    // Oyuncunun bulunduğu bölgeyi bul
    getRegionAt(x, y) {
        for (const reg of this.regions) {
            if (Math.hypot(x - reg.x, y - reg.y) < reg.radius) {
                return reg;
            }
        }
        return null;
    }

    // Zemin ve Yapıları Çiz
    drawGround(ctx, camera, viewW, viewH) {
        // Çimen zemini
        ctx.fillStyle = '#3a7d32';
        ctx.fillRect(-camera.x, -camera.y, this.width, this.height);

        // İnce çim dokusu / ızgara
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
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

        // 1. Nehir Çizimi (Dalgalı mavi su)
        for (const water of this.waterAreas) {
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(water.x - camera.x, water.y - camera.y, water.w, water.h);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            // Su dalgaları
            const t = Date.now() * 0.002;
            for (let wy = 0; wy < this.height; wy += 80) {
                const waveX = water.x - camera.x + Math.sin(t + wy) * 12;
                ctx.fillRect(waveX + 20, wy - camera.y, water.w - 40, 6);
            }
        }

        // 2. Yapı Zeminleri (Köşk parkesi, Askeri beton, Mağara taşları)
        for (const b of this.buildings) {
            const bx = b.x - camera.x;
            const by = b.y - camera.y;

            if (b.floorType === 'wood') {
                // Ahşap Parke
                ctx.fillStyle = '#78350f';
                ctx.fillRect(bx, by, b.w, b.h);
                ctx.strokeStyle = '#451a03';
                ctx.lineWidth = 2;
                ctx.strokeRect(bx, by, b.w, b.h);
                // Parke çizgileri
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
                for (let px = bx; px < bx + b.w; px += 35) {
                    ctx.beginPath();
                    ctx.moveTo(px, by);
                    ctx.lineTo(px, by + b.h);
                    ctx.stroke();
                }
            } else if (b.floorType === 'concrete' || b.floorType === 'docks') {
                // Askeri / Liman Betonu
                ctx.fillStyle = '#475569';
                ctx.fillRect(bx, by, b.w, b.h);
                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 3;
                ctx.strokeRect(bx, by, b.w, b.h);
            } else if (b.floorType === 'cave') {
                // Mağara Karanlık Zemin
                ctx.beginPath();
                ctx.arc(bx + b.w / 2, by + b.h / 2, b.w / 2, 0, Math.PI * 2);
                ctx.fillStyle = '#1e1b18';
                ctx.fill();
            }
        }

        // 3. Dekorasyonlar (Köprüler, Helipad, Kristaller, Kamp Ateşi)
        for (const dec of this.decorations) {
            const dx = dec.x - camera.x;
            const dy = dec.y - camera.y;

            if (dec.type === 'bridge') {
                ctx.fillStyle = '#b45309';
                ctx.fillRect(dx, dy, dec.w, dec.h);
                ctx.strokeStyle = '#78350f';
                ctx.lineWidth = 3;
                ctx.strokeRect(dx, dy, dec.w, dec.h);
            } else if (dec.type === 'helipad') {
                ctx.beginPath();
                ctx.arc(dx, dy, dec.radius, 0, Math.PI * 2);
                ctx.strokeStyle = '#f8fafc';
                ctx.lineWidth = 4;
                ctx.stroke();
                ctx.font = 'bold 44px sans-serif';
                ctx.fillStyle = '#f8fafc';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('H', dx, dy);
            } else if (dec.type === 'crystal') {
                ctx.beginPath();
                ctx.arc(dx, dy, 12, 0, Math.PI * 2);
                ctx.fillStyle = dec.color;
                ctx.shadowColor = dec.color;
                ctx.shadowBlur = 15;
                ctx.fill();
                ctx.shadowBlur = 0;
            } else if (dec.type === 'campfire') {
                ctx.beginPath();
                ctx.arc(dx, dy, 16, 0, Math.PI * 2);
                ctx.fillStyle = '#78350f';
                ctx.fill();
                // Alev
                const flameR = 8 + Math.sin(Date.now() * 0.01) * 3;
                ctx.beginPath();
                ctx.arc(dx, dy, flameR, 0, Math.PI * 2);
                ctx.fillStyle = '#f97316';
                ctx.shadowColor = '#ea580c';
                ctx.shadowBlur = 12;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        // 4. Yerdeki Ganimetler
        const time = Date.now() * 0.004;
        for (const item of this.groundItems) {
            const ix = item.x - camera.x;
            const iy = item.y - camera.y + Math.sin(time + item.bobOffset) * 3;

            // Parlama aurası
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

    // Engelleri Çiz (Duvarlar, Konteynerler, Sandıklar, Kayalar)
    drawObstacles(ctx, camera) {
        for (const obs of this.obstacles) {
            const ox = obs.x - camera.x;
            const oy = obs.y - camera.y;

            if (obs.type === 'wall') {
                // Taş / Tuğla Duvar
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(ox - obs.width / 2, oy - obs.height / 2, obs.width, obs.height);
                ctx.strokeStyle = '#0f172a';
                ctx.lineWidth = 2;
                ctx.strokeRect(ox - obs.width / 2, oy - obs.height / 2, obs.width, obs.height);
            } else if (obs.type === 'container') {
                // Renkli Kargo Konteyneri
                ctx.save();
                ctx.fillStyle = obs.color || '#3b82f6';
                ctx.fillRect(ox - obs.width / 2, oy - obs.height / 2, obs.width, obs.height);
                ctx.strokeStyle = '#1e293b';
                ctx.lineWidth = 2.5;
                ctx.strokeRect(ox - obs.width / 2, oy - obs.height / 2, obs.width, obs.height);

                // Oluklu çelik çizgileri
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                const step = obs.width > obs.height ? 16 : 12;
                if (obs.width > obs.height) {
                    for (let lx = ox - obs.width / 2 + step; lx < ox + obs.width / 2; lx += step) {
                        ctx.beginPath();
                        ctx.moveTo(lx, oy - obs.height / 2);
                        ctx.lineTo(lx, oy + obs.height / 2);
                        ctx.stroke();
                    }
                } else {
                    for (let ly = oy - obs.height / 2 + step; ly < oy + obs.height / 2; ly += step) {
                        ctx.beginPath();
                        ctx.moveTo(ox - obs.width / 2, ly);
                        ctx.lineTo(ox + obs.width / 2, ly);
                        ctx.stroke();
                    }
                }
                ctx.restore();
            } else if (obs.type === 'sandbag') {
                // Kum Torbası Barikatı
                ctx.fillStyle = '#b45309';
                ctx.fillRect(ox - obs.width / 2, oy - obs.height / 2, obs.width, obs.height);
                ctx.strokeStyle = '#78350f';
                ctx.lineWidth = 2;
                ctx.strokeRect(ox - obs.width / 2, oy - obs.height / 2, obs.width, obs.height);
            } else if (obs.type === 'crate') {
                // Ahşap Sandık
                ctx.save();
                ctx.fillStyle = '#92400e';
                ctx.fillRect(ox - obs.width / 2, oy - obs.height / 2, obs.width, obs.height);
                ctx.strokeStyle = '#451a03';
                ctx.lineWidth = 2;
                ctx.strokeRect(ox - obs.width / 2, oy - obs.height / 2, obs.width, obs.height);
                ctx.beginPath();
                ctx.moveTo(ox - obs.width / 2, oy - obs.height / 2);
                ctx.lineTo(ox + obs.width / 2, oy + obs.height / 2);
                ctx.moveTo(ox + obs.width / 2, oy - obs.height / 2);
                ctx.lineTo(ox - obs.width / 2, oy + obs.height / 2);
                ctx.stroke();
                ctx.restore();
            } else if (obs.type === 'barrel') {
                // Kırmızı Varil
                ctx.save();
                ctx.beginPath();
                ctx.arc(ox, oy, obs.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#dc2626';
                ctx.fill();
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#7f1d1d';
                ctx.stroke();
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 12px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('⚠️', ox, oy);
                ctx.restore();
            } else if (obs.type === 'rock') {
                // Sert Kaya
                ctx.save();
                ctx.beginPath();
                ctx.arc(ox, oy, obs.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#64748b';
                ctx.fill();
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#475569';
                ctx.stroke();
                ctx.restore();
            } else if (obs.type === 'tree') {
                // Ağaç Gövdesi
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
            ctx.fillStyle = '#1e5e22';
            ctx.fill();
            ctx.strokeStyle = '#143d16';
            ctx.lineWidth = 3.5;
            ctx.stroke();
            ctx.restore();
        }
    }
}

window.GameMap = GameMap;
