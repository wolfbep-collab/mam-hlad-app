import type {
  FoodTag,
  Mood,
  Place,
  Recommendation,
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

const moodLabel: Record<Mood, string> = {
  warm: 'něco teplého',
  fast: 'něco rychlého',
  light: 'něco lehkého',
  cheap: 'něco levného',
  healthy: 'zdravější volbu',
  sweet: 'něco sladkého',
  any: 'cokoliv chutného',
};

interface ScoreBreakdown {
  total: number;
  reasons: string[];
}

function scorePlace(place: Place, pref: UserPreference): ScoreBreakdown {
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
    reasons.push('Nevyhovuje typu obsluhy');
  }

  const moodTags = moodTagBoost[pref.mood];
  if (moodTags.length === 0) {
    score += 6;
  } else {
    const hits = moodTags.filter((t) => place.tags.includes(t)).length;
    if (hits > 0) {
      score += hits * 14;
      reasons.push(`Sedí na ${moodLabel[pref.mood]}`);
    } else {
      score -= 6;
    }
  }

  const maxPrep = situationMaxPrepMinutes[pref.situation];
  if (place.prepMinutes <= maxPrep) {
    const margin = Math.max(0, maxPrep - place.prepMinutes);
    score += 10 + Math.min(margin, 20) * 0.5;
    if (place.prepMinutes <= 10) {
      reasons.push(`Hotovo do ${place.prepMinutes} min`);
    }
  } else {
    score -= (place.prepMinutes - maxPrep) * 1.5;
  }

  if (pref.mood === 'cheap' || pref.situation === 'now') {
    score += (4 - place.priceLevel) * 4;
    if (place.priceLevel === 1) reasons.push('Přátelské ceny');
  }

  score += (place.rating - 4) * 8;
  if (place.rating >= 4.6) reasons.push(`Hodnocení ${place.rating.toFixed(1)}`);

  return { total: score, reasons };
}

function buildReason(
  pref: UserPreference,
  breakdown: ScoreBreakdown,
  place: Place,
  kind: 'best' | 'fastest' | 'alternative'
): string {
  if (kind === 'fastest') {
    return `Hotovo přibližně za ${place.prepMinutes} min — když potřebuješ rychle.`;
  }
  if (kind === 'alternative') {
    return `Jiná chuť, stále dobrá volba: ${place.cuisine.toLowerCase()}.`;
  }
  const top = breakdown.reasons.slice(0, 2);
  if (top.length === 0) {
    return `Solidní volba na ${moodLabel[pref.mood]}.`;
  }
  return `${top.join(' • ')}.`;
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

  const recommendations: Recommendation[] = [];

  if (best) {
    recommendations.push({
      kind: 'best',
      place: best.place,
      score: best.breakdown.total,
      reason: buildReason(pref, best.breakdown, best.place, 'best'),
    });
  }
  if (fastest && fastest.place.id !== best?.place.id) {
    recommendations.push({
      kind: 'fastest',
      place: fastest.place,
      score: fastest.breakdown.total,
      reason: buildReason(pref, fastest.breakdown, fastest.place, 'fastest'),
    });
  }
  if (alternative) {
    recommendations.push({
      kind: 'alternative',
      place: alternative.place,
      score: alternative.breakdown.total,
      reason: buildReason(
        pref,
        alternative.breakdown,
        alternative.place,
        'alternative'
      ),
    });
  }

  return { recommendations, considered: places.length };
}

export const __test = { scorePlace, situationMaxPrepMinutes, moodTagBoost };
