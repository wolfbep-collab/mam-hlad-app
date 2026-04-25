import type {
  FoodTag,
  MenuItem,
  Mood,
  Place,
  Recommendation,
  RecommendationKind,
  ServiceMode,
  Situation,
  UserPreference,
} from '../types';

const moodTagBoost: Record<Mood, FoodTag[]> = {
  warm: ['warm', 'soup'],
  fast: ['fast'],
  light: ['light', 'salad', 'healthy'],
  cheap: ['cheap'],
  healthy: ['healthy', 'salad', 'vegan', 'vegetarian'],
  sweet: ['sweet', 'bakery', 'cafe'],
  any: [],
};

const situationToServices: Record<Situation, ServiceMode[]> = {
  now: ['pickup', 'sitdown'],
  '15min': ['pickup', 'sitdown', 'delivery'],
  '30min': ['pickup', 'sitdown', 'delivery'],
  sitdown: ['sitdown'],
  delivery: ['delivery'],
  pickup: ['pickup'],
};

const situationMaxPrepMinutes: Record<Situation, number> = {
  now: 10,
  '15min': 15,
  '30min': 30,
  sitdown: 60,
  delivery: 45,
  pickup: 20,
};

const moodAdjective: Record<Mood, string | null> = {
  warm: 'teplého',
  fast: 'rychlého',
  light: 'lehkého',
  cheap: 'levného',
  healthy: 'zdravějšího',
  sweet: 'sladkého',
  any: null,
};

const situationConnector: Record<Situation, string> = {
  now: 'a rychlého',
  '15min': 'a rychlého',
  '30min': 'do půl hodiny',
  sitdown: 'v klidu na místě',
  delivery: 's rozvozem',
  pickup: 's sebou',
};

const situationStandalone: Record<Situation, string> = {
  now: 'Hotovo skoro hned.',
  '15min': 'Hotovo do 15 minut.',
  '30min': 'Hotovo zhruba do půl hodiny.',
  sitdown: 'Sedneš si na klidném místě.',
  delivery: 'Dovezou ti to až domů.',
  pickup: 'Vyzvedneš si to a jdeš.',
};

interface PlaceScoreBreakdown {
  total: number;
  reasons: string[];
}

function scorePlace(place: Place, pref: UserPreference): PlaceScoreBreakdown {
  const reasons: string[] = [];
  let score = 0;

  if (!place.openNow) {
    score -= 40;
    reasons.push('Nyní zavřeno');
  }

  const requiredServices = situationToServices[pref.situation];
  const matchesService = requiredServices.some((s) =>
    place.services.includes(s)
  );
  if (matchesService) {
    score += 18;
  } else {
    score -= 25;
  }

  const moodTags = moodTagBoost[pref.mood];
  if (moodTags.length === 0) {
    score += 6;
  } else {
    const hits = moodTags.filter((t) => place.tags.includes(t)).length;
    if (hits > 0) score += hits * 14;
    else score -= 6;
  }

  const maxPrep = situationMaxPrepMinutes[pref.situation];
  if (place.prepMinutes <= maxPrep) {
    const margin = Math.max(0, maxPrep - place.prepMinutes);
    score += 10 + Math.min(margin, 20) * 0.5;
  } else {
    score -= (place.prepMinutes - maxPrep) * 1.5;
  }

  if (pref.mood === 'cheap' || pref.situation === 'now') {
    score += (4 - place.priceLevel) * 4;
  }

  score += (place.rating - 4) * 8;

  return { total: score, reasons };
}

function scoreMenuItem(item: MenuItem, pref: UserPreference): number {
  let score = 0;

  switch (pref.mood) {
    case 'warm':
      if (item.isWarm) score += 16;
      break;
    case 'fast':
      if (item.isQuick) score += 16;
      break;
    case 'light':
      if (item.isLight) score += 16;
      break;
    case 'cheap':
      score += (4 - item.priceLevel) * 5;
      break;
    case 'healthy':
      if (item.isHealthy) score += 16;
      break;
    case 'sweet':
      if (item.isSweet) score += 16;
      break;
    case 'any':
      score += 4;
      break;
  }

  const maxPrep = situationMaxPrepMinutes[pref.situation];
  if (item.preparationMinutes <= maxPrep) {
    score += 8;
  } else {
    score -= (item.preparationMinutes - maxPrep) * 1.0;
  }
  if (item.isQuick) score += 2;

  return score;
}

function pickMenuItemForKind(
  place: Place,
  pref: UserPreference,
  kind: RecommendationKind
): MenuItem | undefined {
  if (place.menuItems.length === 0) return undefined;
  if (kind === 'fastest') {
    return [...place.menuItems].sort(
      (a, b) => a.preparationMinutes - b.preparationMinutes
    )[0];
  }
  return [...place.menuItems]
    .map((it) => ({ it, s: scoreMenuItem(it, pref) }))
    .sort((a, b) => b.s - a.s)[0]?.it;
}

export function pickMenuItems(
  place: Place,
  pref: UserPreference,
  count = 3
): MenuItem[] {
  if (place.menuItems.length === 0) return [];
  return [...place.menuItems]
    .map((it) => ({ it, s: scoreMenuItem(it, pref) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, count)
    .map(({ it }) => it);
}

export function buildHumanReason(pref: UserPreference): string {
  const adj = moodAdjective[pref.mood];
  if (!adj) {
    return situationStandalone[pref.situation];
  }
  const fastMoodOnFastSit =
    pref.mood === 'fast' &&
    (pref.situation === 'now' || pref.situation === '15min');
  if (fastMoodOnFastSit) {
    return `Doporučeno, protože chceš něco ${adj}.`;
  }
  return `Doporučeno, protože chceš něco ${adj} ${situationConnector[pref.situation]}.`;
}

type ReasonRule = {
  match: (item: MenuItem) => boolean;
  variants: Array<(item: MenuItem) => string>;
};

const reasonRules: ReasonRule[] = [
  {
    match: (i) => i.isLight && i.isQuick,
    variants: [
      (i) => `Lehká volba, hotová přibližně za ${i.preparationMinutes} minut.`,
      () => `Něco lehčího, co dlouho nečeká na talíři.`,
      () => `Rychlé a zároveň lehké — nezatíží.`,
    ],
  },
  {
    match: (i) => i.isHealthy && i.isQuick,
    variants: [
      () => `Dobré, když chceš něco zdravějšího bez dlouhého čekání.`,
      (i) => `Zdravější varianta, kterou máš za ${i.preparationMinutes} minut.`,
      () => `Vyvážená volba, která nezdrží.`,
    ],
  },
  {
    match: (i) => i.isWarm && i.isQuick,
    variants: [
      () => `Rychlá teplá volba, která tě zasytí.`,
      (i) => `Teplé jídlo na stole zhruba za ${i.preparationMinutes} minut.`,
      () => `Když chceš teplo a nemáš čas čekat.`,
    ],
  },
  {
    match: (i) => i.isSweet && i.isLight,
    variants: [
      () => `Jemná sladká varianta, když nechceš velké jídlo.`,
      () => `Lehké sladké pohlazení, žádná tíha.`,
      () => `Sladké, ale nepřejíš se.`,
    ],
  },
  {
    match: (i) => i.isSweet && i.isQuick,
    variants: [
      () => `Sladká odměna, kterou dlouho nečekáš.`,
      (i) => `Něco sladkého za ${i.preparationMinutes} minut.`,
    ],
  },
  {
    match: (i) => i.isWarm && i.isHealthy,
    variants: [
      () => `Teplé a zároveň vyvážené — pohladí i zasytí.`,
      () => `Zdravější teplé jídlo, které ti udělá dobře.`,
    ],
  },
  {
    match: (i) => i.isLight && i.isHealthy,
    variants: [
      () => `Lehké a vyvážené, bez zbytečné tíhy.`,
      () => `Zdravější volba, která neleží v žaludku.`,
    ],
  },
  {
    match: (i) => !!i.isVegan && i.isWarm,
    variants: [
      () => `Teplá rostlinná volba, plně vegan.`,
      () => `Vegan a teplé — sytí, ale bez masa.`,
    ],
  },
  {
    match: (i) => !!i.isVegan,
    variants: [
      () => `Plně rostlinná volba, vegan.`,
      () => `Vegan, ale poctivé jídlo.`,
    ],
  },
  {
    match: (i) => i.isHealthy,
    variants: [
      () => `Vyvážená volba, dobrá pro tělo.`,
      () => `Zdravější tip — nevyloží tě.`,
    ],
  },
  {
    match: (i) => i.isLight,
    variants: [
      () => `Lehčí volba, když nechceš nic těžkého.`,
      () => `Něco menšího, co tě nezahltí.`,
    ],
  },
  {
    match: (i) => i.isWarm,
    variants: [
      () => `Teplé jídlo, které zahřeje a zasytí.`,
      () => `Klasika teplé kuchyně — dobře padne.`,
    ],
  },
  {
    match: (i) => i.isSweet,
    variants: [
      () => `Sladká tečka, když máš chuť na něco dobrého.`,
      () => `Pro mlsné jazýčky — sladká volba.`,
    ],
  },
  {
    match: (i) => i.isQuick,
    variants: [
      (i) => `Rychlá volba, hotová zhruba za ${i.preparationMinutes} minut.`,
      () => `Když chceš mít hlad rychle vyřešený.`,
    ],
  },
  {
    match: (i) => i.priceLevel === 1,
    variants: [
      () => `Šetrná volba, která nezruinuje peněženku.`,
      () => `Levnější tip — chuť za málo peněz.`,
    ],
  },
  {
    match: (i) => !!i.isVegetarian,
    variants: [
      () => `Bezmasá varianta, ale poctivá porce.`,
      () => `Vegetariánská volba, sytá a chutná.`,
    ],
  },
];

function pickVariant<T>(variants: T[], seed: string): T {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = ((h * 33) ^ seed.charCodeAt(i)) | 0;
  }
  return variants[Math.abs(h) % variants.length];
}

export function buildMenuItemReason(item: MenuItem): string {
  for (const rule of reasonRules) {
    if (rule.match(item)) {
      const variant = pickVariant(rule.variants, item.id);
      return variant(item);
    }
  }
  return 'Solidní volba na běžný hlad.';
}

export interface RecommendationResult {
  recommendations: Recommendation[];
  considered: number;
}

export function recommend(
  pref: UserPreference,
  places: Place[]
): RecommendationResult {
  const scored = places
    .map((place) => ({
      place,
      breakdown: scorePlace(place, pref),
    }))
    .sort((a, b) => b.breakdown.total - a.breakdown.total);

  const viable = scored.filter((s) => s.place.openNow);
  const pool = viable.length > 0 ? viable : scored;

  const best = pool[0];
  const fastest = [...pool].sort(
    (a, b) => a.place.prepMinutes - b.place.prepMinutes
  )[0];
  const alternative = pool.find(
    (s) => s.place.id !== best?.place.id && s.place.id !== fastest?.place.id
  );

  const baseReason = buildHumanReason(pref);
  const recommendations: Recommendation[] = [];

  const reasonFor = (item: MenuItem | undefined) =>
    item ? buildMenuItemReason(item) : baseReason;

  if (best) {
    const item = pickMenuItemForKind(best.place, pref, 'best');
    recommendations.push({
      kind: 'best',
      place: best.place,
      menuItem: item,
      score: best.breakdown.total,
      reason: reasonFor(item),
    });
  }
  if (fastest && fastest.place.id !== best?.place.id) {
    const item = pickMenuItemForKind(fastest.place, pref, 'fastest');
    recommendations.push({
      kind: 'fastest',
      place: fastest.place,
      menuItem: item,
      score: fastest.breakdown.total,
      reason: reasonFor(item),
    });
  }
  if (alternative) {
    const item = pickMenuItemForKind(alternative.place, pref, 'alternative');
    recommendations.push({
      kind: 'alternative',
      place: alternative.place,
      menuItem: item,
      score: alternative.breakdown.total,
      reason: reasonFor(item),
    });
  }

  return { recommendations, considered: places.length };
}

export const __test = {
  scorePlace,
  scoreMenuItem,
  situationMaxPrepMinutes,
  moodTagBoost,
};
