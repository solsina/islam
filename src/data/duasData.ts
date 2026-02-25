export interface Dua {
  id: string;
  title: string;
  arabic: string;
  phonetic: string;
  translation: string;
  reference: string;
  tags: string[];
  audioUrl?: string; // Added audio URL
}

export interface DuaCategory {
  id: string;
  name: string;
  icon: string;
  duas: Dua[];
}

export const duasData: DuaCategory[] = [
  {
    id: 'emotions',
    name: 'Émotions',
    icon: 'mood',
    duas: [
      {
        id: 'stress-1',
        title: 'Contre l\'anxiété et la tristesse',
        arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ',
        phonetic: 'Allahumma inni a\'udhu bika minal-hammi wal-hazani, wal-\'ajzi wal-kasali, wal-bukhli wal-jubni, wa dala\'id-dayni, wa ghalabatir-rijal.',
        translation: 'Ô Allah ! Je me réfugie auprès de Toi contre les soucis et la tristesse, l\'impuissance et la paresse, l\'avarice et la lâcheté, le poids de la dette et la domination des hommes.',
        reference: 'Al-Bukhari 7/158',
        tags: ['stress', 'tristesse', 'protection'],
        audioUrl: 'https://media.al-islam.com/downloads/duas/120.mp3' // Example URL, replace with reliable source if needed
      },
      {
        id: 'gratitude-1',
        title: 'Remerciement pour les bienfaits',
        arabic: 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَى وَالِدَيَّ',
        phonetic: 'Rabbi awzi\'ni an ashkura ni\'matakal-lati an\'amta \'alayya wa \'ala walidayya.',
        translation: 'Ô mon Seigneur ! Inspire-moi de Te rendre grâce pour le bienfait dont Tu m\'as comblé ainsi qu\'à mes père et mère.',
        reference: 'Coran 46:15',
        tags: ['gratitude', 'famille'],
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/046015.mp3'
      },
      {
        id: 'protection-1',
        title: 'Protection contre tout mal',
        arabic: 'بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
        phonetic: 'Bismillahil-ladhi la yadurru ma\'as-mihi shay\'un fil-ardi wa la fis-sama\'i wa huwas-sami\'ul-\'alim.',
        translation: 'Au nom d\'Allah, Celui dont le nom protège de tout mal sur la terre et dans le ciel, et Il est l\'Audient, l\'Omniscient.',
        reference: 'Abu Dawud 4/323',
        tags: ['protection', 'santé']
      },
      {
        id: 'family-1',
        title: 'Pour la famille',
        arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
        phonetic: 'Rabbana hab lana min azwajina wa dhuriyyatina qurrata a\'yunin waj\'alna lil-muttaqina imama.',
        translation: 'Seigneur ! Accorde-nous, en nos épouses et nos descendants, la joie des yeux, et fais de nous un guide pour les pieux.',
        reference: 'Coran 25:74',
        tags: ['famille', 'bonheur'],
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/025074.mp3'
      },
      {
        id: 'health-1',
        title: 'Pour la guérison',
        arabic: 'اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ اشْفِ أَنْتَ الشَّافِي لَا شِفَاءَ إِلَّا شِفَاؤُكَ شِفَاءً لَا يُغَادِرُ سَقَمًا',
        phonetic: 'Allahumma rabban-nasi adh-hibil-ba\'sa ishfi antash-shafi la shifa\'a illa shifa\'uka shifa\'an la yughadiru saqama.',
        translation: 'Ô Allah, Seigneur des hommes ! Fais partir le mal. Guéris, car c\'est Toi le Guérisseur, il n\'y a de guérison que la Tienne, une guérison qui ne laisse aucune maladie.',
        reference: 'Al-Bukhari 7/172',
        tags: ['santé', 'protection']
      },
      {
        id: 'patience-1',
        title: 'Pour la patience',
        arabic: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَتَوَفَّنَا مُسْلِمِينَ',
        phonetic: 'Rabbana afrigh \'alayna sabran wa tawaffana muslimin.',
        translation: 'Seigneur ! Déverse sur nous l\'endurance et fais-nous mourir entièrement soumis.',
        reference: 'Coran 7:126',
        tags: ['stress', 'patience'],
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/007126.mp3'
      }
    ]
  },
  {
    id: 'morning_evening',
    name: 'Matin & Soir',
    icon: 'routine',
    duas: [
      {
        id: 'me-1',
        title: 'Au réveil',
        arabic: 'الْحَمْدُ للهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
        phonetic: 'Alhamdu lillahil-ladhi ahyana ba\'da ma amatana wa-ilayhin-nushur.',
        translation: 'Louange à Allah qui nous a redonné la vie après nous avoir fait mourir, et c\'est vers Lui que se fera la résurrection.',
        reference: 'Al-Bukhari 11/113',
        tags: ['gratitude', 'matin']
      },
      {
        id: 'me-2',
        title: 'Le soir',
        arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ للهِ وَالْحَمْدُ للهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
        phonetic: 'Amsayna wa-amsal-mulku lillah walhamdu lillah, la ilaha illallahu wahdahu la sharika lah.',
        translation: 'Nous voici au soir et la royauté appartient à Allah. Louange à Allah. Il n\'y a de divinité digne d\'adoration qu\'Allah, l\'Unique, sans associé.',
        reference: 'Muslim 4/2088',
        tags: ['soir', 'gratitude']
      }
    ]
  },
  {
    id: 'travel',
    name: 'Voyage',
    icon: 'flight',
    duas: [
      {
        id: 'tr-1',
        title: 'En montant dans un moyen de transport',
        arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
        phonetic: 'Subhanal-ladhi sakhkhara lana hadha wa-ma kunna lahu muqrinin. Wa-inna ila Rabbina lamunqalibun.',
        translation: 'Gloire à Celui qui a mis ceci à notre disposition alors que nous n\'étions pas capables de le dominer. Et c\'est vers notre Seigneur que nous retournerons.',
        reference: 'Abu Dawud 3/34',
        tags: ['voyage', 'protection'],
        audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/043013.mp3' // Using Quranic verse part for travel dua context
      }
    ]
  },
  {
    id: 'forgiveness',
    name: 'Pardon',
    icon: 'volunteer_activism',
    duas: [
      {
        id: 'istighfar-1',
        title: 'Sayyid al-Istighfar',
        arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
        phonetic: 'Allahumma anta Rabbi la ilaha illa ant, khalaqtani wa ana \'abduk, wa ana \'ala \'ahdika wa wa\'dika mastata\'t, a\'udhu bika min sharri ma sana\'t, abu\'u laka bini\'matika \'alayya, wa abu\'u bidhanbi faghfir li fa-innahu la yaghfirudh-dhunuba illa ant.',
        translation: 'Ô Allah ! Tu es mon Seigneur, il n\'y a de divinité que Toi. Tu m\'as créé et je suis Ton serviteur, je tiens mon engagement et ma promesse envers Toi autant que je le peux. Je cherche refuge auprès de Toi contre le mal de ce que j\'ai fait. Je reconnais Tes bienfaits envers moi et je reconnais mon péché. Pardonne-moi donc, car nul ne pardonne les péchés si ce n\'est Toi.',
        reference: 'Al-Bukhari 7/150',
        tags: ['pardon', 'matin', 'soir']
      }
    ]
  },
  {
    id: 'home',
    name: 'Maison',
    icon: 'home',
    duas: [
      {
        id: 'home-enter',
        title: 'En entrant à la maison',
        arabic: 'بِسْمِ اللهِ وَلَجْنَا، وَبِسْمِ اللهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا',
        phonetic: 'Bismillahi walajna, wa bismillahi kharajna, wa \'ala Rabbina tawakkalna.',
        translation: 'Au nom d\'Allah nous entrons et au nom d\'Allah nous sortons, et en notre Seigneur nous plaçons notre confiance.',
        reference: 'Abu Dawud 4/325',
        tags: ['maison', 'protection']
      },
      {
        id: 'home-exit',
        title: 'En sortant de la maison',
        arabic: 'بِسْمِ اللهِ، تَوَكَّلْتُ عَلَى اللهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ',
        phonetic: 'Bismillah, tawakkaltu \'alallah, wa la hawla wa la quwwata illa billah.',
        translation: 'Au nom d\'Allah, je place ma confiance en Allah. Il n\'y a de puissance ni de force qu\'en Allah.',
        reference: 'Abu Dawud 4/325',
        tags: ['maison', 'protection']
      }
    ]
  }
];
