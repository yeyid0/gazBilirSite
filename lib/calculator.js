/**
 * ArabaSepeti — Maliyet Hesaplama Motoru
 * 
 * Tüm hesaplama mantığı bu modülde merkezileştirilmiştir.
 * Saf fonksiyonlar (pure functions) kullanılır — yan etkisi yoktur.
 */

import fuelPricesData from '@/data/fuel-prices.json';
import mtvRatesData from '@/data/mtv-rates.json';
import insuranceData from '@/data/insurance-rates.json';
import {
  MUAYENE_UCRETI,
  MUAYENE_PERIYODU,
  BAKIM_MALIYETLERI,
  BAKIM_PERIYODU_KM,
} from './constants';

/**
 * Yakıt maliyetini hesaplar
 * @param {number} monthlyKm - Aylık km
 * @param {number} consumption - 100km başına litre tüketim
 * @param {string} fuelType - Yakıt türü (benzin, dizel, lpg, hibrit)
 * @param {number} [fuelPriceOverride] - İsteğe bağlı yakıt fiyatı
 * @returns {{ monthly: number, yearly: number }}
 */
export function calculateFuelCost(monthlyKm, consumption, fuelType, fuelPriceOverride) {
  // Elektrikli araçlar kWh/100km cinsinden ölçülür (Litre değil)
  const priceKey = fuelType === 'hibrit' ? 'benzin' : fuelType;
  const defaultFuelPrice = fuelPricesData.prices[priceKey] || fuelPricesData.prices.benzin;
  const fuelPrice = fuelPriceOverride !== undefined ? fuelPriceOverride : defaultFuelPrice;
  
  // Elektrik: consumption = kWh/100km, diğerleri: L/100km
  const monthlyUsage = (monthlyKm / 100) * consumption;
  const monthly = Math.round(monthlyUsage * fuelPrice);
  
  return {
    monthly,
    yearly: monthly * 12,
  };
}

/**
 * MTV (Motorlu Taşıtlar Vergisi) hesaplar
 * @param {number} engineCC - Motor hacmi (cc) — elektrikli için kW motor gücü
 * @param {number} vehicleYear - Araç model yılı
 * @param {string} [fuelType] - Yakıt türü (elektrikli için özel tarife uygulanır)
 * @returns {{ monthly: number, yearly: number }}
 */
export function calculateMTV(engineCC, vehicleYear, fuelType = 'benzin') {
  const currentYear = new Date().getFullYear();
  const age = currentYear - vehicleYear;
  
  // Yaş aralığını belirle
  let ageRange;
  if (age <= 3) ageRange = '1-3';
  else if (age <= 6) ageRange = '4-6';
  else if (age <= 11) ageRange = '7-11';
  else if (age <= 15) ageRange = '12-15';
  else ageRange = '16+';
  
  // CC aralığını belirle
  let ccRange;
  if (engineCC <= 1300) ccRange = '0-1300';
  else if (engineCC <= 1600) ccRange = '1301-1600';
  else if (engineCC <= 1800) ccRange = '1601-1800';
  else if (engineCC <= 2000) ccRange = '1801-2000';
  else if (engineCC <= 2500) ccRange = '2001-2500';
  else if (engineCC <= 3000) ccRange = '2501-3000';
  else if (engineCC <= 3500) ccRange = '3001-3500';
  else if (engineCC <= 4000) ccRange = '3501-4000';
  else ccRange = '4001+';
  
  let yearly = mtvRatesData.rates[ageRange]?.[ccRange] || 0;
  
  // Elektrikli araçlar MTV'nin yalnızca %25'ini öder (Türkiye teşvik mevzuatı)
  if (fuelType === 'elektrik') {
    yearly = Math.round(yearly * 0.25);
  }
  
  return {
    monthly: Math.round(yearly / 12),
    yearly,
  };
}

/**
 * Sigorta maliyetini hesaplar (zorunlu trafik sigortası)
 * @param {string} segment - Araç segmenti
 * @returns {{ monthly: number, yearly: number }}
 */
export function calculateInsurance(segment) {
  const yearly = insuranceData.trafficInsurance.bySegment[segment] || 6000;
  
  return {
    monthly: Math.round(yearly / 12),
    yearly,
  };
}

/**
 * Kasko maliyetini hesaplar
 * @param {string} segment - Araç segmenti
 * @returns {{ monthly: number, yearly: number }}
 */
export function calculateKasko(segment) {
  const yearly = insuranceData.kasko.bySegment[segment] || 25000;
  
  return {
    monthly: Math.round(yearly / 12),
    yearly,
  };
}

/**
 * Periyodik bakım maliyetini hesaplar
 * @param {string} segment - Araç segmenti
 * @param {number} monthlyKm - Aylık km
 * @returns {{ monthly: number, yearly: number }}
 */
export function calculateMaintenance(segment, monthlyKm) {
  const yearlyBaseCost = BAKIM_MALIYETLERI[segment] || 12000;
  const yearlyKm = monthlyKm * 12;
  
  // km'ye göre bakım sıklığını ayarla
  const maintenanceMultiplier = yearlyKm / BAKIM_PERIYODU_KM;
  const adjustedYearly = Math.round(yearlyBaseCost * (maintenanceMultiplier / 1.5));
  // 1.5 = 15000km/yıl normalleştirme faktörü
  
  const yearly = Math.max(adjustedYearly, Math.round(yearlyBaseCost * 0.5));
  
  return {
    monthly: Math.round(yearly / 12),
    yearly,
  };
}

/**
 * Muayene maliyetini hesaplar (2 yılda 1)
 * @returns {{ monthly: number, yearly: number }}
 */
export function calculateInspection() {
  const yearly = Math.round(MUAYENE_UCRETI / MUAYENE_PERIYODU);
  
  return {
    monthly: Math.round(yearly / 12),
    yearly,
  };
}

/**
 * TÜM maliyet kalemlerini hesaplar — ana hesaplama fonksiyonu
 * @param {object} params
 * @param {number} params.monthlyKm - Aylık km
 * @param {number} params.consumption - 100km başına litre
 * @param {string} params.fuelType - Yakıt türü
 * @param {number} params.engineCC - Motor hacmi (cc)
 * @param {number} params.vehicleYear - Model yılı
 * @param {string} params.segment - Araç segmenti
 * @param {object} [params.overrides] - Kullanıcı tarafından girilen özel değerler
 * @returns {object} Tüm maliyet kalemleri + toplam
 */
export function calculateTotalCost({
  monthlyKm,
  consumption,
  fuelType,
  engineCC,
  vehicleYear,
  segment,
  overrides = {},
}) {
  const activeConsumption = overrides.yakitTuketim !== undefined ? overrides.yakitTuketim : consumption;
  const yakit = calculateFuelCost(monthlyKm, activeConsumption, fuelType, overrides.yakitFiyat);
  const mtv = calculateMTV(engineCC, vehicleYear, fuelType);
  
  const sigorta = overrides.sigorta !== undefined 
    ? { yearly: overrides.sigorta, monthly: Math.round(overrides.sigorta / 12) }
    : calculateInsurance(segment);
    
  const kasko = overrides.kasko !== undefined
    ? { yearly: overrides.kasko, monthly: Math.round(overrides.kasko / 12) }
    : calculateKasko(segment);
    
  const bakim = overrides.bakim !== undefined
    ? { yearly: overrides.bakim, monthly: Math.round(overrides.bakim / 12) }
    : calculateMaintenance(segment, monthlyKm);
    
  const muayene = calculateInspection();
  
  const totalMonthly = yakit.monthly + mtv.monthly + sigorta.monthly + kasko.monthly + bakim.monthly + muayene.monthly;
  const totalYearly = yakit.yearly + mtv.yearly + sigorta.yearly + kasko.yearly + bakim.yearly + muayene.yearly;
  
  return {
    breakdown: {
      yakit,
      mtv,
      sigorta,
      kasko,
      bakim,
      muayene,
    },
    total: {
      monthly: totalMonthly,
      yearly: totalYearly,
    },
  };
}

/**
 * Sayıyı Türk Lirası formatına çevirir
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Sayıyı binlik ayraçlı formata çevirir
 * @param {number} num
 * @returns {string}
 */
export function formatNumber(num) {
  return new Intl.NumberFormat('tr-TR').format(num);
}

/**
 * 5 Yıllık Maliyet Projeksiyonunu hesaplar
 * Varsayım: Yıllık ortalama %35 enflasyon/fiyat artışı
 * @param {number} currentYearlyTotal
 * @returns {Array} Grafikte kullanılacak data formatı
 */
export function calculateProjection(currentYearlyTotal, inflationRate = 0.35) {
  const data = [];
  let currentCost = currentYearlyTotal;
  let cumulative = 0;
  
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < 5; i++) {
    cumulative += currentCost;
    data.push({
      year: (currentYear + i).toString(),
      yillik: Math.round(currentCost),
      kumulatif: Math.round(cumulative),
    });
    // Sonraki yıl için maliyeti enflasyon oranında artır
    currentCost = currentCost * (1 + inflationRate);
  }
  
  return data;
}
