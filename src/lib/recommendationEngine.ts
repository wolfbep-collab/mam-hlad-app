import type {
  DietaryPreference,
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
import { isPlaceOpenNow } from './openingHours';
import { calculateDistanceMeters, type UserLocation } from './location';

function matchesDiet(item: MenuItem, diet: DietaryPreference): boolean {
  if (diet === 'any') return true;
  if (diet === 'vegan') return item.isVegan === true;
  return item.isVegetarian === true || item.isVegan === true;
}

function placeHasDietaryItem(place: Place, diet: DietaryPreference): boolean {
  if (diet === 'any') return true;
  return place.menuItems.some((it) => matchesDiet(it, diet));
}

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

function scoreDistance(meters: number | null): number {
  if (meters == null) return 0;
  if (meters < 500) return 12;
  if (meters < 1000) return 6;
  if (meters < 2000) return 0;
  if (meters < 5000) return -6;
  return -14;
}

function scorePlace(
  place: Place,
  pref: UserPreference,
  now: Date,
  userLocation?: UserLocation | null
): PlaceScoreBreakdown {
  const reasons: string[] = [];
  let score = 0;

  if (!isPlaceOpenNow(place, now)) {
    score -= 40;
    reasons.push('Nyní zavřeno');
  }

  if (userLocation) {
    const d = calculateDistanceMeters(userLocation, place);
    score += scoreDistance(d);
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

const RECENT_PLACE_PENALTY = -10;
const RECENT_MENU_ITEM_PENALTY = -15;

function scoreMenuItem(
  item: MenuItem,
  pref: UserPreference,
  recentMenuItemNames?: Set<string>
): number {
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

  if (recentMenuItemNames && recentMenuItemNames.has(item.name)) {
    score += RECENT_MENU_ITEM_PENALTY;
  }

  return score;
}

function pickMenuItemForKind(
  place: Place,
  pref: UserPreference,
  kind: RecommendationKind,
  recentMenuItemNames?: Set<string>
): MenuItem | undefined {
  const eligible = place.menuItems.filter((it) =>
    matchesDiet(it, pref.dietaryPreference)
  );
  if (eligible.length === 0) return undefined;
  if (kind === 'fastest') {
    return [...eligible].sort(
      (a, b) => a.preparationMinutes - b.preparationMinutes
    )[0];
  }
  return [...eligible]
    .map((it) => ({ it, s: scoreMenuItem(it, pref, recentMenuItemNames) }))
    .sort((a, b) => b.s - a.s)[0]?.it;
}

export function pickMenuItems(
  place: Place,
  pref: UserPreference,
  count = 3
): MenuItem[] {
  const eligible = place.menuItems.filter((it) =>
    matchesDiet(it, pref.dietaryPreference)
  );
  if (eligible.length === 0) return [];
  return [...eligible]
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

export function buildMenuItemReason(item: MenuItem, seedSuffix = ''): string {
  for (const rule of reasonRules) {
    if (rule.match(item)) {
      const variant = pickVariant(rule.variants, item.id + seedSuffix);
      return variant(item);
    }
  }
  return 'Solidní volba na běžný hlad.';
}

export interface RecommendationResult {
  recommendations: Recommendation[];
  considered: number;
  scarce: boolean;
  freshenedFromHistory: boolean;
}

export interface RecommendOptions {
  excludePlaceIds?: string[];
  userLocation?: UserLocation | null;
  recentPlaceIds?: string[];
  recentMenuItemNames?: string[];
}

const SCARCE_THRESHOLD = 3;

export function recommend(
  pref: UserPreference,
  places: Place[],
  options: RecommendOptions = {}
): RecommendationResult {
  const now = new Date();
  const excluded = new Set(options.excludePlaceIds ?? []);
  const userLocation = options.userLocation ?? null;
  const recentPlaceIds = new Set(options.recentPlaceIds ?? []);
  const recentMenuItemNames = new Set(options.recentMenuItemNames ?? []);
  const hasRecentSignals =
    recentPlaceIds.size > 0 || recentMenuItemNames.size > 0;
  const dietEligible = places.filter((p) =>
    placeHasDietaryItem(p, pref.dietaryPreference)
  );
  const filteredPlaces = dietEligible.filter((p) => !excluded.has(p.id));
  const scored = filteredPlaces.map((place) => {
    const baseTotal = scorePlace(place, pref, now, userLocation).total;
    const recentPenalty = recentPlaceIds.has(place.id)
      ? RECENT_PLACE_PENALTY
      : 0;
    return {
      place,
      baseTotal,
      adjustedTotal: baseTotal + recentPenalty,
      openNow: isPlaceOpenNow(place, now),
      distanceMeters: userLocation
        ? calculateDistanceMeters(userLocation, place)
        : null,
      isRecent: recentPenalty < 0,
    };
  });

  const sortedAdjusted = [...scored].sort(
    (a, b) => b.adjustedTotal - a.adjustedTotal
  );

  const viable = sortedAdjusted.filter((s) => s.openNow);
  const pool = viable.length > 0 ? viable : sortedAdjusted;

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
    const item = pickMenuItemForKind(
      best.place,
      pref,
      'best',
      recentMenuItemNames
    );
    recommendations.push({
      kind: 'best',
      place: best.place,
      menuItem: item,
      score: best.adjustedTotal,
      reason: reasonFor(item),
      distanceMeters: best.distanceMeters ?? undefined,
    });
  }
  if (fastest && fastest.place.id !== best?.place.id) {
    const item = pickMenuItemForKind(
      fastest.place,
      pref,
      'fastest',
      recentMenuItemNames
    );
    recommendations.push({
      kind: 'fastest',
      place: fastest.place,
      menuItem: item,
      score: fastest.adjustedTotal,
      reason: reasonFor(item),
      distanceMeters: fastest.distanceMeters ?? undefined,
    });
  }
  if (alternative) {
    const item = pickMenuItemForKind(
      alternative.place,
      pref,
      'alternative',
      recentMenuItemNames
    );
    recommendations.push({
      kind: 'alternative',
      place: alternative.place,
      menuItem: item,
      score: alternative.adjustedTotal,
      reason: reasonFor(item),
      distanceMeters: alternative.distanceMeters ?? undefined,
    });
  }

  const scarce =
    pref.dietaryPreference !== 'any' &&
    (dietEligible.length < SCARCE_THRESHOLD ||
      pool.filter((s) => s.openNow).length < SCARCE_THRESHOLD);

  let freshenedFromHistory = false;
  if (hasRecentSignals && best) {
    const sortedBase = [...scored]
      .filter((s) => (viable.length > 0 ? s.openNow : true))
      .sort((a, b) => b.baseTotal - a.baseTotal);
    const baseTop = sortedBase[0];
    if (baseTop && baseTop.place.id !== best.place.id && baseTop.isRecent) {
      freshenedFromHistory = true;
    }
  }

  return {
    recommendations,
    considered: places.length,
    scarce,
    freshenedFromHistory,
  };
}

export function countViableTips(
  pref: UserPreference,
  places: Place[]
): number {
  const now = new Date();
  const requiredServices = situationToServices[pref.situation];
  const maxPrep = situationMaxPrepMinutes[pref.situation];
  const moodTags = moodTagBoost[pref.mood];
  return places.filter((p) => {
    if (!placeHasDietaryItem(p, pref.dietaryPreference)) return false;
    if (!isPlaceOpenNow(p, now)) return false;
    if (!requiredServices.some((s) => p.services.includes(s))) return false;
    if (p.prepMinutes > maxPrep + 5) return false;
    if (moodTags.length > 0 && !moodTags.some((t) => p.tags.includes(t))) {
      return false;
    }
    return true;
  }).length;
}

export const __test = {
  scorePlace,
  scoreMenuItem,
  situationMaxPrepMinutes,
  moodTagBoost,
};
