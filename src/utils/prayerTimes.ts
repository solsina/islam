import {
  Coordinates,
  CalculationMethod,
  PrayerTimes,
  Madhab,
} from 'adhan';
import { useSettingsStore } from '../store/useSettingsStore';

export const getPrayerTimes = (date: Date = new Date()) => {
  const { location, calculationMethod, asrMethod } = useSettingsStore.getState();
  
  const coordinates = new Coordinates(location.lat, location.lng);
  
  // Map our string to adhan's CalculationMethod
  let params;
  switch (calculationMethod) {
    case 'MuslimWorldLeague': params = CalculationMethod.MuslimWorldLeague(); break;
    case 'Egyptian': params = CalculationMethod.Egyptian(); break;
    case 'Karachi': params = CalculationMethod.Karachi(); break;
    case 'UmmAlQura': params = CalculationMethod.UmmAlQura(); break;
    case 'Dubai': params = CalculationMethod.Dubai(); break;
    case 'MoonsightingCommittee': params = CalculationMethod.MoonsightingCommittee(); break;
    case 'NorthAmerica': params = CalculationMethod.NorthAmerica(); break;
    case 'Kuwait': params = CalculationMethod.Kuwait(); break;
    case 'Qatar': params = CalculationMethod.Qatar(); break;
    case 'Singapore': params = CalculationMethod.Singapore(); break;
    case 'Tehran': params = CalculationMethod.Tehran(); break;
    case 'Turkey': params = CalculationMethod.Turkey(); break;
    default: params = CalculationMethod.MuslimWorldLeague(); break;
  }

  params.madhab = asrMethod === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;

  return new PrayerTimes(coordinates, date, params);
};

export const formatTime = (date: Date) => {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};
