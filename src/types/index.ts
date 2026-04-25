export type Mood =
  | 'warm'
  | 'fast'
  | 'light'
  | 'cheap'
  | 'healthy'
  | 'sweet'
  | 'any';

export type Situation =
  | 'now'
  | '15min'
  | '30min'
  | 'sitdown'
  | 'delivery'
  | 'pickup';

export type PriceLevel = 1 | 2 | 3;

export type ServiceMode = 'sitdown' | 'pickup' | 'delivery';

export type FoodTag =
  | 'warm'
  | 'fast'
  | 'light'
  | 'cheap'
  | 'healthy'
  | 'sweet'
  | 'meat'
  | 'vegetarian'
  | 'vegan'
  | 'asian'
  | 'czech'
  | 'italian'
  | 'pizza'
  | 'burger'
  | 'soup'
  | 'salad'
  | 'bakery'
  | 'cafe';

export interface Place {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  tags: FoodTag[];
  priceLevel: PriceLevel;
  prepMinutes: number;
  services: ServiceMode[];
  openNow: boolean;
  hoursLabel: string;
  description: string;
  rating: number;
}

export interface UserPreference {
  mood: Mood;
  situation: Situation;
}

export type RecommendationKind = 'best' | 'fastest' | 'alternative';

export interface Recommendation {
  kind: RecommendationKind;
  place: Place;
  score: number;
  reason: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  preference: UserPreference;
  placeId: string;
  placeName: string;
  kind: RecommendationKind;
}
