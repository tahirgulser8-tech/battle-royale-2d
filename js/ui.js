// Kullanıcı Arayüzü, Şeffaf Mini Harita ve Büyük Taktik Haritası
class UIManager {
    constructor(game) {
        this.game = game;
        this.killFeed = [];
        this.showTacticalMap = false;
        this.currentRegionId = null;
        this.regionBannerTimer = 0;
        this.regionBannerText = '';

        this.touchControls = {
            active: false,
            move: {
                active: false,
                touchId: null,
                startX: 0,
                startY: 0,
                currX: 0,
                currY: 0,
                vx: 0,
                vy: 0
            },
            aim: {
                active: false,
                touchId: null,
                startX: 0,
                startY: 0,
                currX: 0,
                currY: 0,
                isShooting: false,
                angle: 0
            }
        };

        this.initTouchListeners();
    }

    toggleTacticalMap() {
        this.showTacticalMap = !this.showTacticalMap;
        if (this.showTacticalMap) {
            window.soundManager.ensureContext();
        }
    }

    initTouchListeners() {
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        if (isTouchDevice) {
            document.body.classList.add('touch-device');
        }

        window.addEventListener('touchstart', (e) => {
            window.soundManager.ensureContext();
            if (this.game.gameState !== 'PLAYING') return;

            // Eğer büyük harita açıksa ekrana dokunulduğunda haritayı kapat
            if (this.showTacticalMap) {
                this.showTacticalMap = false;
                return;
            }

            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                const x = touch.clientX;
                const y = touch.clientY;
                const screenW = window.innerWidth;

                // Mini haritaya dokunulduysa Büyük Taktik Haritasını Aç!
                if (x > screenW - 130 && y < 140) {
                    this.toggleTacticalMap();
                    return;
                }

                if (e.target.closest('.ui-interactive')) continue;

                // Sol ekran bölgesi (Hareket Joysticki)
                if (x < screenW * 0.42 && !this.touchControls.move.active) {
                    this.touchControls.move.active = true;
                    this.touchControls.move.touchId = touch.identifier;
                    this.touchControls.move.startX = x;
                    this.touchControls.move.startY = y;
                    this.touchControls.move.currX = x;
                    this.touchControls.move.currY = y;
                    this.touchControls.move.vx = 0;
                    this.touchControls.move.vy = 0;
                }
                // Sağ ekran bölgesi (Nişan & Ateş Joysticki)
                else if (x >= screenW * 0.48 && !this.touchControls.aim.active) {
                    this.touchControls.aim.active = true;
                    this.touchControls.aim.touchId = touch.identifier;
                    this.touchControls.aim.startX = x;
                    this.touchControls.aim.startY = y;
                    this.touchControls.aim.currX = x;
                    this.touchControls.aim.currY = y;
                    this.touchControls.aim.isShooting = true;
                }
            }
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (this.showTacticalMap) return;

            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];

                if (this.touchControls.move.active && touch.identifier === this.touchControls.move.touchId) {
                    this.touchControls.move.currX = touch.clientX;
                    this.touchControls.move.currY = touch.clientY;
                    const dx = touch.clientX - this.touchControls.move.startX;
                    const dy = touch.clientY - this.touchControls.move.startY;
                    const dist = Math.hypot(dx, dy);
                    const maxDist = 48;
                    const force = Math.min(1.0, dist / maxDist);
                    const ang = Math.atan2(dy, dx);

                    this.touchControls.move.vx = Math.cos(ang) * force;
                    this.touchControls.move.vy = Math.sin(ang) * force;
                }

                if (this.touchControls.aim.active && touch.identifier === this.touchControls.aim.touchId) {
                    this.touchControls.aim.currX = touch.clientX;
                    this.touchControls.aim.currY = touch.clientY;
                    const dx = touch.clientX - this.touchControls.aim.startX;
                    const dy = touch.clientY - this.touchControls.aim.startY;
                    if (Math.hypot(dx, dy) > 8) {
                        this.touchControls.aim.angle = Math.atan2(dy, dx);
                        this.touchControls.aim.isShooting = true;
                    }
                }
            }
        }, { passive: false });

        const endTouch = (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === this.touchControls.move.touchId) {
                    this.touchControls.move.active = false;
                    this.touchControls.move.touchId = null;
                    this.touchControls.move.vx = 0;
                    this.touchControls.move.vy = 0;
                }
                if (touch.identifier === this.touchControls.aim.touchId) {
                    this.touchControls.aim.active = false;
                    this.touchControls.aim.touchId = null;
                    this.touchControls.aim.isShooting = false;
                }
            }
        };

        window.addEventListener('touchend', endTouch);
        window.addEventListener('touchcancel', endTouch);
    }

    addKillMessage(killerName, victimName, weaponName) {
        this.killFeed.unshift({
            killer: killerName,
            victim: victimName,
            weapon: weaponName,
            time: Date.now()
        });
        if (this.killFeed.length > 4) {
            this.killFeed.pop();
        }
    }

    // Bölge Değişikliği Bildirimi
    checkRegionUpdate(player, map, dt) {
        if (!player || player.isDead) return;
        const current = map.getRegionAt(player.x, player.y);
        const newId = current ? current.id : null;

        if (newId !== this.currentRegionId) {
            this.currentRegionId = newId;
            if (current) {
                this.regionBannerText = `📍 ${current.name} (${current.desc})`;
                this.regionBannerTimer = 3.5;
            }
        }

        if (this.regionBannerTimer > 0) {
            this.regionBannerTimer -= dt;
        }
    }

    // Şık Bölge Bildirimi Çizimi
    drawRegionBanner(ctx) {
        if (this.regionBannerTimer <= 0) return;

        ctx.save();
        const alpha = Math.min(1.0, this.regionBannerTimer);
        ctx.globalAlpha = alpha;

        const text = this.regionBannerText;
        ctx.font = 'bold 15px sans-serif';
        const tw = ctx.measureText(text).width;
        const cx = window.innerWidth / 2;
        const cy = 68;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cx - tw / 2 - 16, cy - 14, tw + 32, 28, 14);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, cx, cy);
        ctx.restore();
    }

    // Mini Harita Çizimi
    drawMiniMap(ctx, map, storm, player) {
        const size = 115;
        const padding = 12;
        const x = window.innerWidth - size - padding;
        const y = padding;
        const scale = size / map.width;

        ctx.save();
        // Mini harita arka planı
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(x, y, size, size);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, size, size);

        // Üzerinde "Büyütmek İçin Dokun" ipucu
        ctx.font = '8px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('🔍 Dokun (Büyüt)', x + size / 2, y + size - 4);

        // Güvenli bölge (Beyaz)
        if (storm) {
            const tx = x + storm.target.x * scale;
            const ty = y + storm.target.y * scale;
            const tr = Math.max(0, storm.target.radius * scale);
            ctx.beginPath();
            ctx.arc(tx, ty, tr, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Fırtına (Mor)
            const cx = x + storm.current.x * scale;
            const cy = y + storm.current.y * scale;
            const cr = Math.max(0, storm.current.radius * scale);
            ctx.beginPath();
            ctx.arc(cx, cy, cr, 0, Math.PI * 2);
            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        // Oyuncu konumu
        if (player && !player.isDead) {
            const px = x + player.x * scale;
            const py = y + player.y * scale;

            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px + Math.cos(player.angle) * 7, py + Math.sin(player.angle) * 7);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#22c55e';
            ctx.fill();
        }

        ctx.restore();
    }

    // ==========================================
    // TAM EKRAN BÜYÜK TAKTİK HARİTASI (TACTICAL MAP)
    // ==========================================
    drawTacticalMapModal(ctx, map, storm, player) {
        if (!this.showTacticalMap) return;

        const w = window.innerWidth;
        const h = window.innerHeight;

        ctx.save();
        // Karartma katmanı
        ctx.fillStyle = 'rgba(8, 12, 18, 0.92)';
        ctx.fillRect(0, 0, w, h);

        // Harita Karesi Boyutu (Ekranın ortasında kare olarak sığdır)
        const mapSize = Math.min(w * 0.86, h * 0.82);
        const mapX = (w - mapSize) / 2;
        const mapY = (h - mapSize) / 2 + 10;
        const scale = mapSize / map.width;

        // Taktiksel Çerçeve
        ctx.fillStyle = '#2d6a4f';
        ctx.fillRect(mapX, mapY, mapSize, mapSize);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.strokeRect(mapX, mapY, mapSize, mapSize);

        // Başlık
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.fillText('🗺️ SAVAŞ ALANI TAKTİK HARİTASI', w / 2, mapY - 18);

        // Kapatma İpucu
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('[M] Tuşu veya Ekrana Dokunarak Kapat', w / 2, mapY + mapSize + 22);

        // 1. Nehir Çizimi
        for (const water of map.waterAreas) {
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(mapX + water.x * scale, mapY + water.y * scale, water.w * scale, water.h * scale);
        }

        // 2. Taktiksel Bölgeler ve İsim Etiketleri
        for (const reg of map.regions) {
            const rx = mapX + reg.x * scale;
            const ry = mapY + reg.y * scale;
            const rr = reg.radius * scale;

            // Bölge alanı dairesi
            ctx.beginPath();
            ctx.arc(rx, ry, rr, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // İkon ve Bölge Adı
            ctx.font = 'bold 12px sans-serif';
            ctx.fillStyle = '#ffd43b';
            ctx.textAlign = 'center';
            ctx.fillText(`${reg.icon} ${reg.name}`, rx, ry - 4);

            ctx.font = '10px sans-serif';
            ctx.fillStyle = '#cbd5e1';
            ctx.fillText(reg.desc, rx, ry + 12);
        }

        // 3. Fırtına (Mor Gaz)
        if (storm) {
            const cx = mapX + storm.current.x * scale;
            const cy = mapY + storm.current.y * scale;
            const cr = Math.max(0, storm.current.radius * scale);

            ctx.save();
            ctx.beginPath();
            ctx.rect(mapX, mapY, mapSize, mapSize);
            ctx.arc(cx, cy, cr, 0, Math.PI * 2, true);
            ctx.fillStyle = 'rgba(120, 20, 180, 0.35)';
            ctx.fill();

            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, cr, 0, Math.PI * 2);
            ctx.stroke();

            // Hedef Güvenli Bölge (Beyaz Kesikli Çember)
            const tx = mapX + storm.target.x * scale;
            const ty = mapY + storm.target.y * scale;
            const tr = Math.max(0, storm.target.radius * scale);
            ctx.setLineDash([8, 6]);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(tx, ty, tr, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }

        // 4. Oyuncunun Yanıp Sönen Konumu
        if (player && !player.isDead) {
            const px = mapX + player.x * scale;
            const py = mapY + player.y * scale;

            // Yanıp sönen yeşil sinyal halkası
            const pulseR = 6 + Math.sin(Date.now() * 0.008) * 4;
            ctx.beginPath();
            ctx.arc(px, py, pulseR, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(34, 197, 94, 0.7)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Oyuncu noktası
            ctx.beginPath();
            ctx.arc(px, py, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = '#22c55e';
            ctx.fill();

            // Baktığı yön çizgisi
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px + Math.cos(player.angle) * 14, py + Math.sin(player.angle) * 14);
            ctx.stroke();

            // "SEN" etiketi
            ctx.font = 'bold 11px sans-serif';
            ctx.fillStyle = '#4ade80';
            ctx.textAlign = 'center';
            ctx.fillText('SEN', px, py - 12);
        }

        ctx.restore();
    }

    drawVirtualJoysticks(ctx) {
        if (this.showTacticalMap) return;

        if (this.touchControls.move.active) {
            const m = this.touchControls.move;
            ctx.save();
            ctx.beginPath();
            ctx.arc(m.startX, m.startY, 42, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(m.currX, m.currY, 18, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(97, 175, 239, 0.5)';
            ctx.fill();
            ctx.restore();
        }

        if (this.touchControls.aim.active) {
            const a = this.touchControls.aim;
            ctx.save();
            ctx.beginPath();
            ctx.arc(a.startX, a.startY, 42, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 107, 107, 0.08)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 107, 107, 0.25)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(a.currX, a.currY, 18, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 107, 107, 0.55)';
            ctx.fill();
            ctx.restore();
        }
    }

    drawKillFeed(ctx) {
        if (this.showTacticalMap) return;

        const now = Date.now();
        const startX = window.innerWidth - 14;
        let startY = 145;

        ctx.save();
        ctx.textAlign = 'right';
        ctx.font = '11px sans-serif';

        for (let i = 0; i < this.killFeed.length; i++) {
            const k = this.killFeed[i];
            const age = (now - k.time) / 1000;
            if (age > 5) continue;

            const alpha = Math.max(0, 1 - (age / 5));
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.45})`;
            const text = `${k.killer} [${k.weapon}] ${k.victim}`;
            const metrics = ctx.measureText(text);

            ctx.fillRect(startX - metrics.width - 8, startY - 12, metrics.width + 10, 16);

            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
            ctx.fillText(text, startX - 3, startY);
            startY += 20;
        }
        ctx.restore();
    }
}

window.UIManager = UIManager;
