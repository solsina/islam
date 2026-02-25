export type TajwidLevel = 'Débutant' | 'Intermédiaire' | 'Avancé';
export type TajwidCategory = 'Toutes' | 'Lettres' | 'Prolongations' | 'Pauses';
export type MakharijType = 'gorge' | 'langue' | 'levres' | 'nez' | null;

export interface TajwidRuleConfig {
  id: string;
  name: string;
  color: string;
  description: string;
  code: string; // The code used in text, e.g., 'q' for [q]...[/q]
}

export const tajwidRules: Record<string, TajwidRuleConfig> = {
  qalqalah: { id: 'qalqalah', name: 'Qalqalah', color: '#f472b6', description: 'Rebond sonore', code: 'q' },
  ghunna: { id: 'ghunna', name: 'Ghunna', color: '#fbbf24', description: 'Nasalisation (2 temps)', code: 'g' },
  idgham: { id: 'idgham', name: 'Idgham', color: '#f87171', description: 'Assimilation', code: 'i' },
  ikhfa: { id: 'ikhfa', name: 'Ikhfa', color: '#a78bfa', description: 'Dissimulation', code: 'k' },
  madd: { id: 'madd', name: 'Madd', color: '#fb923c', description: 'Prolongation', code: 'm' },
  madd_lazim: { id: 'madd_lazim', name: 'Madd Lazim', color: '#ef4444', description: 'Prolongation Obligatoire (6 temps)', code: 'ml' },
  emphatic: { id: 'emphatic', name: 'Emphase', color: '#10b748', description: 'Lettre emphatique', code: 'e' },
};

export interface TajwidExample {
  arabic: string; // Now supports codes like [q]ق[/q]
  explanation: string;
  audioUrl?: string;
}

export interface TajwidLesson {
  id: string;
  title: string;
  content: string;
  level: TajwidLevel;
  color: string;
  icon: string;
  makharij?: MakharijType;
  examples?: TajwidExample[];
}

export interface TajwidModule {
  id: string;
  title: string;
  description: string;
  category: TajwidCategory;
  lessons: TajwidLesson[];
}

export interface VerseWord {
  id: string;
  text: string;
  translation: string;
  ruleId?: string; // Reference to tajwidRules key
  audioUrl?: string;
}

export const verseAnalysisData: VerseWord[] = [
  { id: '1', text: 'بِسْمِ', translation: 'Au nom de', audioUrl: 'https://audio.qurancdn.com/wbw/001_001_001.mp3' },
  { id: '2', text: 'ٱللَّهِ', translation: 'Allah', ruleId: 'emphatic', audioUrl: 'https://audio.qurancdn.com/wbw/001_001_002.mp3' },
  { id: '3', text: 'ٱلرَّحْمَـٰنِ', translation: 'Le Tout Miséricordieux', ruleId: 'idgham', audioUrl: 'https://audio.qurancdn.com/wbw/001_001_003.mp3' },
  { id: '4', text: 'ٱلرَّحِيمِ', translation: 'Le Très Miséricordieux', ruleId: 'madd', audioUrl: 'https://audio.qurancdn.com/wbw/001_001_004.mp3' },
];

export const tajwidData: TajwidModule[] = [
  {
    id: 'makharij',
    title: 'Les Sorties (Makharij)',
    description: 'D\'où sortent les lettres arabes.',
    category: 'Lettres',
    lessons: [
      {
        id: 'halq',
        title: 'La Gorge (Al-Halq)',
        content: 'La gorge produit 6 lettres, divisées en 3 parties : le fond (Hamza, Ha), le milieu (Ayn, Ha), et le haut (Ghayn, Kha).',
        level: 'Débutant',
        color: '#10b748',
        icon: 'record_voice_over',
        makharij: 'gorge',
        examples: [
          { arabic: '[e]ء[/e] , [e]هـ[/e]', explanation: 'Fond de la gorge (Hamza, Ha)', audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/002006.mp3' },
          { arabic: '[e]ع[/e] , [e]ح[/e]', explanation: 'Milieu de la gorge (Ayn, Ha)', audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/001002.mp3' },
          { arabic: '[e]غ[/e] , [e]خ[/e]', explanation: 'Haut de la gorge (Ghayn, Kha)', audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/001007.mp3' }
        ]
      },
      {
        id: 'lisan',
        title: 'La Langue (Al-Lisan)',
        content: 'La langue est le point de sortie majeur, produisant 18 lettres réparties sur 10 points d\'articulation.',
        level: 'Intermédiaire',
        color: '#34d399',
        icon: 'language',
        makharij: 'langue',
        examples: [
          { arabic: '[e]ق[/e]', explanation: 'Fond de la langue (Qaf)', audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/050001.mp3' },
          { arabic: '[e]ك[/e]', explanation: 'Juste en dessous du Qaf (Kaf)', audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/109001.mp3' }
        ]
      }
    ]
  },
  {
    id: 'nun-sakinah',
    title: 'Règles du Nun Sakinah',
    description: 'Les 4 règles fondamentales.',
    category: 'Lettres',
    lessons: [
      {
        id: 'idhar',
        title: 'Al-Idhar (La Clarté)',
        content: 'Prononcer le Nun clairement sans nasalisation si suivi par (ء هـ ع ح غ خ).',
        level: 'Débutant',
        color: '#fbbf24', // Amber
        icon: 'visibility',
        makharij: 'gorge',
        examples: [
          { arabic: 'مِ[e]نْ[/e] خَوْفٍ', explanation: 'Min khawf (Nun clair)', audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/106004.mp3' }
        ]
      },
      {
        id: 'idgham',
        title: 'Al-Idgham (L\'Assimilation)',
        content: 'Fusionner le Nun dans la lettre suivante (ي ر م ل و ن).',
        level: 'Intermédiaire',
        color: '#f87171', // Red
        icon: 'merge',
        makharij: 'nez',
        examples: [
          { arabic: 'مَ[i]ن يَّ[/i]عْمَلْ', explanation: 'May-ya\'mal (Nun assimilé)', audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/099007.mp3' }
        ]
      },
      {
        id: 'iqlab',
        title: 'Al-Iqlab (La Conversion)',
        content: 'Changer le Nun en Mim si suivi par Ba (ب).',
        level: 'Intermédiaire',
        color: '#60a5fa', // Blue
        icon: 'swap_horiz',
        makharij: 'levres',
        examples: [
          { arabic: 'مِ[g]ن بَ[/g]عْدِ', explanation: 'Mim-ba\'di (Nun devient Mim)', audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/057027.mp3' }
        ]
      },
      {
        id: 'ikhfa',
        title: 'Al-Ikhfa (La Dissimulation)',
        content: 'Cacher le Nun avec une nasalisation (Ghunna) pour les 15 autres lettres.',
        level: 'Avancé',
        color: '#a78bfa', // Purple
        icon: 'opacity',
        makharij: 'nez',
        examples: [
          { arabic: 'مِ[k]ن قَ[/k]بْلُ', explanation: 'Ming-qablu (Nun caché)', audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/002025.mp3' }
        ]
      }
    ]
  },
  {
    id: 'qalqalah',
    title: 'Qalqalah (Rebond)',
    description: 'Faire rebondir le son sur 5 lettres.',
    category: 'Lettres',
    lessons: [
      {
        id: 'qalqalah-kubra',
        title: 'Qalqalah Kubra (Fort)',
        content: 'Quand la lettre est à la fin du verset ou qu\'on s\'arrête dessus.',
        level: 'Débutant',
        color: '#f472b6', // Pink
        icon: 'vibration',
        makharij: 'langue',
        examples: [
          { arabic: 'الْفَلَ[q]قِ[/q]', explanation: 'Al-Falaq (arrêt sur Qaf)', audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/113001.mp3' }
        ]
      },
      {
        id: 'qalqalah-sughra',
        title: 'Qalqalah Sughra (Léger)',
        content: 'Quand la lettre est au milieu du mot ou de la phrase.',
        level: 'Débutant',
        color: '#f472b6',
        icon: 'waves',
        makharij: 'langue',
        examples: [
          { arabic: 'يَ[q]قْ[/q]طَعُونَ', explanation: 'Yaq-ta\'un', audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/002027.mp3' }
        ]
      }
    ]
  },
  {
    id: 'madd',
    title: 'Al-Madd (Prolongations)',
    description: 'Allonger le son des voyelles.',
    category: 'Prolongations',
    lessons: [
      {
        id: 'madd-asli',
        title: 'Madd Asli (Naturel)',
        content: '2 temps. La base de toute récitation.',
        level: 'Débutant',
        color: '#fb923c', // Orange
        icon: 'timer',
        makharij: 'gorge',
        examples: [
          { arabic: 'قَ[m]ا[/m]لَ', explanation: 'Qaala (Alif prolongé)', audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/002030.mp3' }
        ]
      },
      {
        id: 'madd-lazim',
        title: 'Madd Lazim (Obligatoire)',
        content: '6 temps. Le plus long des Madd.',
        level: 'Avancé',
        color: '#ef4444', // Red-600
        icon: 'timelapse',
        makharij: 'gorge',
        examples: [
          { arabic: 'الضَّ[ml]ا[/ml]لِّينَ', explanation: 'Ad-Daaallin (6 temps)', audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/001007.mp3' }
        ]
      }
    ]
  }
];
