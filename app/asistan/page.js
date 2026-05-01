import vehiclesData from '@/data/vehicles.json';
import { getYearList, getYearData } from '@/lib/constants';
import AsistanClient from './AsistanClient';

function buildVehicleList(data) {
  const list = [];
  Object.entries(data.brands).forEach(([brandKey, brandObj]) => {
    Object.entries(brandObj.models).forEach(([modelKey, modelObj]) => {
      const latestYear = getYearList(modelObj.years)[0];
      if (!latestYear) return;
      const yearObj = getYearData(modelObj.years, latestYear);
      if (!yearObj) return;
      yearObj.fuelTypes.forEach(fuel => {
        if (!yearObj.consumption[fuel]) return;
        list.push({
          brandKey,
          modelKey,
          brandName: brandObj.name,
          modelName: modelObj.name,
          year: latestYear,
          fuel,
          segment: modelObj.segment,
          consumption: yearObj.consumption[fuel],
          engineCC: yearObj.engineCC || 1500,
        });
      });
    });
  });
  return list;
}

export default function AsistanPage() {
  const initialVehicles = buildVehicleList(vehiclesData);
  return <AsistanClient initialVehicles={initialVehicles} />;
}
