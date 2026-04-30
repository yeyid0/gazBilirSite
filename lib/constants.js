/**
 * ArabaSepeti — Sabitler & Yapılandırma
 * Tüm statik değerler burada merkezi olarak yönetilir.
 */

/** Muayene ücreti (2 yılda 1, TL) */
export const MUAYENE_UCRETI = 3288;

/** Muayene periyodu (yıl) */
export const MUAYENE_PERIYODU = 2;

/** Yıllık ortalama bakım maliyetleri — segment bazlı (TL) */
export const BAKIM_MALIYETLERI = {
  'A': 8000,
  'B': 10000,
  'C': 12000,
  'D': 16000,
  'E': 25000,
  'F': 40000,
  'SUV-B': 11000,
  'SUV-C': 14000,
  'SUV-D': 18000,
  'SUV-E': 28000,
  'PICKUP': 15000,
};

/** Bakım periyodu (km) — bu km'de bir servis */
export const BAKIM_PERIYODU_KM = 10000;

/** Ortalama yıllık km (varsayılan) */
export const VARSAYILAN_AYLIK_KM = 1500;

/** Yakıt türleri Türkçe isimleri */
export const YAKIT_TURLERI = {
  benzin: 'Benzin',
  dizel: 'Dizel',
  lpg: 'LPG',
  hibrit: 'Hibrit',
  elektrik: 'Elektrik',
};

/** Marka alan adları (Clearbit Logo API için) */
export const BRAND_DOMAINS = {
  toyota: 'toyota.com',
  honda: 'honda.com',
  renault: 'renault.co.uk',
  fiat: 'fiat.com',
  volkswagen: 'vw.com',
  ford: 'ford.com',
  opel: 'opel.com',
  audi: 'audi.com',
  volvo: 'volvocars.com',
  hyundai: 'hyundai.com',
  peugeot: 'peugeot.com',
  nissan: 'nissan-global.com',
  bmw: 'bmw.com',
  mercedes: 'mercedes-benz.com',
  kia: 'kia.com',
  seat: 'seat.com',
  skoda: 'skoda-auto.com',
  dacia: 'dacia.com',
  citroen: 'citroen.com',
  tesla: 'tesla.com',
  togg: 'togg.com.tr',
  mazda: 'mazda.com',
  mitsubishi: 'mitsubishicars.com'
};

/** Yakıt türü renkleri (grafik ve UI için) */
export const YAKIT_RENKLERI = {
  benzin: '#ff6b35',
  dizel: '#4ecdc4',
  lpg: '#45b7d1',
  hibrit: '#96ceb4',
  elektrik: '#6c5ce7',
};

/** Segment Türkçe isimleri */
export const SEGMENT_ISIMLERI = {
  'A': 'Mini',
  'B': 'Küçük',
  'B-SUV': 'Küçük SUV',
  'C': 'Orta',
  'C-SUV': 'Orta SUV',
  'D': 'Büyük',
  'D-SUV': 'Büyük SUV',
  'E': 'Lüks',
};

/** Maliyet kalemleri (sonuç sayfası sırası ve renkleri) */
export const MALIYET_KALEMLERI = [
  { key: 'yakit', label: 'Yakıt', icon: '⛽', color: '#ff6b35' },
  { key: 'mtv', label: 'MTV', icon: '🏛️', color: '#6c5ce7' },
  { key: 'sigorta', label: 'Trafik Sigortası', icon: '🛡️', color: '#00b894' },
  { key: 'kasko', label: 'Kasko', icon: '🔒', color: '#0984e3' },
  { key: 'bakim', label: 'Periyodik Bakım', icon: '🔧', color: '#fdcb6e' },
  { key: 'muayene', label: 'Muayene', icon: '📋', color: '#e17055' },
];

/** Yıl range anahtarlarını ("2020-2025") tek tek yıllara açar */
export function expandYearKeys(yearsObj) {
  if (!yearsObj) return {};
  const result = {};
  for (const [key, val] of Object.entries(yearsObj)) {
    if (key.includes('-')) {
      const [start, end] = key.split('-').map(Number);
      for (let y = start; y <= end; y++) result[String(y)] = val;
    } else {
      result[key] = val;
    }
  }
  return result;
}

/** Belirli bir yıl için veriyi döndürür; hem "2022" hem "2020-2025" anahtar formatını destekler */
export function getYearData(yearsObj, year) {
  if (!yearsObj || !year) return null;
  if (yearsObj[year]) return yearsObj[year];
  const y = Number(year);
  for (const [key, val] of Object.entries(yearsObj)) {
    if (key.includes('-')) {
      const [start, end] = key.split('-').map(Number);
      if (y >= start && y <= end) return val;
    }
  }
  return null;
}

/** Yıl nesnesinden azalan sıralı bireysel yıl listesi döndürür (range'leri açar) */
export function getYearList(yearsObj) {
  return Object.keys(expandYearKeys(yearsObj)).sort((a, b) => b - a);
}

/** Site meta bilgileri */
export const SITE_CONFIG = {
  name: 'GazBilir',
  title: 'GazBilir — Akıllı Araç Maliyet Asistanı',
  description: 'Aracınızın aylık ve yıllık bakım, yakıt, sigorta, MTV masraflarını hesaplayın. Türkiye\'nin en detaylı akıllı araç bütçe asistanı.',
  url: 'https://gazbilir.com',
  locale: 'tr_TR',
};
