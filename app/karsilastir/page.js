import vehiclesData from '@/data/vehicles.json';
import KarsilastirClient from './KarsilastirClient';

export default function KarsilastirPage() {
  return <KarsilastirClient brandsData={vehiclesData.brands} />;
}
