import './style.css'

// Oyun Verileri - Seviyeler
// Oyun Verileri - Seviyeler
const SEVIYELER = [
  // Seviye 1: Meyveler (Başlangıç)
  {
    seviye: 1,
    boyut: 8,
    kelimeler: ["ELMA", "ARMUT", "KIRAZ", "UZUM", "MUZ", "INCIR"]
  },
  // Seviye 2: Okul Eşyaları (Kolay)
  {
    seviye: 2,
    boyut: 9,
    kelimeler: ["KALEM", "DEFTER", "SILGI", "KITAP", "CANTA", "CETVEL"]
  },
  // Seviye 3: Renkler (Kolay)
  {
    seviye: 3,
    boyut: 9,
    kelimeler: ["KIRMIZI", "MAVI", "YESIL", "SARI", "MOR", "TURUNCU", "SIYAH"]
  },
  // Seviye 4: Hayvanlar (Kolay)
  {
    seviye: 4,
    boyut: 10,
    kelimeler: ["KEDI", "KOPEK", "ASLAN", "KAPLAN", "FIL", "ZURAFA", "AYI"]
  },
  // Seviye 5: Meslekler (Orta)
  {
    seviye: 5,
    boyut: 10,
    kelimeler: ["DOKTOR", "POLIS", "OGRETMEN", "MUHENDIS", "AVUKAT", "PILOT", "ASCI"]
  },
  // Seviye 6: Taşıtlar (Orta)
  {
    seviye: 6,
    boyut: 10,
    kelimeler: ["ARABA", "OTOBUS", "UCAK", "GEMI", "TREN", "BISIKLET", "KAMYON"]
  },
  // Seviye 7: Web Teknolojileri (Orta)
  {
    seviye: 7,
    boyut: 11,
    kelimeler: ["HTML", "CSS", "REACT", "VUE", "NODE", "ANGULAR", "PYTHON", "JAVA"]
  },
  // Seviye 8: Türkiye Şehirleri 1 (Orta)
  {
    seviye: 8,
    boyut: 11,
    kelimeler: ["ISTANBUL", "ANKARA", "IZMIR", "BURSA", "ADANA", "ANTALYA", "KONYA"]
  },
  // Seviye 9: Gezegenler (Orta)
  {
    seviye: 9,
    boyut: 11,
    kelimeler: ["MERKUR", "VENUS", "DUNYA", "MARS", "JUPITER", "SATURN", "URANUS"]
  },
  // Seviye 10: Spor Dalları (Orta - Zor)
  {
    seviye: 10,
    boyut: 12,
    kelimeler: ["FUTBOL", "BASKETBOL", "VOLEYBOL", "TENIS", "YUZME", "GURES", "HENTBOL"]
  },
  // Seviye 11: Mutfak Eşyaları (Orta - Zor)
  {
    seviye: 11,
    boyut: 12,
    kelimeler: ["TABAK", "CATAL", "KASIK", "BICAK", "TENCERE", "TAVA", "BARDAK", "SURAHI"]
  },
  // Seviye 12: Bilgisayar Parçaları (Zor)
  {
    seviye: 12,
    boyut: 12,
    kelimeler: ["EKRAN", "KLAVYE", "FARE", "ISLEMCI", "RAM", "DISK", "KASA", "FAN"]
  },
  // Seviye 13: Duygular (Zor)
  {
    seviye: 13,
    boyut: 12,
    kelimeler: ["MUTLU", "UZGUN", "KIZGIN", "SASKEN", "KORKMUS", "HEYECANLI", "ENDISELI"]
  },
  // Seviye 14: Hava Durumu (Zor)
  {
    seviye: 14,
    boyut: 13,
    kelimeler: ["GUNESLI", "YAGMURLU", "KARLI", "RUZGARLI", "BULUTLU", "SISLI", "DOLU"]
  },
  // Seviye 15: Müzik Aletleri (Zor)
  {
    seviye: 15,
    boyut: 13,
    kelimeler: ["GITAR", "PIYANO", "KEMAN", "DAVUL", "FLUT", "SAKSAFON", "TROMPET"]
  },
  // Seviye 16: Ülkeler (Çok Zor)
  {
    seviye: 16,
    boyut: 13,
    kelimeler: ["TURKIYE", "ALMANYA", "FRANSA", "ITALYA", "ISPANYA", "JAPONYA", "BREZILYA", "KANADA"]
  },
  // Seviye 17: Sebzeler (Çok Zor)
  {
    seviye: 17,
    boyut: 14,
    kelimeler: ["DOMATES", "PATATES", "SOGAN", "BIBER", "PATLICAN", "HAVUC", "ISPANAK", "PIRASA"]
  },
  // Seviye 18: Kıyafetler (Çok Zor)
  {
    seviye: 18,
    boyut: 14,
    kelimeler: ["GOMLEK", "PANTOLON", "CEKET", "KAZAK", "ETEK", "ELBISE", "SAPKA", "ELDIVEN"]
  },
  // Seviye 19: Geometrik Şekiller (Uzman)
  {
    seviye: 19,
    boyut: 14,
    kelimeler: ["KARE", "UCGEN", "DAIRE", "DIKDORTGEN", "BESGEN", "ALTIGEN", "SILINDIR", "KURE"]
  },
  // Seviye 20: Karışık Final (Uzman)
  {
    seviye: 20,
    boyut: 15,
    kelimeler: ["SAMPIYON", "EFSANE", "BASARI", "ZAFER", "KUTLAMA", "ODUL", "KUPA", "MADALYA", "FINALE"]
  }
];


class CengelBulmaca {
  constructor(config) {
    this.elTahta = config.elTahta;
    this.elKelimeler = config.elKelimeler;
    this.elSeviyeGostergesi = config.elSeviyeGostergesi;
    this.elSeviyeSonuModal = config.elSeviyeSonuModal;
    this.elSonrakiBtn = config.elSonrakiBtn;
    this.elKalanSayisi = config.elKalanSayisi;

    this.aktifSeviyeIndex = 0;
    this.veriler = null;

    this.tahta = [];
    this.yerlestirmeler = [];
    this.secimAktif = false;
    this.yol = [];
    this.BOS_ISARET = ""; 

    // Event Listeners
    this.elSonrakiBtn.onclick = () => this.sonrakiSeviye();
    document.getElementById('karistirDugme').onclick = () => this.seviyeyiYukle(this.aktifSeviyeIndex);
    document.getElementById('ipucuDugme').onclick = () => this.ipucuVer();
    
    this.elTahta.addEventListener("mouseleave", () => this.secimiIptal());
    document.addEventListener("mouseup", () => this.secimiBitir());
    document.addEventListener("touchend", () => this.secimiBitir());

    // NOT: Otomatik başlatmayı kaldırdık, dışarıdan kontrol edilecek
    // this.seviyeyiYukle(0);
  }

  baslat() {
      this.seviyeyiYukle(0);
  }

  seviyeyiYukle(index) {
    if (index >= SEVIYELER.length) {
      alert("Oyun bitti! Tebrikler, tüm seviyeleri tamamladınız.");
      this.aktifSeviyeIndex = 0;
      index = 0;
      // İsteğe bağlı: Ana menüye de atılabilir.
    }

    this.aktifSeviyeIndex = index;
    this.veriler = SEVIYELER[index];
    this.boyut = this.veriler.boyut;
    
    // UI Güncelle
    this.elSeviyeGostergesi.textContent = this.veriler.seviye;
    this.elSeviyeSonuModal.classList.add('hidden');
    this.elSeviyeSonuModal.classList.remove('flex');
    
    // Hazırlık
    // Güvenli oluşturma (Duplicate kontrolü ile)
    this.tahtayiOlusturGuvenli();
    
    this.tahtaCiz();
    this.kelimelerUIOlustur();
    this.kalanGuncelle();
  }

  tahtayiOlusturGuvenli() {
      let deneme = 0;
      let gecerli = false;
      const MAX_DENEME = 50;

      while (deneme < MAX_DENEME && !gecerli) {
          // Her denemede sıfırdan başla
          this.sifirla();
          this.kelimeleriYerlestir([...this.veriler.kelimeler]);
          this.rastgeleHarflerleDoldur();
          
          if (!this.duplicateVarMi()) {
              gecerli = true;
          } else {
              deneme++;
          }
      }
      
      if (!gecerli) {
          console.warn("Duplicate kelime engellenemedi (Max deneme aşıldı).");
      }
  }

  duplicateVarMi() {
      const yonler = [
        { dr: 0, dc: 1 }, { dr: 1, dc: 0 }, { dr: 1, dc: 1 }, { dr: -1, dc: 1 },
        { dr: 0, dc: -1 }, { dr: -1, dc: 0 }, { dr: -1, dc: -1 }, { dr: 1, dc: -1 }
      ];

      for (const kelime of this.veriler.kelimeler) {
          let bulunanSayisi = 0;
          
          // Tüm tahtayı tara
          for (let r = 0; r < this.boyut; r++) {
              for (let c = 0; c < this.boyut; c++) {
                  // İlk harf eşleşmiyorsa geç (Optimizasyon)
                  if (this.tahta[r][c] !== kelime[0]) continue;

                  // 8 yöne bak
                  for (const yon of yonler) {
                      if (this.kelimeVarMiKontrol(kelime, r, c, yon)) {
                          bulunanSayisi++;
                      }
                  }
              }
          }

          // Eğer bir kelime 1'den fazla kez bulunursa hata var demektir (Biri doğru yerleştirilen, diğerleri kazara oluşan)
          if (bulunanSayisi > 1) return true;
      }
      return false;
  }

  kelimeVarMiKontrol(kelime, r0, c0, {dr, dc}) {
      const rSon = r0 + dr * (kelime.length - 1);
      const cSon = c0 + dc * (kelime.length - 1);
      
      if (rSon < 0 || rSon >= this.boyut || cSon < 0 || cSon >= this.boyut) return false;

      for (let k = 0; k < kelime.length; k++) {
          if (this.tahta[r0 + dr * k][c0 + dc * k] !== kelime[k]) return false;
      }
      return true;
  }

  sifirla() {
    this.tahta = Array.from({ length: this.boyut }, () => Array(this.boyut).fill(null));
    this.yerlestirmeler = [];
    this.yol = [];
    
    // Grid template ayarla
    this.elTahta.style.gridTemplateColumns = `repeat(${this.boyut}, 1fr)`;

    // Dinamik Gap ve Görünüm Ayarı
    // Boyut büyüdükçe (örneğin 20. seviye 15x15) boşlukları azaltıyoruz ki sığsın
    if (this.boyut >= 14) {
        this.elTahta.className = "grid gap-px mx-auto touch-none"; // gap-px = 1px
    } else if (this.boyut >= 10) {
        this.elTahta.className = "grid gap-0.5 md:gap-1 mx-auto touch-none";
    } else {
        this.elTahta.className = "grid gap-1.5 md:gap-2 mx-auto touch-none";
    }
  }

  kelimeleriYerlestir(kelimeListesi) {
    const yonler = [
      { dr: 0, dc: 1 }, { dr: 1, dc: 0 }, { dr: 1, dc: 1 }, { dr: -1, dc: 1 },
      { dr: 0, dc: -1 }, { dr: -1, dc: 0 }, { dr: -1, dc: -1 }, { dr: 1, dc: -1 }
    ];
    
    kelimeListesi.sort((a, b) => b.length - a.length);

    for (const kelime of kelimeListesi) {
      let yerlesti = false;
      for (let dene = 0; dene < 100 && !yerlesti; dene++) {
        const yon = yonler[Math.floor(Math.random() * yonler.length)];
        const r0 = Math.floor(Math.random() * this.boyut);
        const c0 = Math.floor(Math.random() * this.boyut);
        
        if (this.yerlesebilirMi(kelime, r0, c0, yon)) {
          const hucreler = [];
          for (let k = 0; k < kelime.length; k++) {
            const r = r0 + yon.dr * k;
            const c = c0 + yon.dc * k;
            this.tahta[r][c] = kelime[k];
            hucreler.push({ r, c });
          }
          this.yerlestirmeler.push({ kelime, hucreler, bulundu: false });
          yerlesti = true;
        }
      }
    }
  }

  yerlesebilirMi(kelime, r0, c0, { dr, dc }) {
    const rSon = r0 + dr * (kelime.length - 1);
    const cSon = c0 + dc * (kelime.length - 1);

    if (rSon < 0 || rSon >= this.boyut || cSon < 0 || cSon >= this.boyut) return false;

    for (let k = 0; k < kelime.length; k++) {
      const r = r0 + dr * k;
      const c = c0 + dc * k;
      const mevcut = this.tahta[r][c];
      if (mevcut !== null && mevcut !== kelime[k]) return false;
    }
    return true;
  }

  rastgeleHarflerleDoldur() {
    const HARFLER = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ";
    for (let r = 0; r < this.boyut; r++) {
      for (let c = 0; c < this.boyut; c++) {
        if (this.tahta[r][c] === null) {
          this.tahta[r][c] = HARFLER[Math.floor(Math.random() * HARFLER.length)];
        }
      }
    }
  }

  tahtaCiz() {
    this.elTahta.innerHTML = "";
    
    // Boyuta göre font ve yuvarlaklık ayarı
    let stilSiniflari = "";
    if (this.boyut >= 14) {
        stilSiniflari = "text-[10px] md:text-sm rounded-md"; // Çok küçük font
    } else if (this.boyut >= 10) {
        stilSiniflari = "text-xs md:text-base rounded-lg";
    } else {
        stilSiniflari = "text-sm md:text-xl rounded-xl";
    }

    for (let r = 0; r < this.boyut; r++) {
      for (let c = 0; c < this.boyut; c++) {
        const d = document.createElement("div");
        d.className = `
          relative flex items-center justify-center 
          aspect-square 
          ${stilSiniflari}
          bg-slate-50 text-slate-700 
          font-bold 
          cursor-pointer select-none transition-transform duration-150
          hover:bg-slate-100 active:scale-95
          shadow-sm border border-slate-200/50
          animate-pop
        `;
        
        d.textContent = this.tahta[r][c];
        d.dataset.r = r;
        d.dataset.c = c;

        // Events
        d.addEventListener("mousedown", (e) => this.secimBaslat(e));
        d.addEventListener("mouseenter", (e) => this.secimeEkle(e));
        
        // Mobile specific
        d.addEventListener("touchstart", (e) => {
          e.preventDefault(); 
          const touch = e.touches[0];
          const hedef = document.elementFromPoint(touch.clientX, touch.clientY);
          if (hedef && hedef.dataset.r) {
             this.secimBaslat({ currentTarget: hedef });
          }
        });
        
        d.addEventListener("touchmove", (e) => {
          e.preventDefault();
          const touch = e.touches[0];
          const hedef = document.elementFromPoint(touch.clientX, touch.clientY);
          
          if (hedef && hedef.dataset.r) {
             this.secimeEkle({ currentTarget: hedef });
          }
        });

        this.elTahta.appendChild(d);
      }
    }
  }

  kelimelerUIOlustur() {
    this.elKelimeler.innerHTML = "";
    this.yerlestirmeler.forEach((y, i) => {
      const span = document.createElement("div");
      span.id = `kelime-${i}`;
      span.className = `
        px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300
        ${y.bulundu 
          ? 'bg-green-100 text-green-700 decoration-green-700/50 line-through opacity-60' 
          : 'bg-slate-100 text-slate-600'}
      `;
      span.textContent = y.kelime;
      this.elKelimeler.appendChild(span);
    });
  }

  secimBaslat(e) {
    this.secimAktif = true;
    this.yol = [];
    this.hucreGorselGuncelle(e.currentTarget, true);
    this.yol.push(this.konumAl(e.currentTarget));
  }

  secimeEkle(e) {
    if (!this.secimAktif) return;
    const mevcutEl = e.currentTarget;
    if(!mevcutEl.dataset.r) return; 

    const konum = this.konumAl(mevcutEl);
    const son = this.yol[this.yol.length - 1];

    if (this.yol.length > 1) {
       const onceki = this.yol[this.yol.length - 2];
       if(onceki.r === konum.r && onceki.c === konum.c) {
           const silinecek = this.yol.pop();
           const el = this.hucreGetir(silinecek.r, silinecek.c);
           this.hucreGorselGuncelle(el, false);
           return;
       }
    }

    if (this.yol.length >= 2) {
      const bas = this.yol[0];
      const ikinci = this.yol[1];
      const yonİlk = this.yonBul(bas, ikinci);
      const yonYeni = this.yonBul(son, konum);

      if (yonİlk.dr !== yonYeni.dr || yonİlk.dc !== yonYeni.dc) return;
    }

    if (this.komsuMu(son, konum)) {
      if(!this.yol.some(k => k.r === konum.r && k.c === konum.c)) {
          this.hucreGorselGuncelle(mevcutEl, true);
          this.yol.push(konum);
      }
    }
  }

  secimiBitir() {
    if (!this.secimAktif) return;
    this.secimAktif = false;
    
    let kelimeBulunduMu = false;

    const bulunan = this.yerlestirmeler.find(y => 
      !y.bulundu && (
        this.ayniYol(this.yol, y.hucreler) || 
        this.ayniYol([...this.yol].reverse(), y.hucreler)
      )
    );

    if (bulunan) {
      bulunan.bulundu = true;
      this.bulunanKelimeyiIsle(bulunan);
      kelimeBulunduMu = true;
    } else {
      this.secimiTemizle();
    }
    
    this.yol = [];
    
    if(kelimeBulunduMu) {
        this.kontrolSeviyeBittiMi();
    }
  }

  bulunanKelimeyiIsle(bulunan) {
      const index = this.yerlestirmeler.indexOf(bulunan);
      const etiket = document.getElementById(`kelime-${index}`);
      etiket.className = 'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 bg-green-100 text-green-700 line-through opacity-75 ring-1 ring-green-200';
      
      for (const {r, c} of bulunan.hucreler) {
          const el = this.hucreGetir(r, c);
          el.classList.remove('bg-brand-500', 'text-white', 'scale-105', 'bg-slate-50', 'text-slate-700');
          el.classList.add('bg-green-500', 'text-white', 'shadow-md', 'scale-100');
      }
      this.kalanGuncelle();
  }

  secimiTemizle() {
      for (const {r, c} of this.yol) {
          const el = this.hucreGetir(r, c);
          const bulunduMu = this.hucreBulunmusMu(r, c);
          if (!bulunduMu) {
              this.hucreGorselGuncelle(el, false);
          } else {
              el.classList.remove('bg-brand-500', 'scale-105');
              el.classList.add('bg-green-500');
          }
      }
  }
  
  hucreBulunmusMu(r, c) {
      return this.yerlestirmeler.some(y => y.bulundu && y.hucreler.some(h => h.r === r && h.c === c));
  }

  hucreGorselGuncelle(el, secili) {
      if (secili) {
          el.classList.remove('bg-slate-50', 'text-slate-700', 'bg-green-500'); 
          el.classList.add('bg-brand-500', 'text-white', 'scale-105', 'z-10', 'shadow-lg');
      } else {
          el.classList.remove('bg-brand-500', 'text-white', 'scale-105', 'z-10', 'shadow-lg');
          el.classList.add('bg-slate-50', 'text-slate-700');
      }
  }

  secimiIptal() {
       this.secimiBitir(); 
  }

  konumAl(el) { return { r: +el.dataset.r, c: +el.dataset.c }; }
  hucreGetir(r, c) { return this.elTahta.children[r * this.boyut + c]; }
  komsuMu(a, b) { 
      if(!a || !b) return false;
      return Math.abs(a.r - b.r) <= 1 && Math.abs(a.c - b.c) <= 1; 
  }
  yonBul(a, b) { return { dr: Math.sign(b.r - a.r), dc: Math.sign(b.c - a.c) }; }
  ayniYol(a, b) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
          if (a[i].r !== b[i].r || a[i].c !== b[i].c) return false;
      }
      return true;
  }

  kontrolSeviyeBittiMi() {
      if (this.yerlestirmeler.every(y => y.bulundu)) {
          setTimeout(() => {
              this.elSeviyeSonuModal.classList.remove('hidden');
              this.elSeviyeSonuModal.classList.add('flex');
          }, 500);
      }
  }

  sonrakiSeviye() {
      this.seviyeyiYukle(this.aktifSeviyeIndex + 1);
  }

  ipucuVer() {
      const bulunmamislar = this.yerlestirmeler.filter(y => !y.bulundu);
      if(bulunmamislar.length === 0) return;

      const hedef = bulunmamislar[Math.floor(Math.random() * bulunmamislar.length)];
      const harf = hedef.hucreler[0];
      const el = this.hucreGetir(harf.r, harf.c);
      
      el.classList.add('ring-4', 'ring-yellow-400', 'animate-pulse');
      setTimeout(() => el.classList.remove('ring-4', 'ring-yellow-400', 'animate-pulse'), 1500);
  }

  kalanGuncelle() {
      const kalan = this.yerlestirmeler.filter(y => !y.bulundu).length;
      this.elKalanSayisi.textContent = `${kalan} Kelime`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
    // UI Elemanları
    const girisEkrani = document.getElementById('girisEkrani');
    const oyunEkrani = document.getElementById('oyunEkrani');
    const oyunaBaslaBtn = document.getElementById('oyunaBaslaBtn');
    const anaMenuyeDonBtn = document.getElementById('anaMenuyeDonBtn');
    
    // Oyun örneği
    const oyun = new CengelBulmaca({
      elTahta: document.getElementById('tahta'),
      elKelimeler: document.getElementById('kelimeler'),
      elSeviyeGostergesi: document.getElementById('seviyeGostergesi'),
      elSeviyeSonuModal: document.getElementById('seviyeSonuModal'),
      elSonrakiBtn: document.getElementById('sonrakiSeviyeBtn'),
      elKalanSayisi: document.getElementById('kalanKelimeSayisi')
    });

    // Event Listeners for Screens
    oyunaBaslaBtn.addEventListener('click', () => {
        girisEkrani.classList.add('hidden');
        oyunEkrani.classList.remove('hidden');
        oyunEkrani.classList.add('flex');
        
        // Oyunu başlat (veya yenile)
        oyun.baslat();
    });

    anaMenuyeDonBtn.addEventListener('click', () => {
        oyunEkrani.classList.add('hidden');
        oyunEkrani.classList.remove('flex');
        girisEkrani.classList.remove('hidden');
    });
});
