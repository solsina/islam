export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface ProphetStory {
  id: string;
  title: string;
  duration: string;
  audioSource: string;
  illustrationUrl: string;
  backgroundUrl: string;
  icon: string;
  description: string;
  storyText: string;
  quiz: QuizQuestion[];
  lessons: string[];
}

export const prophetsData: ProphetStory[] = [
  {
    id: 'adam',
    title: 'Adam (as)',
    duration: '12:45',
    audioSource: '',
    illustrationUrl: 'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    backgroundUrl: 'https://images.pexels.com/photos/36717/amazing-animal-beautiful-beautifull.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    icon: 'eco',
    description: 'Le premier homme et le premier prophète de l\'humanité.',

    storyText: 'Au commencement, Allah créa les cieux et la terre. Puis, Il décida de créer un être qui serait Son lieutenant sur terre. Il façonna Adam à partir d\'argile sonnante, issue d\'une boue malléable. Une fois sa forme achevée, Allah lui insuffla de Son Esprit. Adam ouvrit les yeux et la première chose qu\'il fit fut d\'éternuer et de dire : "Alhamdulillah". Allah lui répondit : "Qu\'Allah te fasse miséricorde, ô Adam". Allah enseigna ensuite à Adam le nom de toutes choses, une connaissance que même les anges ne possédaient pas.',
    quiz: [
      {
        question: 'De quoi Adam (as) a-t-il été créé ?',
        options: ['De feu', 'D\'argile', 'De lumière'],
        correctIndex: 1
      },
      {
        question: 'Qui a refusé de se prosterner devant Adam (as) ?',
        options: ['Les Anges', 'Iblis', 'Les Hommes'],
        correctIndex: 1
      },
      {
        question: 'Où Adam (as) et Hawwa ont-ils d\'abord habité ?',
        options: ['Sur Terre', 'Au Paradis', 'Dans les cieux'],
        correctIndex: 1
      }
    ],
    lessons: [
      "L'importance de la connaissance et de l'humilité.",
      "La réalité du repentir et de la miséricorde divine.",
      "La nature de l'épreuve et le libre arbitre."
    ]
  },
  {
    id: 'nuh',
    title: 'Nuh (as)',
    duration: '15:20',
    audioSource: '',
    illustrationUrl: 'https://images.pexels.com/photos/3274903/pexels-photo-3274903.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    backgroundUrl: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    icon: 'sailing',
    description: 'L\'histoire de l\'arche et du grand déluge.',
    storyText: 'Nuh fut envoyé à un peuple qui s\'était égaré et adorait des idoles. Pendant 950 ans, il les appela à l\'unicité d\'Allah avec patience et sagesse, mais peu crurent en lui. Allah lui ordonna alors de construire une arche immense. Les gens se moquaient de lui car il construisait un bateau loin de toute eau. Quand le commandement d\'Allah vint, l\'eau jaillit de la terre et tomba du ciel. Nuh fit monter dans l\'arche un couple de chaque espèce et les croyants. Le déluge emporta tout sur son passage, purifiant la terre de l\'incrédulité.',
    quiz: [
      {
        question: 'Pendant combien d\'années Nuh (as) a-t-il prêché ?',
        options: ['100 ans', '950 ans', '50 ans'],
        correctIndex: 1
      },
      {
        question: 'Qu\'a construit Nuh (as) sur l\'ordre d\'Allah ?',
        options: ['Un temple', 'Une arche', 'Une cité'],
        correctIndex: 1
      },
      {
        question: 'Lequel des membres de sa famille a refusé de monter dans l\'arche ?',
        options: ['Son épouse', 'Son fils', 'Son père'],
        correctIndex: 1
      }
    ],
    lessons: [
      "La persévérance face à l'adversité et au rejet.",
      "La confiance absolue dans le commandement divin.",
      "La justice d'Allah et le salut des croyants."
    ]
  },
  {
    id: 'ibrahim',
    title: 'Ibrahim (as)',
    duration: '18:10',
    audioSource: '',
    illustrationUrl: 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    backgroundUrl: 'https://images.pexels.com/photos/1102915/pexels-photo-1102915.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    icon: 'local_fire_department',
    description: 'Le père des prophètes et l\'ami intime d\'Allah.',
    storyText: 'Ibrahim naquit dans une société d\'idolâtres, mais son cœur cherchait la vérité. Il comprit que les astres et les idoles ne pouvaient être des dieux. Il brisa les idoles de son peuple pour leur montrer leur impuissance. Furieux, le roi Nemrod ordonna de le jeter dans un immense brasier. Mais Allah dit au feu : "Ô feu, sois pour Ibrahim une fraîcheur et un salut". Ibrahim sortit des flammes indemne, sous les yeux ébahis de tous. Il devint le Khalil Allah, l\'ami intime de Dieu, et reconstruisit plus tard la Kaaba avec son fils Ismail.',
    quiz: [
      {
        question: 'Quel roi a jeté Ibrahim (as) dans le feu ?',
        options: ['Pharaon', 'Nemrod', 'Abou Lahab'],
        correctIndex: 1
      },
      {
        question: 'Quel monument Ibrahim (as) et Ismail (as) ont-ils construit ?',
        options: ['La Mosquée Al-Aqsa', 'La Kaaba', 'Le dôme du Rocher'],
        correctIndex: 1
      },
      {
        question: 'Comment Ibrahim (as) est-il surnommé ?',
        options: ['Khalil Allah', 'Habib Allah', 'Kalim Allah'],
        correctIndex: 0
      }
    ],
    lessons: [
      "La recherche de la vérité à travers la raison et l'observation.",
      "Le courage de défier les fausses croyances.",
      "La soumission totale à la volonté d'Allah (Islam)."
    ]
  },
  {
    id: 'musa',
    title: 'Musa (as)',
    duration: '22:30',
    audioSource: '',
    illustrationUrl: 'https://images.pexels.com/photos/933054/pexels-photo-933054.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    backgroundUrl: 'https://images.pexels.com/photos/747964/pexels-photo-747964.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    icon: 'waves',
    description: 'Le prophète qui a parlé à Allah et libéré son peuple.',

    storyText: 'Musa fut sauvé des eaux du Nil par l\'épouse de Pharaon. Élevé au palais, il dut s\'enfuir après un incident et se rendit à Madyan. C\'est au mont Sinaï qu\'Allah lui parla pour la première fois à travers un buisson ardent. Allah lui donna des miracles, dont son bâton qui se transformait en serpent. Musa retourna en Égypte pour défier Pharaon et libérer les Enfants d\'Israël. Devant la mer Rouge, alors que l\'armée de Pharaon les talonnait, Musa frappa la mer de son bâton. Les eaux se fendirent, ouvrant un chemin de salut pour les croyants.',
    quiz: [
      {
        question: 'Sur quel mont Musa (as) a-t-il parlé à Allah ?',
        options: ['Mont Arafat', 'Mont Sinaï', 'Mont Safa'],
        correctIndex: 1
      },
      {
        question: 'Quel miracle a permis de traverser la mer Rouge ?',
        options: ['Le bâton de Musa', 'Une tempête', 'Un pont'],
        correctIndex: 0
      },
      {
        question: 'Qui était le frère de Musa (as) qui l\'a aidé ?',
        options: ['Yusuf', 'Harun', 'Ishaq'],
        correctIndex: 1
      }
    ],
    lessons: [
      "La lutte contre l'injustice et la tyrannie.",
      "L'importance de la patience et de la confiance en Allah.",
      "La puissance des miracles divins comme signes pour l'humanité."
    ]
  }
];
