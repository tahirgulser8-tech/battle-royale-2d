// Parçacık ve Görsel Efekt Sistemi
class ParticleManager {
    constructor() {
        this.particles = [];
        this.damageTexts = [];
        this.bulletTracers = [];
    }

    // Mermi İzi Ekle
    addTracer(x1, y1, x2, y2, color = '#ffe066', width = 2) {
        this.bulletTracers.push({
            x1, y1, x2, y2,
            color,
            width,
            alpha: 1.0,
            decay: 0.12
        });
    }

    // Hasar / İyileşme Sayısı
    addDamageText(x, y, text, type = 'health') {
        let color = '#ff4d4f'; // Kırmızı (Can hasarı)
        let fontSize = 16;
        let prefix = '-';

        if (type === 'shield') {
            color = '#40a9ff'; // Mavi (Kalkan hasarı)
        } else if (type === 'crit') {
            color = '#faad14'; // Sarı (Kritik vuruş)
            fontSize = 20;
        } else if (type === 'heal') {
            color = '#52c41a'; // Yeşil (Can yenileme)
            prefix = '+';
        }

        this.damageTexts.push({
            x: x + (Math.random() - 0.5) * 16,
            y: y - 10,
            text: prefix + text,
            color,
            fontSize,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -2.2 - Math.random() * 1.0,
            alpha: 1.0,
            decay: 0.025
        });
    }

    // Kan Efekti
    createBlood(x, y, angle, count = 7) {
        for (let i = 0; i < count; i++) {
            const spread = (Math.random() - 0.5) * 1.2;
            const speed = 2 + Math.random() * 4.5;
            this.particles.push({
                x, y,
                vx: Math.cos(angle + spread) * speed,
                vy: Math.sin(angle + spread) * speed,
                size: 2.5 + Math.random() * 2.5,
                color: '#d32f2f',
                alpha: 0.9,
                decay: 0.035,
                friction: 0.92,
                type: 'circle'
            });
        }
    }

    // Sandık Kırılma Tahta Parçacıkları
    createWoodDebris(x, y, count = 12) {
        const colors = ['#8d6e63', '#a1887f', '#6d4c41', '#d7ccc8'];
        for (let i = 0; i < count; i++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = 2 + Math.random() * 5;
            this.particles.push({
                x, y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                size: 3 + Math.random() * 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1.0,
                decay: 0.025,
                friction: 0.9,
                rotation: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.3,
                type: 'rect'
            });
        }
    }

    // Kırmızı Varil Patlama Efekti (Alev, Şok Dalgası, Duman)
    createExplosion(x, y) {
        // Şok Dalgası Çemberi
        this.particles.push({
            x, y,
            radius: 5,
            maxRadius: 130,
            growSpeed: 9,
            color: 'rgba(255, 200, 50, 0.7)',
            lineWidth: 6,
            alpha: 1.0,
            decay: 0.045,
            type: 'shockwave'
        });

        // Alev Kıvılcımları
        for (let i = 0; i < 28; i++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = 3 + Math.random() * 8;
            const colors = ['#ff4d4f', '#ff7a45', '#ffa940', '#ffec3d'];
            this.particles.push({
                x, y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                size: 5 + Math.random() * 8,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1.0,
                decay: 0.03,
                friction: 0.92,
                type: 'circle'
            });
        }

        // Duman Parçacıkları
        for (let i = 0; i < 15; i++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = 1 + Math.random() * 3;
            this.particles.push({
                x, y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                size: 10 + Math.random() * 12,
                color: '#555555',
                alpha: 0.6,
                decay: 0.015,
                friction: 0.95,
                type: 'circle'
            });
        }
    }

    // İyileşme Artı Simgeleri
    createHealEffect(x, y) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 25,
                y: y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 0.8,
                vy: -1.5 - Math.random() * 1.5,
                size: 12,
                color: '#52c41a',
                alpha: 1.0,
                decay: 0.03,
                type: 'plus'
            });
        }
    }

    update() {
        // Parçacıkları güncelle
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            if (p.type === 'shockwave') {
                p.radius += p.growSpeed;
                p.alpha -= p.decay;
            } else {
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= (p.friction || 0.98);
                p.vy *= (p.friction || 0.98);
                if (p.rotation !== undefined) {
                    p.rotation += p.vRot;
                }
                p.alpha -= p.decay;
            }

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Hasar yazılarını güncelle
        for (let i = this.damageTexts.length - 1; i >= 0; i--) {
            const dt = this.damageTexts[i];
            dt.x += dt.vx;
            dt.y += dt.vy;
            dt.vy *= 0.96;
            dt.alpha -= dt.decay;
            if (dt.alpha <= 0) {
                this.damageTexts.splice(i, 1);
            }
        }

        // Mermi izlerini güncelle
        for (let i = this.bulletTracers.length - 1; i >= 0; i--) {
            const bt = this.bulletTracers[i];
            bt.alpha -= bt.decay;
            if (bt.alpha <= 0) {
                this.bulletTracers.splice(i, 1);
            }
        }
    }

    draw(ctx, camera) {
        // Mermi izleri
        ctx.save();
        for (const bt of this.bulletTracers) {
            ctx.globalAlpha = Math.max(0, bt.alpha);
            ctx.strokeStyle = bt.color;
            ctx.lineWidth = bt.width;
            ctx.beginPath();
            ctx.moveTo(bt.x1 - camera.x, bt.y1 - camera.y);
            ctx.lineTo(bt.x2 - camera.x, bt.y2 - camera.y);
            ctx.stroke();
        }
        ctx.restore();

        // Parçacıklar
        ctx.save();
        for (const p of this.particles) {
            ctx.globalAlpha = Math.max(0, p.alpha);
            if (p.type === 'shockwave') {
                ctx.strokeStyle = p.color;
                ctx.lineWidth = p.lineWidth;
                ctx.beginPath();
                ctx.arc(p.x - camera.x, p.y - camera.y, p.radius, 0, Math.PI * 2);
                ctx.stroke();
            } else if (p.type === 'circle') {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x - camera.x, p.y - camera.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'rect') {
                ctx.save();
                ctx.translate(p.x - camera.x, p.y - camera.y);
                ctx.rotate(p.rotation || 0);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            } else if (p.type === 'plus') {
                ctx.fillStyle = p.color;
                const s = p.size;
                const px = p.x - camera.x;
                const py = p.y - camera.y;
                ctx.fillRect(px - s / 6, py - s / 2, s / 3, s);
                ctx.fillRect(px - s / 2, py - s / 6, s, s / 3);
            }
        }
        ctx.restore();

        // Hasar Yazıları
        ctx.save();
        for (const dt of this.damageTexts) {
            ctx.globalAlpha = Math.max(0, dt.alpha);
            ctx.fillStyle = dt.color;
            ctx.font = `bold ${dt.fontSize}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 4;
            ctx.fillText(dt.text, dt.x - camera.x, dt.y - camera.y);
        }
        ctx.restore();
    }
}

window.particleManager = new ParticleManager();
