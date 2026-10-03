#!/data/data/com.termux/files/usr/bin/bash
# 2D Battle Royale Başlatıcı Betiği

cd /data/data/com.termux/files/home/battle-royale-2d || exit 1

PORT=8080

# Halihazırda 8080 portunu kullanan eski bir sunucu varsa durdur
pkill -f "python3 -m http.server $PORT" 2>/dev/null

echo "==================================================="
echo "  🎮 2D BATTLE ROYALE - SURVIVOR OYUNU BAŞLATILIYOR"
echo "==================================================="
echo "Sunucu adresi: http://localhost:$PORT"
echo "Tarayıcı açılıyor..."

# Arka planda sunucuyu başlat (nohup ve disown ile oturumdan bağımsız)
nohup python3 -m http.server $PORT > /data/data/com.termux/files/home/battle-royale-2d/server.log 2>&1 &
SERVER_PID=$!
disown $SERVER_PID

sleep 1

# Tarayıcıda aç
if command -v termux-open >/dev/null 2>&1; then
    termux-open "http://localhost:$PORT"
elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://localhost:$PORT"
fi

echo ""
echo "Oyun hazır! Tarayıcınızda açılmadıysa şu adresi girin:"
echo "👉 http://localhost:$PORT"
echo ""
echo "Sunucuyu kapatmak için: pkill -f 'python3 -m http.server 8080'"
