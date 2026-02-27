import moment from 'moment-hijri';

export interface IslamicHoliday {
  hijriDate: string; // MM-DD
  name: string;
  type: 'holiday' | 'fasting' | 'special';
  description: string;
}

export const ISLAMIC_HOLIDAYS: IslamicHoliday[] = [
  { hijriDate: '01-01', name: 'Nouvel An Hégirien', type: 'special', description: 'Premier jour de l\'année hégirienne.' },
  { hijriDate: '01-10', name: 'Achoura', type: 'fasting', description: 'Jour de jeûne recommandé (avec le 9ème ou 11ème jour).' },
  { hijriDate: '03-12', name: 'Mawlid', type: 'special', description: 'Naissance du Prophète Muhammad (ﷺ).' },
  { hijriDate: '07-27', name: 'Al-Isra wal-Miraj', type: 'special', description: 'Le voyage nocturne et l\'ascension.' },
  { hijriDate: '08-15', name: 'Nisf Sha\'ban', type: 'special', description: 'La nuit de la mi-Cha\'ban.' },
  { hijriDate: '09-01', name: 'Début du Ramadan', type: 'fasting', description: 'Premier jour du mois béni de Ramadan.' },
  { hijriDate: '09-27', name: 'Laylat al-Qadr', type: 'special', description: 'La Nuit du Destin (date approximative).' },
  { hijriDate: '10-01', name: 'Aïd al-Fitr', type: 'holiday', description: 'Fête de la rupture du jeûne.' },
  { hijriDate: '12-09', name: 'Jour d\'Arafat', type: 'fasting', description: 'Jour de jeûne très recommandé pour les non-pèlerins.' },
  { hijriDate: '12-10', name: 'Aïd al-Adha', type: 'holiday', description: 'Fête du sacrifice.' },
];

export const getHolidaysForGregorianYear = (gregorianYear: number, hijriAdjustment: number = 0) => {
  const holidays = [];
  // A gregorian year overlaps with two hijri years usually.
  // We check dates from Jan 1st to Dec 31st of the gregorian year.
  
  const startOfYear = moment(`${gregorianYear}-01-01`, 'YYYY-MM-DD');
  const endOfYear = moment(`${gregorianYear}-12-31`, 'YYYY-MM-DD');
  
  let current = startOfYear.clone();
  
  while (current.isSameOrBefore(endOfYear)) {
    const adjustedDate = current.clone().add(hijriAdjustment, 'days');
    const hMonth = String(adjustedDate.iMonth() + 1).padStart(2, '0');
    const hDay = String(adjustedDate.iDate()).padStart(2, '0');
    const hDateStr = `${hMonth}-${hDay}`;
    
    const holiday = ISLAMIC_HOLIDAYS.find(h => h.hijriDate === hDateStr);
    if (holiday) {
      holidays.push({
        ...holiday,
        gregorianDate: current.format('YYYY-MM-DD'),
        hijriYear: adjustedDate.iYear()
      });
    }
    
    current.add(1, 'days');
  }
  
  return holidays;
};

export const getHolidayForDate = (dateStr: string, hijriAdjustment: number = 0) => {
  const date = moment(dateStr, 'YYYY-MM-DD');
  const adjustedDate = date.clone().add(hijriAdjustment, 'days');
  const hMonth = String(adjustedDate.iMonth() + 1).padStart(2, '0');
  const hDay = String(adjustedDate.iDate()).padStart(2, '0');
  const hDateStr = `${hMonth}-${hDay}`;
  
  return ISLAMIC_HOLIDAYS.find(h => h.hijriDate === hDateStr);
};
