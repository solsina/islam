export interface PrayerStep {
  title: string;
  action: string;
  recitation?: string;
  translation?: string;
  transliteration?: string;
  image?: string;
  repetitions?: number;
  type?: 'Obligatoire' | 'Sunnah';
  tip?: string;
}

export const WUDU_STEPS: PrayerStep[] = [
  {
    title: "Intention (Niyyah)",
    action: "Formulez l'intention dans votre cœur de faire les ablutions pour plaire à Allah.",
    recitation: "Bismillah",
    translation: "Au nom d'Allah",
    transliteration: "Bismillah",
    repetitions: 1,
    type: "Obligatoire",
    tip: "L'intention se fait dans le cœur et n'a pas besoin d'être prononcée à voix haute, à l'exception du 'Bismillah'."
  },
  {
    title: "Laver les mains",
    action: "Lavez vos mains trois fois jusqu'aux poignets, en commençant par la droite.",
    repetitions: 3,
    type: "Sunnah",
    tip: "N'oubliez pas de bien frotter entre les doigts et de faire pénétrer l'eau."
  },
  {
    title: "Rincer la bouche",
    action: "Prenez de l'eau avec votre main droite et rincez-vous la bouche trois fois.",
    repetitions: 3,
    type: "Sunnah",
    tip: "Faites circuler l'eau dans toute la bouche avant de la recracher."
  },
  {
    title: "Nettoyer le nez",
    action: "Aspirez de l'eau par le nez (Istinshaq) et rejetez-la (Istinthaar) trois fois.",
    repetitions: 3,
    type: "Sunnah",
    tip: "Utilisez la main droite pour aspirer l'eau et la main gauche pour la rejeter."
  },
  {
    title: "Laver le visage",
    action: "Lavez votre visage trois fois, du haut du front jusqu'au bas du menton et d'une oreille à l'autre.",
    repetitions: 3,
    type: "Obligatoire",
    tip: "Assurez-vous que l'eau touche chaque partie de votre visage, y compris la barbe si elle n'est pas épaisse."
  },
  {
    title: "Laver les bras",
    action: "Lavez vos bras jusqu'aux coudes inclus, trois fois, en commençant par le bras droit.",
    repetitions: 3,
    type: "Obligatoire",
    tip: "L'eau doit couler au-delà du coude pour s'assurer que toute la zone obligatoire est lavée."
  },
  {
    title: "Passer les mains sur la tête",
    action: "Passez vos mains mouillées sur votre tête, du front vers la nuque, puis revenez vers le front.",
    repetitions: 1,
    type: "Obligatoire",
    tip: "Un seul passage (aller-retour) est suffisant selon la Sunnah."
  },
  {
    title: "Nettoyer les oreilles",
    action: "Nettoyez l'intérieur de vos oreilles avec vos index et l'extérieur avec vos pouces.",
    repetitions: 1,
    type: "Sunnah",
    tip: "Utilisez la même eau que celle utilisée pour essuyer la tête."
  },
  {
    title: "Laver les pieds",
    action: "Lavez vos pieds jusqu'aux chevilles incluses, trois fois, en commençant par le pied droit.",
    repetitions: 3,
    type: "Obligatoire",
    tip: "N'oubliez pas de frotter entre les orteils avec votre auriculaire gauche et de bien laver les talons."
  },
  {
    title: "Invocation finale",
    action: "Récitez l'attestation de foi après avoir terminé, en regardant vers le ciel.",
    recitation: "Ash-hadu an la ilaha illallah wahdahu la sharika lah, wa ash-hadu anna Muhammadan 'abduhu wa rasuluh.",
    translation: "J'atteste qu'il n'y a de divinité qu'Allah, l'Unique sans associé, et j'atteste que Muhammad est Son serviteur et Son Messager.",
    transliteration: "Ash-hadu an la ilaha illallah...",
    repetitions: 1,
    type: "Sunnah",
    tip: "Celui qui récite cette invocation après les ablutions, les huit portes du Paradis s'ouvriront pour lui."
  }
];

const generateRakah = (rakahNumber: number, totalRakat: number): PrayerStep[] => {
  const isFirstOrSecond = rakahNumber === 1 || rakahNumber === 2;
  const isLast = rakahNumber === totalRakat;
  const isSecond = rakahNumber === 2;
  
  const steps: PrayerStep[] = [];
  
  if (rakahNumber === 1) {
    steps.push({ title: "Takbir al-Ihram", action: "Levez les mains au niveau des oreilles et commencez la prière.", recitation: "Allahu Akbar", translation: "Allah est le plus Grand", transliteration: "Allāhu Akbar" });
  } else {
    steps.push({ title: `Début Rak'ah ${rakahNumber}`, action: "Levez-vous pour la prochaine unité de prière.", recitation: "Allahu Akbar", translation: "Allah est le plus Grand", transliteration: "Allāhu Akbar" });
  }

  steps.push({ 
    title: "Qiyam (Position debout)", 
    action: `Placez votre main droite sur votre main gauche sur votre poitrine. Récitez la Sourate Al-Fatiha${isFirstOrSecond ? " puis une autre sourate courte" : ""}.`, 
    recitation: "Al-hamdu lillāhi rabbil-ʿālamīn...", 
    translation: "Louange à Allah, Seigneur de l'univers...", 
    transliteration: "Al-ḥamdu lillāhi rabbil-ʿālamīn" 
  });

  steps.push({ title: "Ruku (Inclinaison)", action: "Inclinez-vous en gardant le dos droit et les mains sur les genoux.", recitation: "Subḥāna rabbiyal-ʿaẓīm (3x)", translation: "Gloire à mon Seigneur l'Immense", transliteration: "Subḥāna rabbiyal-ʿaẓīm" });
  steps.push({ title: "I'tidal (Redressement)", action: "Redressez-vous complètement.", recitation: "Samiʿallāhu liman ḥamidah", translation: "Allah écoute celui qui Le loue", transliteration: "Samiʿallāhu liman ḥamidah" });
  steps.push({ title: "Sujud (Prosternation)", action: "Prosternez-vous au sol (front, nez, mains, genoux et pieds touchant le sol).", recitation: "Subḥāna rabbiyal-aʿlā (3x)", translation: "Gloire à mon Seigneur le Très-Haut", transliteration: "Subḥāna rabbiyal-aʿlā" });
  steps.push({ title: "Jalsah (Assise)", action: "Asseyez-vous sur vos talons.", recitation: "Rabbighfir lī", translation: "Seigneur pardonne-moi", transliteration: "Rabbighfir lī" });
  steps.push({ title: "Sujud (2ème Prosternation)", action: "Prosternez-vous une seconde fois.", recitation: "Subḥāna rabbiyal-aʿlā (3x)", translation: "Gloire à mon Seigneur le Très-Haut", transliteration: "Subḥāna rabbiyal-aʿlā" });

  if (isSecond && totalRakat > 2) {
    steps.push({ title: "Premier Tashahhud", action: "Asseyez-vous et récitez la première partie du Tashahhud.", recitation: "At-taḥiyyātu lillāhi waṣ-ṣalawātu...", translation: "Les salutations sont pour Allah...", transliteration: "At-taḥiyyātu lillāhi waṣ-ṣalawātu" });
  }

  if (isLast) {
    steps.push({ title: "Tashahhud Final", action: "Asseyez-vous et récitez le Tashahhud complet ainsi que la prière Ibrahimiyyah.", recitation: "At-taḥiyyātu lillāhi... Allāhumma ṣalli ʿalā Muḥammad...", translation: "Les salutations sont pour Allah... Ô Allah, prie sur Muhammad...", transliteration: "At-taḥiyyātu lillāhi... Allāhumma ṣalli ʿalā Muḥammad..." });
    steps.push({ title: "Taslim (Salutation finale)", action: "Tournez la tête à droite puis à gauche.", recitation: "As-salāmu ʿalaykum wa-raḥmatullāh", translation: "Que la paix et la miséricorde d'Allah soient sur vous", transliteration: "As-salāmu ʿalaykum wa-raḥmatullāh" });
  }

  return steps;
};

const generatePrayer = (totalRakat: number): PrayerStep[] => {
  let steps: PrayerStep[] = [];
  for (let i = 1; i <= totalRakat; i++) {
    steps = [...steps, ...generateRakah(i, totalRakat)];
  }
  return steps;
};

export const SALAH_STEPS: Record<string, PrayerStep[]> = {
  "fajr": generatePrayer(2),
  "dhuhr": generatePrayer(4),
  "asr": generatePrayer(4),
  "maghrib": generatePrayer(3),
  "isha": generatePrayer(4),
  "generic": generatePrayer(2)
};
