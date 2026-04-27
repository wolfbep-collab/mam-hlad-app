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

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  priceLevel: PriceLevel;
  preparationMinutes: number;
  tags: FoodTag[];
  isVegetarian: boolean;
  isVegan?: boolean;
  isWarm: boolean;
  isSweet: boolean;
  isLight: boolean;
  isQuick: boolean;
  isHealthy: boolean;
}

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface TimeRange {
  open: string;
  close: string;
}

export type OpeningHours = Record<Weekday, TimeRange[]>;

export interface Place {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  tags: FoodTag[];
  priceLevel: PriceLevel;
  prepMinutes: number;
  services: ServiceMode[];
  openingHours: OpeningHours;
  description: string;
  rating: number;
  menuItems: MenuItem[];
  latitude?: number;
  longitude?: number;
}

export type DietaryPreference = 'any' | 'vegetarian' | 'vegan';

export interface UserPreference {
  mood: Mood;
  situation: Situation;
  dietaryPreference: DietaryPreference;
}

export type RecommendationKind = 'best' | 'fastest' | 'alternative';

export interface Recommendation {
  kind: RecommendationKind;
  place: Place;
  menuItem?: MenuItem;
  score: number;
  reason: string;
  distanceMeters?: number;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  preference: UserPreference;
  placeId: string;
  placeName: string;
  menuItemName?: string;
  menuItemIsVegetarian?: boolean;
  menuItemIsVegan?: boolean;
  kind: RecommendationKind;
}
