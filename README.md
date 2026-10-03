# 🎮 2D Battle Royale - Survivor

HTML5 Canvas ve saf JavaScript (Vanilla JS) ile geliştirilmiş, hem bilgisayarda (klavye/fare) hem de mobil dokunmatik ekranlarda (çift sanal joystick) oynanabilen 2D Battle Royale oyunu.

---

## 🌟 Oyunun Özellikleri

1. **25 Kişilik Hayatta Kalma Mücadelesi:**
   - 1 Oyuncu + 24 Akıllı Yapay Zeka Botu.
   - Gerçekçi Türkçe bot isimleri (KurtKapanı, BordoBereli, PusucuDayı vb.).

2. **Dinamik Fırtına (Gaz Çemberi):**
   - Belirli aralıklarla haritanın rastgele bir noktasına doğru daralan güvenli bölge.
   - Fırtınanın dışında kalanlar saniye başına hasar alır.

3. **Geniş Taktiksel Harita (3400x3400):**
   - **Kamuflaj Ağaçları:** Altına girdiğinizde yapraklar şeffaflaşır, pusu kurmanızı sağlar. Gövdesi mermileri engeller.
   - **Sert Kayalar & Askeri Sığınaklar:** Mermileri durduran güçlü siperler.
   - **Kırılabilir Tahta Sandıklar:** Ateş ederek veya yumruklayarak kırıldığında içinden rastgele silah, cephane veya can kiti çıkar.
   - **Patlayıcı Kırmızı Variller:** Vurulduğunda büyük bir patlama oluşturarak çevredeki düşmanlara ve yapılara ağır alan hasarı verir.

4. **Silahlar ve Teçhizat:**
   - 👊 **Yumruk:** Yakın dövüş, hızlı vuruş.
   - 🔫 **Glock-18 Tabanca:** Seri tekli atış, orta menzil.
   - 💥 **SPAS-12 Pompalı:** 6 saçma ile yakın mesafede ölümcül hasar.
   - ⚡ **AK-47 Otomatik:** Yüksek atış hızı ve hasar dengesi.
   - 🎯 **AWM Keskin Nişancı:** Uzun menzilli, tek vuruşta ağır hasar veren keskin nişancı tüfeği.
   - 🔥 **M134 Vulcan:** Süper seri mini-gun.
   - 🩹 **Sargı Bezi & Büyük Can Kiti:** Sağlık yenileme.
   - 🛡️ **Kalkan İksiri & Çelik Yelek:** Mavi kalkan zırhı (alınan hasarın %70'ini emer).

5. **Ses ve Görsel Efektler:**
   - Web Audio API ile sıfır harici dosya bağımlılığıyla dinamik olarak sentezlenen silah, patlama, vuruş, şarjör ve zafer sesleri.
   - Mermi izleri, kan sıçramaları, tahta parçacıkları ve havada süzülen renkli hasar sayıları (Can, Kalkan, Kritik).

6. **Canlı Mini Harita & Arayüz:**
   - Sağ üstte mini harita: Güvenli bölge (beyaz), fırtına (mor) ve oyuncu konumu.
   - Sol üstte canlı kalan oyuncu sayısı ve leş (kill) sayacı.
   - Sağ üstte anlık öldürme akışı (kill feed).

---

## 🕹️ Kontroller

### 🖥️ PC / Klavye & Fare
- **W, A, S, D** veya **Yön Tuşları:** Hareket
- **Fare Hareketi:** Nişan alma
- **Sol Fare Tık:** Ateş etme / Yumruk atma
- **E** veya **Boşluk (Space):** Yerdeki silah veya eşyayı alma
- **R:** Şarjör doldurma
- **1, 2, 3:** Silah seçimi (Birincil / İkincil / Yumruk)
- **4, 5, 6:** Sargı bezi, can kiti veya kalkan kullanma
- **M:** Sesleri aç / kapat

### 📱 Mobil / Dokunmatik
- **Sol Ekran Bölgesi:** Sanal Hareket Joysticki
- **Sağ Ekran Bölgesi:** Sanal Nişan & Otomatik Ateş Joysticki
- **🖐️ AL Butonu:** Yakındaki eşyayı toplama
- **🔄 DOLDUR Butonu:** Şarjör yenileme
- **🩹 CAN BAS Butonu:** Çantadaki can/kalkan kitini kullanma
- **Alt Yuvalar:** Silah yuvalarına dokunarak anında silah değiştirme

---

## 🚀 Oyunu Başlatma

Termux terminalinde:
```bash
./start_game.sh
```
Tarayıcınızda açılmazsa doğrudan şu adrese gidin:
👉 `http://127.0.0.1:8080`

Sunucuyu durdurmak için:
```bash
pkill -f 'python3 -m http.server 8080'
```
