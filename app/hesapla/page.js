import vehiclesData from '@/data/vehicles.json';
import HesaplaClient from './HesaplaClient';

function buildBrandsData(data) {
  const brands = {};
  for (const [brandKey, brand] of Object.entries(data.brands)) {
    brands[brandKey] = {
      name: brand.name,
      models: {},
    };
    for (const [modelKey, model] of Object.entries(brand.models)) {
      const strippedModel = {
        name: model.name,
        years: stripYearData(model.years),
      };
      if (model.variants) {
        strippedModel.variants = {};
        for (const [varKey, variant] of Object.entries(model.variants)) {
          strippedModel.variants[varKey] = {
            name: variant.name,
            years: stripYearData(variant.years),
          };
        }
      }
      brands[brandKey].models[modelKey] = strippedModel;
    }
  }
  return brands;
}

function stripYearData(yearsObj) {
  if (!yearsObj) return null;
  const result = {};
  for (const [key, val] of Object.entries(yearsObj)) {
    result[key] = {
      fuelTypes: val.fuelTypes,
      consumption: val.consumption,
    };
  }
  return result;
}

export default function HesaplaPage() {
  const brandsData = buildBrandsData(vehiclesData);
  return <HesaplaClient brandsData={brandsData} />;
}
