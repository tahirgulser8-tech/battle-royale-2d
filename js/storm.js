// Fırtına ve Güvenli Bölge Mekaniği
class StormSystem {
    constructor(mapWidth, mapHeight) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;

        // Başlangıç çemberi (Tüm harita)
        this.current = {
            x: mapWidth / 2,
            y: mapHeight / 2,
            radius: Math.max(mapWidth, mapHeight) * 0.72
        };

        // Hedef güvenli çember
        this.target = {
            x: mapWidth / 2,
            y: mapHeight / 2,
            radius: Math.max(mapWidth, mapHeight) * 0.45
        };

        // Önceki çember (yumuşak geçiş için)
        this.start = { ...this.current };

        this.phase = 0;
        this.state = 'WAITING'; // 'WAITING' veya 'SHRINKING'
        this.timer = 18; // saniye
        this.elapsed = 0;
        this.shrinkDuration = 20;

        // Aşama Tanımları
        this.phases = [
            { waitTime: 15, shrinkTime: 22, targetRadiusRatio: 0.45, dps: 3 },
            { waitTime: 12, shrinkTime: 18, targetRadiusRatio: 0.25, dps: 6 },
            { waitTime: 10, shrinkTime: 15, targetRadiusRatio: 0.12, dps: 10 },
            { waitTime: 8, shrinkTime: 14, targetRadiusRatio: 0.04, dps: 16 },
            { waitTime: 5, shrinkTime: 12, targetRadiusRatio: 0.0, dps: 25 }
        ];

        this.dps = 3;
        this.generateNextTarget();
    }

    // Yeni güvenli bölge merkezini ve yarıçapını belirle
    generateNextTarget() {
        const p = this.phases[Math.min(this.phase, this.phases.length - 1)];
        this.dps = p.dps;
        const newRadius = Math.max(this.mapWidth, this.mapHeight) * p.targetRadiusRatio;

        // Yeni çember, eski çemberin sınırları içinde kalmalıdır
        const maxOffset = Math.max(0, this.current.radius - newRadius);
        const ang = Math.random() * Math.PI * 2;
        const dist = Math.random() * maxOffset * 0.8;

        this.start = { ...this.current };
        this.target = {
            x: Math.max(newRadius, Math.min(this.mapWidth - newRadius, this.current.x + Math.cos(ang) * dist)),
            y: Math.max(newRadius, Math.min(this.mapHeight - newRadius, this.current.y + Math.sin(ang) * dist)),
            radius: newRadius
        };

        this.state = 'WAITING';
        this.timer = p.waitTime;
        this.shrinkDuration = p.shrinkTime;
        this.elapsed = 0;
    }

    update(dt) {
        if (this.state === 'WAITING') {
            this.timer -= dt;
            if (this.timer <= 0) {
                this.state = 'SHRINKING';
                this.elapsed = 0;
                window.soundManager.playStormAlert();
            }
        } else if (this.state === 'SHRINKING') {
            this.elapsed += dt;
            const progress = Math.min(1.0, this.elapsed / this.shrinkDuration);

            // Yumuşak geçiş (ease-in-out)
            const t = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

            this.current.x = this.start.x + (this.target.x - this.start.x) * t;
            this.current.y = this.start.y + (this.target.y - this.start.y) * t;
            this.current.radius = this.start.radius + (this.target.radius - this.start.radius) * t;

            if (progress >= 1.0) {
                this.phase++;
                if (this.phase < this.phases.length) {
                    this.generateNextTarget();
                } else {
                    this.state = 'FINAL';
                }
            }
        }
    }

    // Bir noktanın fırtına içinde olup olmadığını kontrol et
    isInStorm(x, y) {
        const dx = x - this.current.x;
        const dy = y - this.current.y;
        return (dx * dx + dy * dy) > (this.current.radius * this.current.radius);
    }

    // Fırtınanın harita üzerindeki çizimi (Mor zehirli gaz tabakası)
    draw(ctx, camera) {
        const cx = this.current.x - camera.x;
        const cy = this.current.y - camera.y;

        ctx.save();
        // Dış alanı mor yarı saydam gazla kapla
        ctx.beginPath();
        // Harita dış kutusu
        ctx.rect(-camera.x, -camera.y, this.mapWidth, this.mapHeight);
        // Fırtına çemberini ters yönde kes
        ctx.arc(cx, cy, Math.max(0, this.current.radius), 0, Math.PI * 2, true);
        ctx.fillStyle = 'rgba(120, 20, 180, 0.38)';
        ctx.fill();

        // Fırtına kenar çizgisi (Işıltılı elektrikli mor çeper)
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#c084fc';
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(0, this.current.radius), 0, Math.PI * 2);
        ctx.stroke();

        // Hedef güvenli çember (Beyaz kesikli çizgi)
        if (this.state === 'WAITING' || this.state === 'SHRINKING') {
            const tx = this.target.x - camera.x;
            const ty = this.target.y - camera.y;
            ctx.setLineDash([12, 10]);
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(tx, ty, Math.max(0, this.target.radius), 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        ctx.restore();
    }
}

window.StormSystem = StormSystem;
