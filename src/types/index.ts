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

export type GlutenInfo = 'not_set' | 'by_ingredients' | 'celiac_confirmed';

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
  ingredients?: string[];
  chefNote?: string;
  containsAllergens?: string[];
  mayContainAllergens?: string[];
  glutenInfo?: GlutenInfo;
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
  website?: string;
  instagram?: string;
  phone?: string;
}

export type DietaryPreference = 'any' | 'vegetarian' | 'vegan';

export interface UserPreference {
  /** Primary mood. For backward compatibility this stays a single value — it is
   * the first chip the user selected. */
  mood: Mood;
  /** Full list of selected moods (1 or 2). When omitted the engine treats the
   * preference as `[mood]`. */
  moods?: Mood[];
  /** Primary situation. Kept as a single value for backward compatibility. */
  situation: Situation;
  /** Full list of selected situations (1 or 2). When omitted the engine treats
   * the preference as `[situation]`. */
  situations?: Situation[];
  dietaryPreference: DietaryPreference;
}

export type RecommendationKind =
  | 'best'
  | 'fastest'
  | 'alternative'
  | 'match';

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

export type StreetFoodCategory =
  | 'coffee'
  | 'sandwich'
  | 'burger'
  | 'vegan_bowl'
  | 'tacos'
  | 'soup'
  | 'sweet'
  | 'asian_noodles'
  | 'other';

export interface StreetFoodMenuItem {
  id: string;
  name: string;
  description: string;
  priceLevel: PriceLevel;
  preparationMinutes: number;
  tags: FoodTag[];
  isVegetarian: boolean;
  isVegan: boolean;
  isWarm: boolean;
  isSweet: boolean;
  isLight: boolean;
  isQuick: boolean;
  isHealthy: boolean;
}

export interface StreetFoodVendor {
  id: string;
  name: string;
  description: string;
  category: StreetFoodCategory;
  tags: FoodTag[];
  serviceModes: ServiceMode[];
  menuItems: StreetFoodMenuItem[];
  isDemo: boolean;
  contactLabel?: string;
  instagram?: string;
  website?: string;
}

export type StreetFoodCheckInStatus = 'active' | 'inactive';

export interface StreetFoodCheckIn {
  id: string;
  vendorId: string;
  latitude: number;
  longitude: number;
  locationLabel: string;
  activeFrom: number;
  activeUntil: number;
  createdAt: number;
  status: StreetFoodCheckInStatus;
  note?: string;
  offering?: string;
}

export interface ActiveStreetFoodVendor {
  vendor: StreetFoodVendor;
  checkIn: StreetFoodCheckIn;
  distanceMeters: number | null;
}
