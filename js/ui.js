// Kullanıcı Arayüzü, Şeffaf Mini Harita ve Minimalist Dokunmatik Kontroller
class UIManager {
    constructor(game) {
        this.game = game;
        this.killFeed = [];

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

    initTouchListeners() {
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        if (isTouchDevice) {
            document.body.classList.add('touch-device');
        }

        window.addEventListener('touchstart', (e) => {
            window.soundManager.ensureContext();
            if (this.game.gameState !== 'PLAYING') return;

            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                const x = touch.clientX;
                const y = touch.clientY;
                const screenW = window.innerWidth;

                if (e.target.closest('.ui-interactive')) continue;

                // Sol ekran bölgesi (Hareket)
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
                // Sağ ekran bölgesi (Nişan & Ateş)
                else if (x >= screenW * 0.50 && !this.touchControls.aim.active) {
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
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];

                if (this.touchControls.move.active && touch.identifier === this.touchControls.move.touchId) {
                    this.touchControls.move.currX = touch.clientX;
                    this.touchControls.move.currY = touch.clientY;
                    const dx = touch.clientX - this.touchControls.move.startX;
                    const dy = touch.clientY - this.touchControls.move.startY;
                    const dist = Math.hypot(dx, dy);
                    const maxDist = 45;
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

    // Şeffaf, kompakt mini harita (Ekranda yer kaplamaz)
    drawMiniMap(ctx, map, storm, player) {
        const size = 115;
        const padding = 12;
        const x = window.innerWidth - size - padding;
        const y = padding;

        const scale = size / map.width;

        ctx.save();
        ctx.fillStyle = 'rgba(15, 18, 24, 0.65)';
        ctx.fillRect(x, y, size, size);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, size, size);

        if (storm) {
            const tx = x + storm.target.x * scale;
            const ty = y + storm.target.y * scale;
            const tr = Math.max(0, storm.target.radius * scale);

            ctx.beginPath();
            ctx.arc(tx, ty, tr, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            const cx = x + storm.current.x * scale;
            const cy = y + storm.current.y * scale;
            const cr = Math.max(0, storm.current.radius * scale);

            ctx.beginPath();
            ctx.arc(cx, cy, cr, 0, Math.PI * 2);
            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 1.6;
            ctx.stroke();
        }

        if (player && !player.isDead) {
            const px = x + player.x * scale;
            const py = y + player.y * scale;

            ctx.strokeStyle = '#51cf66';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px + Math.cos(player.angle) * 7, py + Math.sin(player.angle) * 7);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#51cf66';
            ctx.fill();
        }

        ctx.restore();
    }

    // Şeffaf, parmağın olduğu yerde beliren zarif sanal joystickler
    drawVirtualJoysticks(ctx) {
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

    // Küçük, şeffaf Kill Feed
    drawKillFeed(ctx) {
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
