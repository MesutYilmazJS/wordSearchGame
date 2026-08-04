# 🧩 Kelime Avı - Seviyeli Bulmaca Oyunu

![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)

Modern, şık tasarımlı ve seviye temalı **Kelime Avı (Word Search)** web ve mobil uyumlu zeka oyunu. 

Zihnini geliştirmek ve saklı kelimeleri bulmak isteyenler için 50 benzersiz seviye, interaktif ses efektleri, mağaza/ipucu sistemi ve responsive dinamik arayüz sunar.

---

## ✨ Özellikler

- 🎯 **50 Farklı Tematik Seviye:** Meyveler, Renkler, Hayvanlar, Kodlama, Uzay Bilimi, Geometri ve Büyük Final'e uzanan zengin kelime havuzu.
- 📐 **Dinamik Izgara Boyutu:** 6x6'dan başlayıp seviye ilerledikçe 15x15 boyutuna kadar büyüyen bulmaca matrisleri.
- 🔊 **Ses ve Titreşim (Haptics):** Web Audio API ile sentezlenen harf seçimi, kelime bulma, bölüm tamamlama sesleri ve mobil cihazlar için haptik bildirimler.
- 🛍️ **İpucu ve Mağaza Sistemi:** Altın biriktirerek ipucu satın alma, tema özelleştirmeleri ve altın paketleri.
- 📱 **Mobil ve Dokunmatik Uyumlu:** Dokunmatik sürükle-bırak (touch/drag) kelime seçimi, ekran boyutuna tam uyumlu (Safe Area) responsive responsive layout.
- 💾 **Kaldığın Yerden Devam Et:** `LocalStorage` entegrasyonu ile seviye ilerlemesi ve altın bakiyesi otomatik kaydedilir.
- 🚀 **Capacitor / AdMob Altyapısı:** Mobil uygulamaya (Android/iOS) dönüştürmeye hazır mobil köprü (`mobileBridge.js`) altyapısı.

---

## 🛠️ Teknolojiler

- **Core:** HTML5, Vanilla JavaScript (ES Modules)
- **Styling:** [Tailwind CSS v3](https://tailwindcss.com/), Custom Animations & Glassmorphism design
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Audio:** Web Audio API (Harici ses dosyası bağımlılığı olmadan dinamik ses sentezi)
- **Mobile Integration:** MobileBridge (Capacitor & AdMob entegrasyonuna hazır yapı)

---

## 🚀 Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

### 1. Bağımlılıkları Yükleyin
```bash
npm install
```

### 2. Geliştirici Sunucusunu Başlatın
```bash
npm run dev
```
Sunucu başlatıldıktan sonra tarayıcınızda `http://localhost:5173/` adresine gidin.

### 3. Production Derlemesi (Build)
```bash
npm run build
```

### 4. Build Önizlemesi (Preview)
```bash
npm run preview
```

---

## 📁 Proje Yapısı

```text
wordSearchGame/
├── index.html          # Ana HTML yapısı ve ekran modalları
├── package.json        # Bağımlılıklar ve npm komutları
├── tailwind.config.js  # Tailwind özelleştirmeleri ve renk paleti
├── postcss.config.js   # PostCSS konfigürasyonu
└── src/
    ├── main.js         # Oyun mantığı, olay dinleyicileri, audio & state yönetimi
    ├── levels.js       # 50 seviyenin kelime ve boyut tanımlamaları
    ├── style.css       # Tailwind CSS girdileri ve özel stiller
    └── mobileBridge.js # Mobil uygulama ve reklam/reklam engelleme entegrasyonu
```

---

## 📄 Lisans

Bu proje kişisel / açık kaynak kullanımına uygundur.  
Geliştirici: [mesutx.com](https://mesutx.com)
