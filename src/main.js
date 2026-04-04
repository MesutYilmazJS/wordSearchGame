import './style.css'
import { SEVIYELER } from './levels.js'
import { MobileBridge } from './mobileBridge.js'

const KAYIT_ANAHTARI = "kelime-avi-kayit";
const TAMAMLANAN_SEVIYELER_ANAHTARI = "kelime-avi-tamamlanan-seviyeler";
const TEMA_ANAHTARI = "kelime-avi-tema";
const TEMA_SECENEKLERI = ["ocean", "sunset", "forest", "berry"];
const UCRETSIZ_TEMALAR = ["ocean", "forest"];
const MAGAZA_ANAHTARI = "kelime-avi-magaza";
const HARF_STILLERI = [
  { id: "standart", ad: "Standart", aciklama: "Temiz ve klasik gorunum." },
  { id: "neon", ad: "Neon", aciklama: "Parlak kenarlar ve guclu renk vurgusu." },
  { id: "retro", ad: "Retro", aciklama: "Sicak tonlar ve arcade hissi." },
  { id: "cocuk", ad: "Cocuk", aciklama: "Daha egeli ve oyunlu bir stil." }
];
const MAGAZA_URUNLERI = [
  { id: "theme_pack", tip: "tema", ad: "Tema Paketi", aciklama: "Yeni premium tema paletleri ekler.", fiyat: "19.99 TL" },
  { id: "letter_styles", tip: "stil", ad: "Harf Stilleri", aciklama: "Tahtadaki harflere ozel font ve rozet stilleri ekler.", fiyat: "24.99 TL" }
];

class CengelBulmaca {
  constructor(config) {
    this.elTahta = config.elTahta;
    this.elKelimeler = config.elKelimeler;
    this.elSeviyeGostergesi = config.elSeviyeGostergesi;
    this.elSeviyeAdi = config.elSeviyeAdi;
    this.elSeviyeSonuModal = config.elSeviyeSonuModal;
    this.elSonrakiBtn = config.elSonrakiBtn;
    this.elKalanSayisi = config.elKalanSayisi;
    this.seviyeTamamlandiCallback = config.seviyeTamamlandiCallback || (() => {});
    this.oyunBittiCallback = config.oyunBittiCallback;

    this.aktifSeviyeIndex = 0;
    this.veriler = null;

    this.tahta = [];
    this.yerlestirmeler = [];
    this.secimAktif = false;
    this.yol = [];
    this.BOS_ISARET = "";
    this.harfStili = "standart";

    // Event Listeners
    this.elSonrakiBtn.onclick = () => this.sonrakiSeviye();
    document.getElementById('karistirDugme').onclick = () => this.seviyeyiYukle(this.aktifSeviyeIndex);
    
    this.elTahta.addEventListener("mouseleave", () => this.secimiIptal());
    document.addEventListener("mouseup", () => this.secimiBitir());
    document.addEventListener("touchend", () => this.secimiBitir());

    // NOT: Otomatik başlatmayı kaldırdık, dışarıdan kontrol edilecek
    // this.seviyeyiYukle(0);
  }

  baslat(index = 0) {
      this.harfStiliniUygula();
      this.seviyeyiYukle(index);
  }

  harfStiliniUygula() {
      try {
          const veri = JSON.parse(localStorage.getItem(MAGAZA_ANAHTARI) || "{}");
          const stil = veri.seciliHarfStili || "standart";
          this.harfStili = HARF_STILLERI.some((item) => item.id === stil) ? stil : "standart";
      } catch {
          this.harfStili = "standart";
      }
  }

  seviyeyiYukle(index) {
    if (index >= SEVIYELER.length) {
      this.ilerlemeyiTemizle();
      this.elSeviyeSonuModal.classList.add('hidden');
      this.elSeviyeSonuModal.classList.remove('flex');
      if (this.oyunBittiCallback) {
        this.oyunBittiCallback();
      } else {
        alert("Oyun bitti! Tebrikler, tüm seviyeleri tamamladınız.");
      }
      return;
    }

    this.aktifSeviyeIndex = index;
    this.veriler = SEVIYELER[index];
    this.boyut = this.veriler.boyut;
    
    // UI Güncelle
    this.elSeviyeGostergesi.textContent = this.veriler.seviye;
    this.elSeviyeAdi.textContent = this.veriler.ad;
    this.elSeviyeSonuModal.classList.add('hidden');
    this.elSeviyeSonuModal.classList.remove('flex');
    
    // Hazırlık
    // Güvenli oluşturma (Duplicate kontrolü ile)
    this.tahtayiOlusturGuvenli();
    
    this.tahtaCiz();
    this.kelimelerUIOlustur();
    this.kalanGuncelle();
    this.ilerlemeyiKaydet();
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
          board-cell board-style-${this.harfStili} relative flex items-center justify-center 
          aspect-square 
          ${stilSiniflari}
          font-bold 
          cursor-pointer select-none transition-transform duration-150
          active:scale-95
          shadow-sm
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
        px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm rounded-lg font-medium transition-all duration-300
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
      
      this.hucreleriBulunmusGoster(bulunan.hucreler);
      this.kalanGuncelle();
      this.ilerlemeyiKaydet();
  }

  secimiTemizle() {
      for (const {r, c} of this.yol) {
          const el = this.hucreGetir(r, c);
          const bulunduMu = this.hucreBulunmusMu(r, c);
          if (!bulunduMu) {
              this.hucreGorselGuncelle(el, false);
          } else {
              el.classList.remove('board-cell-selected');
              el.classList.add('board-cell-found');
          }
      }
  }
  
  hucreBulunmusMu(r, c) {
      return this.yerlestirmeler.some(y => y.bulundu && y.hucreler.some(h => h.r === r && h.c === c));
  }

  hucreGorselGuncelle(el, secili) {
      if (secili) {
          el.classList.remove('board-cell-found');
          el.classList.add('board-cell-selected');
      } else {
          el.classList.remove('board-cell-selected');
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
          this.tamamlananSeviyeyiKaydet(this.aktifSeviyeIndex);
          this.seviyeTamamlandiCallback(this.aktifSeviyeIndex);
          setTimeout(() => {
              this.elSeviyeSonuModal.classList.remove('hidden');
              this.elSeviyeSonuModal.classList.add('flex');
          }, 500);
      }
  }

  sonrakiSeviye() {
      this.seviyeyiYukle(this.aktifSeviyeIndex + 1);
  }

  ilkHarfiGoster() {
      const bulunmamislar = this.yerlestirmeler.filter(y => !y.bulundu);
      if(bulunmamislar.length === 0) return false;

      const hedef = bulunmamislar[Math.floor(Math.random() * bulunmamislar.length)];
      const harf = hedef.hucreler[0];
      const el = this.hucreGetir(harf.r, harf.c);
      if (!el) return false;

      el.classList.add('ring-4', 'ring-offset-2', 'ring-offset-white', 'ring-yellow-400', 'scale-110');
      setTimeout(() => el.classList.remove('ring-4', 'ring-offset-2', 'ring-offset-white', 'ring-yellow-400', 'scale-110'), 2200);
      return true;
  }

  kalanGuncelle() {
      const kalan = this.yerlestirmeler.filter(y => !y.bulundu).length;
      this.elKalanSayisi.textContent = `${kalan} Kelime`;
  }

  ilerlemeyiKaydet() {
      localStorage.setItem(KAYIT_ANAHTARI, JSON.stringify({
          aktifSeviyeIndex: this.aktifSeviyeIndex,
          boyut: this.boyut,
          tahta: this.tahta,
          yerlestirmeler: this.yerlestirmeler,
          sonGuncelleme: Date.now()
      }));
  }

  ilerlemeyiTemizle() {
      localStorage.removeItem(KAYIT_ANAHTARI);
  }

  tamamlananSeviyeyiKaydet(seviyeIndex) {
      const tamamlananlar = this.tamamlananSeviyeleriGetir();
      if (!tamamlananlar.includes(seviyeIndex)) {
          tamamlananlar.push(seviyeIndex);
          localStorage.setItem(TAMAMLANAN_SEVIYELER_ANAHTARI, JSON.stringify(tamamlananlar.sort((a, b) => a - b)));
      }
  }

  tamamlananSeviyeleriGetir() {
      try {
          const veri = JSON.parse(localStorage.getItem(TAMAMLANAN_SEVIYELER_ANAHTARI) || "[]");
          return Array.isArray(veri) ? veri.filter((item) => Number.isInteger(item)) : [];
      } catch {
          return [];
      }
  }

  kayittanYukle(kayit) {
      const seviye = SEVIYELER[kayit.aktifSeviyeIndex];
      if (!seviye) return false;
      if (!Array.isArray(kayit.tahta) || !Array.isArray(kayit.yerlestirmeler)) return false;

      this.aktifSeviyeIndex = kayit.aktifSeviyeIndex;
      this.veriler = seviye;
      this.boyut = kayit.boyut || seviye.boyut;
      this.tahta = kayit.tahta.map((satir) => Array.isArray(satir) ? [...satir] : []);
      this.yerlestirmeler = kayit.yerlestirmeler.map((yerlesim) => ({
          kelime: yerlesim.kelime,
          bulundu: Boolean(yerlesim.bulundu),
          hucreler: Array.isArray(yerlesim.hucreler)
              ? yerlesim.hucreler.map((hucre) => ({ r: hucre.r, c: hucre.c }))
              : []
      }));
      this.secimAktif = false;
      this.yol = [];

      this.elSeviyeGostergesi.textContent = this.veriler.seviye;
      this.elSeviyeAdi.textContent = this.veriler.ad;
      this.elSeviyeSonuModal.classList.add('hidden');
      this.elSeviyeSonuModal.classList.remove('flex');

      this.gridGorunumunuAyarla();
      this.tahtaCiz();
      this.kelimelerUIOlustur();
      this.kalanGuncelle();
      this.bulunanlariYenidenCiz();
      return true;
  }

  gridGorunumunuAyarla() {
      this.elTahta.style.gridTemplateColumns = `repeat(${this.boyut}, 1fr)`;

      if (this.boyut >= 14) {
          this.elTahta.className = "grid gap-px mx-auto touch-none";
      } else if (this.boyut >= 10) {
          this.elTahta.className = "grid gap-0.5 md:gap-1 mx-auto touch-none";
      } else {
          this.elTahta.className = "grid gap-1.5 md:gap-2 mx-auto touch-none";
      }
  }

  hucreleriBulunmusGoster(hucreler) {
      for (const {r, c} of hucreler) {
          const el = this.hucreGetir(r, c);
          if (!el) continue;
          el.classList.remove('board-cell-selected');
          el.classList.add('board-cell-found');
      }
  }

  bulunanlariYenidenCiz() {
      this.yerlestirmeler
          .filter((yerlesim) => yerlesim.bulundu)
          .forEach((yerlesim) => this.hucreleriBulunmusGoster(yerlesim.hucreler));
  }
}

document.addEventListener('DOMContentLoaded', async () => {
    // UI Elemanları
    const girisEkrani = document.getElementById('girisEkrani');
    const oyunEkrani = document.getElementById('oyunEkrani');
    const oyunaBaslaBtn = document.getElementById('oyunaBaslaBtn');
    const devamEtBtn = document.getElementById('devamEtBtn');
    const levellerBtn = document.getElementById('levellerBtn');
    const magazaBtn = document.getElementById('magazaBtn');
    const ayarlarBtn = document.getElementById('ayarlarBtn');
    const anaMenuyeDonBtn = document.getElementById('anaMenuyeDonBtn');
    const bilgiModal = document.getElementById('bilgiModal');
    const bilgiModalEtiket = document.getElementById('bilgiModalEtiket');
    const bilgiModalBaslik = document.getElementById('bilgiModalBaslik');
    const bilgiModalMesaj = document.getElementById('bilgiModalMesaj');
    const bilgiModalKapatBtn = document.getElementById('bilgiModalKapatBtn');
    const levellerModal = document.getElementById('levellerModal');
    const levellerListesi = document.getElementById('levellerListesi');
    const levellerModalKapatBtn = document.getElementById('levellerModalKapatBtn');
    const ayarlarModal = document.getElementById('ayarlarModal');
    const ayarlarModalKapatBtn = document.getElementById('ayarlarModalKapatBtn');
    const temaSecenekleri = [...document.querySelectorAll('[data-theme]')];
    const harfStiliSecenekleri = document.getElementById('harfStiliSecenekleri');
    const harfStiliBilgi = document.getElementById('harfStiliBilgi');
    const harfStiliOnizleme = document.getElementById('harfStiliOnizleme');
    const harfStiliSatinAlBtn = document.getElementById('harfStiliSatinAlBtn');
    const ipucuDugme = document.getElementById('ipucuDugme');
    const ilerlemeSifirlaBtn = document.getElementById('ilerlemeSifirlaBtn');
    const magazaModal = document.getElementById('magazaModal');
    const magazaListesi = document.getElementById('magazaListesi');
    const magazaModalKapatBtn = document.getElementById('magazaModalKapatBtn');
    const reklamModal = document.getElementById('reklamModal');
    const reklamEtiket = document.getElementById('reklamEtiket');
    const reklamBaslik = document.getElementById('reklamBaslik');
    const reklamMesaj = document.getElementById('reklamMesaj');
    const reklamSayac = document.getElementById('reklamSayac');
    const reklamIptalBtn = document.getElementById('reklamIptalBtn');
    const reklamOnayBtn = document.getElementById('reklamOnayBtn');
    const mobileBridge = new MobileBridge();
    // Oyun örneği
    const oyun = new CengelBulmaca({
      elTahta: document.getElementById('tahta'),
      elKelimeler: document.getElementById('kelimeler'),
      elSeviyeGostergesi: document.getElementById('seviyeGostergesi'),
      elSeviyeAdi: document.getElementById('seviyeAdi'),
      elSeviyeSonuModal: document.getElementById('seviyeSonuModal'),
      elSonrakiBtn: document.getElementById('sonrakiSeviyeBtn'),
      elKalanSayisi: document.getElementById('kalanKelimeSayisi'),
      seviyeTamamlandiCallback: () => {
          mobileBridge.registerLevelCompletion();
      },
      oyunBittiCallback: () => {
          oyunEkrani.classList.add('hidden');
          oyunEkrani.classList.remove('flex');
          girisEkrani.classList.remove('hidden');
          devamEtDurumunuGuncelle();
          bilgiModalAc({
              etiket: 'Harika!',
              baslik: 'Tüm Seviyeleri Tamamladın',
              mesaj: 'Tebrikler! Şimdilik tüm kelimeleri buldun. Yeni bölümler çok yakında eklenecek, takipte kal!',
              butonMetni: 'Anasayfaya Dön'
          });
      }
    });

    const kayitliIlerleme = () => {
        const hamVeri = localStorage.getItem(KAYIT_ANAHTARI);
        if (!hamVeri) return null;

        try {
            const veri = JSON.parse(hamVeri);
            if (typeof veri.aktifSeviyeIndex !== "number") return null;
            if (veri.aktifSeviyeIndex < 0 || veri.aktifSeviyeIndex >= SEVIYELER.length) return null;
            return veri;
        } catch {
            return null;
        }
    };

    const magazaDurumuGetir = () => {
        try {
            const veri = JSON.parse(localStorage.getItem(MAGAZA_ANAHTARI) || "{}");
            return {
                satinAlinanlar: mobileBridge.getOwnedProducts(),
                seciliHarfStili: veri.seciliHarfStili || "standart"
            };
        } catch {
            return { satinAlinanlar: mobileBridge.getOwnedProducts(), seciliHarfStili: "standart" };
        }
    };

    const magazaDurumuKaydet = (durum) => {
        localStorage.setItem(MAGAZA_ANAHTARI, JSON.stringify({
            seciliHarfStili: durum.seciliHarfStili || "standart"
        }));
    };

    const devamEtDurumunuGuncelle = () => {
        devamEtBtn.disabled = !kayitliIlerleme();
    };

    const temaPaketiVarMi = () => magazaDurumuGetir().satinAlinanlar.includes("theme_pack");
    const temaKullanilabilirMi = (tema) => UCRETSIZ_TEMALAR.includes(tema) || temaPaketiVarMi();
    const ekraniAc = (baslangicSeviyesi) => {
        girisEkrani.classList.add('hidden');
        oyunEkrani.classList.remove('hidden');
        oyunEkrani.classList.add('flex');
        oyun.harfStiliniUygula();
        oyun.baslat(baslangicSeviyesi);
        devamEtDurumunuGuncelle();
    };

    let bilgiModalButonCallback = null;

    const bilgiModalAc = ({ etiket, baslik, mesaj, butonMetni, callback }) => {
        bilgiModalEtiket.textContent = etiket;
        bilgiModalBaslik.textContent = baslik;
        bilgiModalMesaj.textContent = mesaj;
        bilgiModalKapatBtn.textContent = butonMetni || "Tamam";
        bilgiModalButonCallback = callback || null;
        bilgiModal.classList.remove('hidden');
        bilgiModal.classList.add('flex');
    };

    const bilgiModalKapat = () => {
        bilgiModal.classList.add('hidden');
        bilgiModal.classList.remove('flex');
        if (typeof bilgiModalButonCallback === 'function') {
            bilgiModalButonCallback();
            bilgiModalButonCallback = null;
        }
    };

    let reklamOnayi = null;
    let reklamSayacSureci = null;

    const reklamModalKapat = () => {
        reklamModal.classList.add('hidden');
        reklamModal.classList.remove('flex');
        reklamOnayi = null;
        if (reklamSayacSureci) {
            clearInterval(reklamSayacSureci);
            reklamSayacSureci = null;
        }
    };

    const reklamModalAc = ({ etiket, baslik, mesaj, onComplete }) => {
        reklamOnayi = onComplete;
        reklamEtiket.textContent = etiket;
        reklamBaslik.textContent = baslik;
        reklamMesaj.textContent = mesaj;
        reklamSayac.textContent = "3 sn";
        reklamModal.classList.remove('hidden');
        reklamModal.classList.add('flex');

        let kalan = 3;
        reklamOnayBtn.disabled = true;
        reklamOnayBtn.classList.add('opacity-60');

        reklamSayacSureci = setInterval(() => {
            kalan -= 1;
            reklamSayac.textContent = kalan > 0 ? `${kalan} sn` : "Hazir";
            if (kalan <= 0) {
                clearInterval(reklamSayacSureci);
                reklamSayacSureci = null;
                reklamOnayBtn.disabled = false;
                reklamOnayBtn.classList.remove('opacity-60');
            }
        }, 1000);
    };

    const reklamFallbackAkisi = (ayarlar) => new Promise((resolve) => {
        reklamModalAc({
            ...ayarlar,
            onComplete: () => {
                reklamModalKapat();
                resolve();
            }
        });
    });

    const aktifTemayiGetir = () => {
        const tema = localStorage.getItem(TEMA_ANAHTARI) || "ocean";
        if (!TEMA_SECENEKLERI.includes(tema)) return "ocean";
        return temaKullanilabilirMi(tema) ? tema : "ocean";
    };

    const temaSeciminiGuncelle = (aktifTema) => {
        temaSecenekleri.forEach((dugme) => {
            const tema = dugme.dataset.theme;
            const kilitli = !temaKullanilabilirMi(tema);
            dugme.classList.toggle('active', tema === aktifTema);
            dugme.disabled = kilitli;
            dugme.classList.toggle('opacity-60', kilitli);
            dugme.classList.toggle('cursor-not-allowed', kilitli);

            let rozet = dugme.querySelector('[data-theme-badge]');
            if (!rozet) {
                rozet = document.createElement('div');
                rozet.dataset.themeBadge = 'true';
                rozet.className = 'mt-2 text-[11px] font-bold uppercase tracking-[0.16em]';
                dugme.appendChild(rozet);
            }
            rozet.textContent = kilitli ? 'Tema Paketi' : (UCRETSIZ_TEMALAR.includes(tema) ? 'Ucretsiz' : 'Acik');
            rozet.className = `mt-2 text-[11px] font-bold uppercase tracking-[0.16em] ${kilitli ? 'text-amber-500' : 'text-slate-400'}`;
        });
    };

    const temayiUygula = (tema) => {
        const aktifTema = TEMA_SECENEKLERI.includes(tema) && temaKullanilabilirMi(tema) ? tema : "ocean";
        document.body.classList.remove(...TEMA_SECENEKLERI.map((ad) => `theme-${ad}`));
        document.body.classList.add(`theme-${aktifTema}`);
        localStorage.setItem(TEMA_ANAHTARI, aktifTema);
        temaSeciminiGuncelle(aktifTema);
    };

    const levellerModalAc = () => {
        levelleriCiz();
        levellerModal.classList.remove('hidden');
        levellerModal.classList.add('flex');
    };

    const levellerModalKapat = () => {
        levellerModal.classList.add('hidden');
        levellerModal.classList.remove('flex');
    };

    const harfStiliSecenekleriniCiz = () => {
        const durum = magazaDurumuGetir();
        const paketVar = durum.satinAlinanlar.includes("letter_styles");
        
        harfStiliSecenekleri.innerHTML = "";
        
        if (paketVar) {
            harfStiliBilgi.classList.remove('hidden');
        } else {
            harfStiliBilgi.classList.add('hidden');
        }

        HARF_STILLERI.forEach((stil) => {
            const aktif = durum.seciliHarfStili === stil.id;
            const kart = document.createElement('button');
            kart.type = "button";
            kart.className = `theme-chip rounded-2xl border border-slate-200 bg-white p-3 text-left transition ${aktif ? 'ring-2 ring-sky-500 border-sky-500' : ''}`;
            kart.innerHTML = `
                <div class="text-sm font-bold text-slate-900">${stil.ad}</div>
                <div class="mt-1 text-xs text-slate-500 line-clamp-1">${stil.aciklama}</div>
            `;
            
            kart.addEventListener('click', () => {
                // Her zaman önizlemeyi güncelle
                harfStiliOnizleme.className = `w-12 h-12 flex items-center justify-center text-2xl rounded-xl transition-all duration-300 board-style-${stil.id}`;
                
                if (!paketVar && stil.id !== "standart") {
                    // Sahip değilse Satin Al butonunu çıkar
                    harfStiliSatinAlBtn.classList.remove('hidden');
                    harfStiliSatinAlBtn.onclick = () => {
                        ayarlarModalKapat();
                        magazaModalAc();
                    };
                    return;
                } else {
                    // Sahip ise (veya standart ise) direkt uygula
                    harfStiliSatinAlBtn.classList.add('hidden');
                    const yeniDurum = magazaDurumuGetir();
                    yeniDurum.seciliHarfStili = stil.id;
                    magazaDurumuKaydet(yeniDurum);
                    harfStiliSecenekleriniCiz();
                    oyun.harfStiliniUygula();
                }
            });
            
            harfStiliSecenekleri.appendChild(kart);
        });

        // Başlangıçta satın alma butonunu gizle (zaten aktif olanı görüyor)
        harfStiliSatinAlBtn.classList.add('hidden');
        harfStiliOnizleme.className = `w-12 h-12 flex items-center justify-center text-2xl rounded-xl transition-all duration-300 board-style-${durum.seciliHarfStili}`;
    };

    const ayarlarModalAc = () => {
        temaSeciminiGuncelle(aktifTemayiGetir());
        harfStiliSecenekleriniCiz();
        ayarlarModal.classList.remove('hidden');
        ayarlarModal.classList.add('flex');
    };

    const ayarlarModalKapat = () => {
        ayarlarModal.classList.add('hidden');
        ayarlarModal.classList.remove('flex');
    };

    const magazaModalAc = () => {
        magazaListesiniCiz();
        magazaModal.classList.remove('hidden');
        magazaModal.classList.add('flex');
    };

    const magazaModalKapat = () => {
        magazaModal.classList.add('hidden');
        magazaModal.classList.remove('flex');
    };

    const seviyedenBaslat = (seviyeIndex) => {
        levellerModalKapat();
        girisEkrani.classList.add('hidden');
        oyunEkrani.classList.remove('hidden');
        oyunEkrani.classList.add('flex');
        oyun.baslat(seviyeIndex);
        devamEtDurumunuGuncelle();
    };

    const levelleriCiz = () => {
        const tamamlananlar = new Set(oyun.tamamlananSeviyeleriGetir());
        const aktifKayit = kayitliIlerleme();

        levellerListesi.innerHTML = "";

        SEVIYELER.forEach((seviye, index) => {
            const tamamlandi = tamamlananlar.has(index);
            const devamEdilen = aktifKayit?.aktifSeviyeIndex === index;
            const oynanabilir = index === 0 || tamamlandi;
            const kart = document.createElement('button');
            const kartSinifi = oynanabilir
                ? tamamlandi
                    ? 'border-green-200 bg-green-50 shadow-sm shadow-green-100/70'
                    : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-sky-200'
                : 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed';

            kart.type = 'button';
            kart.className = `
              w-full rounded-3xl border p-4 text-left transition
              ${kartSinifi}
            `;
            kart.disabled = !oynanabilir;

            kart.innerHTML = `
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="text-xs font-bold uppercase tracking-[0.2em] ${tamamlandi ? 'text-green-500' : oynanabilir ? 'text-slate-400' : 'text-slate-300'}">Seviye ${seviye.seviye}</div>
                  <div class="mt-1 text-lg font-bold text-slate-900">${seviye.ad}</div>
                  <div class="mt-2 text-sm text-slate-500">${seviye.kelimeler.length} kelime • ${seviye.boyut}x${seviye.boyut}</div>
                </div>
                <div class="flex min-w-[72px] justify-end">
                  ${tamamlandi
                    ? '<span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-green-500 text-lg text-white">✓</span>'
                    : !oynanabilir
                      ? '<span class="rounded-2xl bg-slate-300 px-3 py-2 text-xs font-bold text-slate-600">Kilitli</span>'
                    : devamEdilen
                      ? '<span class="rounded-2xl bg-sky-100 px-3 py-2 text-xs font-bold text-sky-700">Devam</span>'
                      : '<span class="rounded-2xl bg-slate-200 px-3 py-2 text-xs font-bold text-slate-500">Ac</span>'}
                </div>
              </div>
            `;

            if (oynanabilir) {
                kart.addEventListener('click', () => seviyedenBaslat(index));
            }
            levellerListesi.appendChild(kart);
        });
    };

    const magazaListesiniCiz = () => {
        const durum = magazaDurumuGetir();
        magazaListesi.innerHTML = "";

        MAGAZA_URUNLERI.forEach((urun) => {
            const satinAlindi = durum.satinAlinanlar.includes(urun.id);
            const kart = document.createElement('div');
            kart.className = "app-card-muted rounded-3xl p-5";
            kart.innerHTML = `
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="text-xs font-bold uppercase tracking-[0.2em] app-faint-text">${urun.tip}</div>
                  <h3 class="mt-2 text-xl font-bold text-slate-900">${urun.ad}</h3>
                  <p class="mt-2 text-sm leading-6 app-muted-text">${urun.aciklama}</p>
                </div>
                <div class="rounded-2xl brand-soft-bg px-3 py-2 text-sm font-bold">${urun.fiyat}</div>
              </div>
              <button data-product-id="${urun.id}" class="${satinAlindi ? 'app-soft-button' : 'brand-bg'} mt-5 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition">
                ${satinAlindi ? 'Aktif' : 'Demo Satin Al'}
              </button>
              ${urun.id === 'letter_styles' && satinAlindi ? `
                <div class="mt-4 grid grid-cols-2 gap-2">
                  ${HARF_STILLERI.map((stil) => `
                    <button data-letter-style="${stil.id}" class="store-choice ${durum.seciliHarfStili === stil.id ? 'active' : ''} rounded-2xl px-3 py-3 text-left text-sm font-semibold transition">
                      <div>${stil.ad}</div>
                      <div class="mt-1 text-xs app-faint-text">${stil.aciklama}</div>
                    </button>
                  `).join('')}
                </div>
              ` : ''}
            `;

            const buton = kart.querySelector('[data-product-id]');
            buton.addEventListener('click', async () => {
                if (satinAlindi) return;
                const satinAlim = await mobileBridge.purchaseProduct(urun.id);
                if (!satinAlim.success) return;

                const yeniDurum = magazaDurumuGetir();
                if (urun.id === 'letter_styles') {
                    yeniDurum.seciliHarfStili = yeniDurum.seciliHarfStili || 'standart';
                }
                magazaDurumuKaydet(yeniDurum);
                magazaListesiniCiz();
                oyun.harfStiliniUygula();
                if (!oyunEkrani.classList.contains('hidden') && oyun.veriler) {
                    oyun.tahtaCiz();
                    oyun.kelimelerUIOlustur();
                    oyun.bulunanlariYenidenCiz();
                }
                bilgiModalAc({
                    etiket: 'Magaza',
                    baslik: `${urun.ad} etkinlestirildi`,
                    mesaj: satinAlim.source === 'capacitor'
                        ? 'Satin alma mobil odeme sistemi uzerinden dogrulandi.'
                        : 'Bu su an simulator satin alma akisi. Capacitor tarafinda gercek odeme baglaninca ayni kopru kullanilacak.'
                });
            });

            kart.querySelectorAll('[data-letter-style]').forEach((stilButonu) => {
                stilButonu.addEventListener('click', () => {
                    const yeniDurum = magazaDurumuGetir();
                    yeniDurum.seciliHarfStili = stilButonu.dataset.letterStyle;
                    magazaDurumuKaydet(yeniDurum);
                    magazaListesiniCiz();
                    oyun.harfStiliniUygula();
                    if (!oyunEkrani.classList.contains('hidden') && oyun.veriler) {
                        oyun.tahtaCiz();
                        oyun.kelimelerUIOlustur();
                        oyun.bulunanlariYenidenCiz();
                    }
                });
            });

            magazaListesi.appendChild(kart);
        });
    };

    const seviyelerArasiReklamGoster = (sonrakiAdim) => {
        if (!mobileBridge.shouldShowInterstitial()) {
            sonrakiAdim();
            return;
        }

        mobileBridge.showInterstitial(() => reklamFallbackAkisi({
            etiket: 'Gecis Reklami',
            baslik: 'Kisa bir mola',
            mesaj: 'Arka arkaya 2 veya 3 seviye gecildiginde zorunlu reklam gosterilir.'
        })).then(sonrakiAdim);
    };

    const odulluReklamliIlkHarf = () => {
        mobileBridge.showRewarded(() => reklamFallbackAkisi({
            etiket: 'Ödüllü Reklam',
            baslik: 'Ilk harf ipucu',
            mesaj: 'Kisa reklami izlersen bulunmamis kelimelerden birinin ilk harfini isaretleyecegim.'
        })).then(() => {
            const basarili = oyun.ilkHarfiGoster();
            if (!basarili) {
                bilgiModalAc({
                    etiket: 'Ipucu',
                    baslik: 'Tum kelimeler bulundu',
                    mesaj: 'Bu seviyede artik ilk harf ipucuna ihtiyac kalmadi.'
                });
            }
        });
    };

    // Event Listeners for Screens
    oyunaBaslaBtn.addEventListener('click', () => {
        oyun.ilerlemeyiTemizle();
        ekraniAc(0);
    });

    devamEtBtn.addEventListener('click', () => {
        const kayit = kayitliIlerleme();
        if (!kayit) return;

        girisEkrani.classList.add('hidden');
        oyunEkrani.classList.remove('hidden');
        oyunEkrani.classList.add('flex');

        const yuklendi = oyun.kayittanYukle(kayit);
        if (!yuklendi) {
            oyun.ilerlemeyiTemizle();
            ekraniAc(0);
            return;
        }

        oyun.harfStiliniUygula();
        oyun.tahtaCiz();
        oyun.kelimelerUIOlustur();
        oyun.bulunanlariYenidenCiz();
        devamEtDurumunuGuncelle();
    });

    levellerBtn.addEventListener('click', levellerModalAc);

    magazaBtn.addEventListener('click', magazaModalAc);

    ayarlarBtn.addEventListener('click', ayarlarModalAc);
    ipucuDugme.addEventListener('click', odulluReklamliIlkHarf);
    oyun.elSonrakiBtn.onclick = () => seviyelerArasiReklamGoster(() => oyun.sonrakiSeviye());

    anaMenuyeDonBtn.addEventListener('click', () => {
        oyunEkrani.classList.add('hidden');
        oyunEkrani.classList.remove('flex');
        girisEkrani.classList.remove('hidden');
        devamEtDurumunuGuncelle();
    });

    bilgiModalKapatBtn.addEventListener('click', bilgiModalKapat);
    bilgiModal.addEventListener('click', (event) => {
        if (event.target === bilgiModal) {
            bilgiModalKapat();
        }
    });

    levellerModalKapatBtn.addEventListener('click', levellerModalKapat);
    levellerModal.addEventListener('click', (event) => {
        if (event.target === levellerModal) {
            levellerModalKapat();
        }
    });

    ayarlarModalKapatBtn.addEventListener('click', ayarlarModalKapat);
    ayarlarModal.addEventListener('click', (event) => {
        if (event.target === ayarlarModal) {
            ayarlarModalKapat();
        }
    });

    magazaModalKapatBtn.addEventListener('click', magazaModalKapat);
    magazaModal.addEventListener('click', (event) => {
        if (event.target === magazaModal) {
            magazaModalKapat();
        }
    });

    reklamIptalBtn.addEventListener('click', reklamModalKapat);
    reklamModal.addEventListener('click', (event) => {
        if (event.target === reklamModal) {
            reklamModalKapat();
        }
    });
    reklamOnayBtn.addEventListener('click', () => {
        if (typeof reklamOnayi === 'function') {
            reklamOnayi();
        }
    });

    temaSecenekleri.forEach((dugme) => {
        dugme.addEventListener('click', () => {
            if (!temaKullanilabilirMi(dugme.dataset.theme)) {
                bilgiModalAc({
                    etiket: 'Tema Paketi',
                    baslik: 'Bu tema kilitli',
                    mesaj: 'Bu temayi kullanmak icin once Magaza icinden Tema Paketi urununu etkinlestirmen gerekiyor.'
                });
                return;
            }
            temayiUygula(dugme.dataset.theme);
        });
    });

    ilerlemeSifirlaBtn.addEventListener('click', () => {
        const onay = window.confirm('Tum ilerleme sifirlansin mi? Bu islem geri alinamaz.');
        if (!onay) return;

        oyun.ilerlemeyiTemizle();
        localStorage.removeItem(TAMAMLANAN_SEVIYELER_ANAHTARI);
        oyunEkrani.classList.add('hidden');
        oyunEkrani.classList.remove('flex');
        girisEkrani.classList.remove('hidden');
        ayarlarModalKapat();
        magazaModalKapat();
        devamEtDurumunuGuncelle();
        levelleriCiz();
    });

    await mobileBridge.initialize();
    await mobileBridge.restorePurchases();
    temayiUygula(aktifTemayiGetir());
    devamEtDurumunuGuncelle();
});
