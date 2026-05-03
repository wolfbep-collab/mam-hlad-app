import type {
  PriceLevel,
  StreetFoodCheckIn,
  StreetFoodMenuItem,
  StreetFoodVendor,
} from '../types';
import { calculateDistanceMeters, type UserLocation } from '../lib/location';

const item = (
  id: string,
  name: string,
  description: string,
  priceLevel: PriceLevel,
  preparationMinutes: number,
  tags: StreetFoodMenuItem['tags'],
  flags: Partial<
    Pick<
      StreetFoodMenuItem,
      | 'isVegetarian'
      | 'isVegan'
      | 'isWarm'
      | 'isSweet'
      | 'isLight'
      | 'isQuick'
      | 'isHealthy'
    >
  >
): StreetFoodMenuItem => {
  const isVegan = flags.isVegan ?? false;
  return {
    id,
    name,
    description,
    priceLevel,
    preparationMinutes,
    tags,
    isVegan,
    isVegetarian: isVegan || (flags.isVegetarian ?? false),
    isWarm: flags.isWarm ?? false,
    isSweet: flags.isSweet ?? false,
    isLight: flags.isLight ?? false,
    isQuick: flags.isQuick ?? preparationMinutes <= 6,
    isHealthy: flags.isHealthy ?? false,
  };
};

export const demoStreetFoodVendors: StreetFoodVendor[] = [
  {
    id: 'sf01',
    name: 'Karavan Káva',
    description: 'Mobilní espresso bar v dodávce. Specialty káva z lokální pražírny.',
    category: 'coffee',
    tags: ['cafe', 'fast'],
    serviceModes: ['pickup'],
    isDemo: true,
    instagram: '@karavankava.demo',
    menuItems: [
      item('sf01-i1', 'Espresso', 'Dvojité espresso z house blendu.', 1, 3, ['cafe'], { isVegan: true, isQuick: true, isWarm: true }),
      item('sf01-i2', 'Cappuccino s ovesným mlékem', 'Hedvábná pěna na ovesném mléce.', 2, 4, ['cafe'], { isVegan: true, isQuick: true, isWarm: true }),
      item('sf01-i3', 'Domácí croissant', 'Máslový, křupavý, pečený ráno.', 1, 2, ['bakery', 'sweet'], { isVegetarian: true, isSweet: true, isQuick: true }),
    ],
  },
  {
    id: 'sf02',
    name: 'Pan Krajíc',
    description: 'Sendviče z poctivého kvasového chleba a sezónních surovin.',
    category: 'sandwich',
    tags: ['fast', 'light'],
    serviceModes: ['pickup'],
    isDemo: true,
    menuItems: [
      item('sf02-i1', 'Caprese sendvič', 'Mozzarella, rajčata, bazalka, olivový olej.', 2, 5, ['vegetarian', 'light'], { isVegetarian: true, isLight: true, isQuick: true }),
      item('sf02-i2', 'Hummus & grilovaná zelenina', 'Cizrnový hummus, cuketa, paprika, špenát.', 2, 5, ['vegan', 'light', 'healthy'], { isVegan: true, isLight: true, isHealthy: true, isQuick: true }),
      item('sf02-i3', 'Šunka & ementál', 'Pražská šunka, sýr, dijonská hořčice.', 2, 4, ['meat', 'fast'], { isQuick: true }),
    ],
  },
  {
    id: 'sf03',
    name: 'Bowery Burgers',
    description: 'Smashed burgery z hovězího od českého farmáře.',
    category: 'burger',
    tags: ['burger', 'warm', 'meat'],
    serviceModes: ['pickup'],
    isDemo: true,
    menuItems: [
      item('sf03-i1', 'Smashed cheeseburger', 'Hovězí 150 g, čedar, cibule, brioška.', 2, 8, ['burger', 'warm', 'meat'], { isWarm: true }),
      item('sf03-i2', 'Double Bowery', 'Dvě hovězí placky, slanina, čedar.', 3, 10, ['burger', 'warm', 'meat'], { isWarm: true }),
      item('sf03-i3', 'Falafel burger', 'Domácí falafel, tahini, salát, rajče.', 2, 8, ['burger', 'warm', 'vegan'], { isVegan: true, isWarm: true }),
    ],
  },
  {
    id: 'sf04',
    name: 'Bowl & Soul',
    description: 'Veganské bowls z lokální zeleniny, luštěnin a obilovin.',
    category: 'vegan_bowl',
    tags: ['vegan', 'healthy', 'light'],
    serviceModes: ['pickup'],
    isDemo: true,
    instagram: '@bowlandsoul.demo',
    menuItems: [
      item('sf04-i1', 'Quinoa & pečená dýně', 'Quinoa, dýně Hokkaido, granátové jablko, tahini.', 2, 6, ['vegan', 'healthy', 'light'], { isVegan: true, isHealthy: true, isLight: true, isQuick: true }),
      item('sf04-i2', 'Buddha bowl s tofu', 'Marinované tofu, hnědá rýže, edamame, mrkev.', 2, 7, ['vegan', 'healthy'], { isVegan: true, isHealthy: true }),
      item('sf04-i3', 'Avokádo & batáty', 'Pečené batáty, avokádo, černé fazole, koriandr.', 2, 6, ['vegan', 'healthy', 'light'], { isVegan: true, isHealthy: true, isLight: true, isQuick: true }),
    ],
  },
  {
    id: 'sf05',
    name: 'Mama Tortilla',
    description: 'Mexický street food — tacos, salsy, čerstvé tortilly.',
    category: 'tacos',
    tags: ['warm'],
    serviceModes: ['pickup'],
    isDemo: true,
    menuItems: [
      item('sf05-i1', 'Tacos al pastor', 'Marinované vepřové, ananas, koriandr, limeta.', 2, 7, ['warm', 'meat'], { isWarm: true }),
      item('sf05-i2', 'Veggie tacos', 'Černé fazole, kukuřice, avokádo, salsa verde.', 2, 6, ['vegan', 'warm'], { isVegan: true, isWarm: true, isQuick: true }),
      item('sf05-i3', 'Tacos s rybou', 'Grilovaná tilapie, kapusta, chipotle majonéza.', 2, 8, ['warm'], { isWarm: true }),
    ],
  },
  {
    id: 'sf06',
    name: 'Polévkárna Lžíce',
    description: 'Poctivé polévky vařené ráno, podávané v kelímku k odnesení.',
    category: 'soup',
    tags: ['soup', 'warm'],
    serviceModes: ['pickup'],
    isDemo: true,
    menuItems: [
      item('sf06-i1', 'Pho s tofu', 'Vietnamský vývar s rýžovými nudlemi, tofu, bylinky.', 2, 5, ['soup', 'warm', 'asian', 'vegan'], { isVegan: true, isWarm: true, isLight: true }),
      item('sf06-i2', 'Kuřecí vývar s nudlemi', 'Domácí vývar, kuřecí maso, nudle, zelenina.', 2, 5, ['soup', 'warm', 'meat'], { isWarm: true, isLight: true }),
      item('sf06-i3', 'Krémová dýňová', 'Hokkaido, kokosové mléko, zázvor.', 2, 5, ['soup', 'warm', 'vegan'], { isVegan: true, isWarm: true, isLight: true, isHealthy: true }),
    ],
  },
  {
    id: 'sf07',
    name: 'Lívance & spol.',
    description: 'Lívance, palačinky a sladké drobnosti k odnesení v kornoutu.',
    category: 'sweet',
    tags: ['sweet', 'bakery'],
    serviceModes: ['pickup'],
    isDemo: true,
    menuItems: [
      item('sf07-i1', 'Lívance s borůvkami', 'Kynuté lívance, borůvky, zakysaná smetana.', 1, 6, ['sweet', 'bakery'], { isVegetarian: true, isSweet: true }),
      item('sf07-i2', 'Vegan lívance s javorovým sirupem', 'Bez vajec a mléka, javorový sirup, ořechy.', 2, 6, ['sweet', 'bakery', 'vegan'], { isVegan: true, isSweet: true }),
      item('sf07-i3', 'Crepe s nutellou', 'Tenká francouzská palačinka, nutella, banán.', 2, 5, ['sweet', 'bakery'], { isVegetarian: true, isSweet: true, isQuick: true }),
    ],
  },
  {
    id: 'sf08',
    name: 'Wok & Roll',
    description: 'Asijské nudle čerstvě připravené ve wok pánvi.',
    category: 'asian_noodles',
    tags: ['asian', 'warm'],
    serviceModes: ['pickup'],
    isDemo: true,
    menuItems: [
      item('sf08-i1', 'Pad thai', 'Rýžové nudle, vejce, podzemnice, limeta.', 2, 8, ['asian', 'warm'], { isVegetarian: true, isWarm: true }),
      item('sf08-i2', 'Pad thai s krevetami', 'Klasický pad thai s tygřími krevetami.', 3, 9, ['asian', 'warm'], { isWarm: true }),
      item('sf08-i3', 'Vegan pad see ew', 'Široké nudle, brokolice, tofu, sójová omáčka.', 2, 8, ['asian', 'warm', 'vegan'], { isVegan: true, isWarm: true }),
    ],
  },
];

interface CheckInTemplate {
  vendorId: string;
  dLat: number;
  dLon: number;
  locationLabel: string;
  hoursRemaining: number;
  note?: string;
}

const DEMO_BASE: UserLocation = { latitude: 50.0833, longitude: 14.425 };
const RELOCATE_THRESHOLD_METERS = 20_000;

const DEMO_CHECKIN_TEMPLATES: CheckInTemplate[] = [
  { vendorId: 'sf01', dLat: 0.0035, dLon: -0.0085, locationLabel: 'Náplavka', hoursRemaining: 5, note: 'Dnes do večera, máme i ledovou cold brew.' },
  { vendorId: 'sf02', dLat: 0.0008, dLon: 0.001, locationLabel: 'Jungmannovo náměstí', hoursRemaining: 4 },
  { vendorId: 'sf03', dLat: -0.011, dLon: -0.013, locationLabel: 'Anděl – Stroupežnického', hoursRemaining: 3 },
  { vendorId: 'sf04', dLat: 0.002, dLon: -0.006, locationLabel: 'Kampa park', hoursRemaining: 6, note: 'Dnešní bowl: pečená dýně.' },
  { vendorId: 'sf05', dLat: 0.006, dLon: 0.012, locationLabel: 'Náměstí Míru', hoursRemaining: 2 },
  { vendorId: 'sf06', dLat: 0.014, dLon: 0.018, locationLabel: 'Karlín – Lyčkovo náměstí', hoursRemaining: 5 },
  { vendorId: 'sf07', dLat: 0.012, dLon: -0.004, locationLabel: 'Letenské sady', hoursRemaining: 4, note: 'Stojíme u kolotoče.' },
  { vendorId: 'sf08', dLat: 0.009, dLon: 0.022, locationLabel: 'Žižkov – Parukářka', hoursRemaining: 3 },
];

const HOUR_MS = 60 * 60 * 1000;

function pickBase(user: UserLocation | null): UserLocation {
  if (!user) return DEMO_BASE;
  const distance = calculateDistanceMeters(user, {
    latitude: DEMO_BASE.latitude,
    longitude: DEMO_BASE.longitude,
  });
  if (distance == null) return DEMO_BASE;
  if (distance <= RELOCATE_THRESHOLD_METERS) return DEMO_BASE;
  return { latitude: user.latitude, longitude: user.longitude };
}

export function getDemoStreetFoodCheckIns(
  now: Date,
  user: UserLocation | null = null
): StreetFoodCheckIn[] {
  const base = pickBase(user);
  const nowMs = now.getTime();
  return DEMO_CHECKIN_TEMPLATES.map((t) => ({
    id: `demo-checkin-${t.vendorId}`,
    vendorId: t.vendorId,
    latitude: base.latitude + t.dLat,
    longitude: base.longitude + t.dLon,
    locationLabel: t.locationLabel,
    activeFrom: nowMs - HOUR_MS,
    activeUntil: nowMs + t.hoursRemaining * HOUR_MS,
    createdAt: nowMs - HOUR_MS,
    status: 'active',
    note: t.note,
  }));
}

export function getDemoBaseLocation(user: UserLocation | null): UserLocation {
  return pickBase(user);
}
