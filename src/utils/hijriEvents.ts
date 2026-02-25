import moment from 'moment-hijri';

export interface IslamicEvent {
  id: string;
  title: string;
  desc: string;
  hMonth: number; // 0-indexed (0 = Muharram)
  hDay: number;
  type: 'major' | 'recommended_fast' | 'other';
  shortMonth: string;
}

export const ISLAMIC_EVENTS: IslamicEvent[] = [
  { id: 'muharram_1', title: 'Nouvel An Hégirien', desc: '1er Muharram - Début de l\'année islamique', hMonth: 0, hDay: 1, type: 'major', shortMonth: 'Muh' },
  { id: 'ashura_9', title: 'Tassou\'a', desc: '9ème jour de Muharram', hMonth: 0, hDay: 9, type: 'recommended_fast', shortMonth: 'Muh' },
  { id: 'ashura_10', title: 'Achoura', desc: '10ème jour de Muharram - Jeûne expiatoire', hMonth: 0, hDay: 10, type: 'major', shortMonth: 'Muh' },
  { id: 'mawlid', title: 'Mawlid al-Nabi', desc: 'Naissance du Prophète (ﷺ)', hMonth: 2, hDay: 12, type: 'major', shortMonth: 'Rab' },
  { id: 'isra_miraj', title: 'Isra et Mi\'raj', desc: 'Le Voyage Nocturne et l\'Ascension', hMonth: 6, hDay: 27, type: 'major', shortMonth: 'Raj' },
  { id: 'mid_shaban', title: 'Nisf Sha\'ban', desc: 'La mi-Sha\'ban', hMonth: 7, hDay: 15, type: 'other', shortMonth: 'Sha' },
  { id: 'ramadan_start', title: 'Début du Ramadan', desc: 'Mois béni du jeûne', hMonth: 8, hDay: 1, type: 'major', shortMonth: 'Ram' },
  { id: 'laylat_al_qadr', title: 'Laylat al-Qadr', desc: 'La Nuit du Destin (probable)', hMonth: 8, hDay: 27, type: 'major', shortMonth: 'Ram' },
  { id: 'eid_al_fitr', title: 'Aïd al-Fitr', desc: 'Fête de la rupture du jeûne', hMonth: 9, hDay: 1, type: 'major', shortMonth: 'Cha' },
  { id: 'dhul_hijjah_1', title: '10 jours de Dhul Hijjah', desc: 'Les meilleurs jours de l\'année', hMonth: 11, hDay: 1, type: 'other', shortMonth: 'Dhu' },
  { id: 'arafat', title: 'Jour d\'Arafat', desc: 'Le pilier du Hajj et jeûne recommandé', hMonth: 11, hDay: 9, type: 'major', shortMonth: 'Dhu' },
  { id: 'eid_al_adha', title: 'Aïd al-Adha', desc: 'Fête du sacrifice', hMonth: 11, hDay: 10, type: 'major', shortMonth: 'Dhu' },
];

export const getAdjustedHijri = (date: moment.Moment | Date, adjustment: number) => {
  return moment(date).add(adjustment, 'days');
};

export const getEventsForMonth = (hYear: number, hMonth: number) => {
  return ISLAMIC_EVENTS.filter(e => e.hMonth === hMonth);
};
