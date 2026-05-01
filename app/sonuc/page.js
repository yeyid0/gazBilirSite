import vehiclesData from '@/data/vehicles.json';
import fuelPricesData from '@/data/fuel-prices.json';
import insuranceRatesData from '@/data/insurance-rates.json';
import mtvRatesData from '@/data/mtv-rates.json';
import { getYearData } from '@/lib/constants';
import SonucClient from './SonucClient';

export default async function SonucPage({ searchParams }) {
  const params = await searchParams;

  const marka = params.marka || '';
  const model = params.model || '';
  const varyant = params.varyant || '';
  const yil = params.yil || '';
  const yakit = params.yakit || '';
  const km = Number(params.km) || 1500;

  const initialOverrides = {};
  if (params.kasko) initialOverrides.kasko = Number(params.kasko);
  if (params.sigorta) initialOverrides.sigorta = Number(params.sigorta);
  if (params.bakim) initialOverrides.bakim = Number(params.bakim);
  if (params.yakitFiyat) initialOverrides.yakitFiyat = Number(params.yakitFiyat);
  if (params.yakitTuketim) initialOverrides.yakitTuketim = Number(params.yakitTuketim);

  let vehicleData = null;
  let vehicleSpecs = null;
  let brandName = '';
  let modelName = '';
  let variantName = '';
  let segment = 'C';
  let shortReview = '';

  if (marka && model) {
    const brandData = vehiclesData.brands[marka];
    const modelData = brandData?.models[model];

    brandName = brandData?.name || '';
    modelName = modelData?.name || '';
    segment = modelData?.segment || 'C';
    shortReview = modelData?.short_review || '';
    vehicleSpecs = modelData?.specs || null;

    if (modelData && yil) {
      if (varyant && modelData.variants?.[varyant]) {
        vehicleData = getYearData(modelData.variants[varyant].years, yil) || null;
        variantName = modelData.variants[varyant].name || '';
      } else {
        vehicleData = getYearData(modelData.years, yil) || null;
      }
    }
  }

  return (
    <SonucClient
      marka={marka}
      model={model}
      varyant={varyant}
      yil={yil}
      yakit={yakit}
      km={km}
      initialOverrides={initialOverrides}
      vehicleData={vehicleData}
      vehicleSpecs={vehicleSpecs}
      brandName={brandName}
      modelName={modelName}
      variantName={variantName}
      segment={segment}
      shortReview={shortReview}
      fuelPricesData={fuelPricesData}
      insuranceRatesData={insuranceRatesData}
      mtvRatesData={mtvRatesData}
    />
  );
}
