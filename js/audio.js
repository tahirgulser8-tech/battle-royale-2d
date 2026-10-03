// Web Audio API ile Prosedürel Ses Efektleri Motoru (Ses Düzeyi Ayarlı)
class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.masterVolume = 0.8;
        this.sfxVolume = 0.8;
        this.masterGain = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.masterVolume * this.sfxVolume, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
            this.initialized = true;
        } catch (e) {
            console.warn("Web Audio API desteklenmiyor:", e);
        }
    }

    setMasterVolume(val) {
        this.masterVolume = Math.max(0, Math.min(1, val));
        this.updateGain();
    }

    setSfxVolume(val) {
        this.sfxVolume = Math.max(0, Math.min(1, val));
        this.updateGain();
    }

    updateGain() {
        if (this.masterGain && this.ctx) {
            const effective = this.enabled ? (this.masterVolume * this.sfxVolume) : 0;
            this.masterGain.gain.setValueAtTime(effective, this.ctx.currentTime);
        }
    }

    ensureContext() {
        if (!this.initialized) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        this.updateGain();
    }

    // Yumruk Sallama / Vuruş Sesi
    playPunch(hit = false) {
        if (!this.enabled || !this.masterGain) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = hit ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(hit ? 180 : 320, now);
        osc.frequency.exponentialRampToValueAtTime(hit ? 40 : 80, now + (hit ? 0.15 : 0.1));

        gain.gain.setValueAtTime(hit ? 0.4 : 0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (hit ? 0.15 : 0.1));

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + (hit ? 0.15 : 0.1));
    }

    // Silah Ateşleme Sesleri
    playShoot(weaponType) {
        if (!this.enabled || !this.masterGain) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        if (weaponType === 'pistol') {
            this.createNoiseBuffer(0.08, (noiseGain) => {
                noiseGain.gain.setValueAtTime(0.3, now);
                noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            });
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(450, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.07);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + 0.07);
        } else if (weaponType === 'smg') {
            // MP5 sesi (hızlı, tok çıtırtı)
            this.createNoiseBuffer(0.06, (noiseGain) => {
                noiseGain.gain.setValueAtTime(0.25, now);
                noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
            });
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(380, now);
            osc.frequency.exponentialRampToValueAtTime(60, now + 0.05);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (weaponType === 'shotgun') {
            this.createNoiseBuffer(0.25, (noiseGain) => {
                noiseGain.gain.setValueAtTime(0.65, now);
                noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            });
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (weaponType === 'rifle' || weaponType === 'dmr') {
            this.createNoiseBuffer(0.12, (noiseGain) => {
                noiseGain.gain.setValueAtTime(0.4, now);
                noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
            });
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(weaponType === 'dmr' ? 340 : 280, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
            gain.gain.setValueAtTime(0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (weaponType === 'sniper') {
            this.createNoiseBuffer(0.45, (noiseGain) => {
                noiseGain.gain.setValueAtTime(0.8, now);
                noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
            });
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(350, now);
            osc.frequency.exponentialRampToValueAtTime(25, now + 0.4);
            gain.gain.setValueAtTime(0.7, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + 0.4);
        } else if (weaponType === 'rpg') {
            // Roket Fırlatma Sesi (Derin ıslık / vızıltı)
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(140, now);
            osc.frequency.linearRampToValueAtTime(450, now + 0.2);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + 0.35);
        }
    }

    // Şarjör Değiştirme
    playReload() {
        if (!this.enabled || !this.masterGain) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const playClick = (time, freq) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, time);
            gain.gain.setValueAtTime(0.12, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(time);
            osc.stop(time + 0.05);
        };
        playClick(now, 800);
        playClick(now + 0.2, 1200);
        playClick(now + 0.45, 600);
    }

    // Eşya Toplama Sesi
    playPickup() {
        if (!this.enabled || !this.masterGain) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.04);
            gain.gain.setValueAtTime(0.15, now + idx * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.1);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now + idx * 0.04);
            osc.stop(now + idx * 0.04 + 0.1);
        });
    }

    // Hasar Alma Sesi
    playHurt() {
        if (!this.enabled || !this.masterGain) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.12);
    }

    // Patlama Sesi
    playExplosion() {
        if (!this.enabled || !this.masterGain) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        this.createNoiseBuffer(0.7, (noiseGain) => {
            noiseGain.gain.setValueAtTime(0.9, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
        });
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.6);
        gain.gain.setValueAtTime(0.85, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.6);
    }

    // Sandık Kırma Sesi
    playCrateBreak() {
        if (!this.enabled || !this.masterGain) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        this.createNoiseBuffer(0.18, (noiseGain) => {
            noiseGain.gain.setValueAtTime(0.35, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        });
    }

    // Fırtına Uyarısı
    playStormAlert() {
        if (!this.enabled || !this.masterGain) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(330, now + 0.25);
        osc.frequency.linearRampToValueAtTime(220, now + 0.5);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.55);
    }

    // Zafer Fanfarı
    playVictory() {
        if (!this.enabled || !this.masterGain) return;
        this.ensureContext();
        if (!this.ctx) return;

        const notes = [
            { f: 392.00, d: 0.15 },
            { f: 523.25, d: 0.15 },
            { f: 659.25, d: 0.15 },
            { f: 783.99, d: 0.35 },
            { f: 659.25, d: 0.15 },
            { f: 783.99, d: 0.60 }
        ];
        let offset = 0;
        const now = this.ctx.currentTime;
        notes.forEach(n => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(n.f, now + offset);
            gain.gain.setValueAtTime(0.25, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, now + offset + n.d);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now + offset);
            osc.stop(now + offset + n.d);
            offset += n.d * 0.85;
        });
    }

    createNoiseBuffer(duration, callback) {
        if (!this.ctx || !this.masterGain) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();
        callback(gain);
        noise.connect(gain);
        gain.connect(this.masterGain);
        noise.start();
    }
}

window.soundManager = new SoundManager();
