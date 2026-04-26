import type { OpeningHours, Place, TimeRange, Weekday } from '../types';

const weekdayOrder: Weekday[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

const weekdayLabel: Record<Weekday, string> = {
  monday: 'pondělí',
  tuesday: 'úterý',
  wednesday: 'středa',
  thursday: 'čtvrtek',
  friday: 'pátek',
  saturday: 'sobota',
  sunday: 'neděle',
};

const weekdayInLabel: Record<Weekday, string> = {
  monday: 'v pondělí',
  tuesday: 'v úterý',
  wednesday: 've středu',
  thursday: 've čtvrtek',
  friday: 'v pátek',
  saturday: 'v sobotu',
  sunday: 'v neděli',
};

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function dateToMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function getWeekday(date: Date): Weekday {
  return weekdayOrder[date.getDay()];
}

function previousWeekday(day: Weekday): Weekday {
  const idx = weekdayOrder.indexOf(day);
  return weekdayOrder[(idx + 6) % 7];
}

function isOvernight(range: TimeRange): boolean {
  return timeToMinutes(range.close) <= timeToMinutes(range.open);
}

function nowInRange(nowMin: number, range: TimeRange): boolean {
  const openMin = timeToMinutes(range.open);
  const closeMin = timeToMinutes(range.close);
  if (closeMin > openMin) {
    return nowMin >= openMin && nowMin < closeMin;
  }
  return nowMin >= openMin;
}

function activeRange(
  hours: OpeningHours,
  now: Date
): { range: TimeRange; fromYesterday: boolean } | null {
  const today = getWeekday(now);
  const nowMin = dateToMinutes(now);
  for (const range of hours[today] ?? []) {
    if (nowInRange(nowMin, range)) return { range, fromYesterday: false };
  }
  const yesterday = previousWeekday(today);
  for (const range of hours[yesterday] ?? []) {
    if (isOvernight(range) && nowMin < timeToMinutes(range.close)) {
      return { range, fromYesterday: true };
    }
  }
  return null;
}

export function isPlaceOpenNow(place: Place, now: Date = new Date()): boolean {
  return activeRange(place.openingHours, now) !== null;
}

export function getTodayHoursLabel(
  place: Place,
  now: Date = new Date()
): string {
  const today = getWeekday(now);
  const ranges = place.openingHours[today] ?? [];
  if (ranges.length === 0) return 'Dnes zavřeno';
  return ranges.map((r) => `${r.open}–${r.close}`).join(', ');
}

export interface NextOpeningInfo {
  weekday: Weekday;
  open: string;
  relativeLabel: string;
}

export function getNextOpeningInfo(
  place: Place,
  now: Date = new Date()
): NextOpeningInfo | null {
  const today = getWeekday(now);
  const nowMin = dateToMinutes(now);
  for (const range of place.openingHours[today] ?? []) {
    if (timeToMinutes(range.open) > nowMin) {
      return { weekday: today, open: range.open, relativeLabel: 'dnes' };
    }
  }
  for (let i = 1; i <= 7; i++) {
    const next = new Date(now);
    next.setDate(now.getDate() + i);
    const wd = getWeekday(next);
    const ranges = place.openingHours[wd] ?? [];
    if (ranges.length > 0) {
      const first = ranges[0];
      const relativeLabel = i === 1 ? 'zítra' : weekdayInLabel[wd];
      return { weekday: wd, open: first.open, relativeLabel };
    }
  }
  return null;
}

export interface OpenStatus {
  open: boolean;
  label: string;
}

export function getOpenStatus(
  place: Place,
  now: Date = new Date()
): OpenStatus {
  const active = activeRange(place.openingHours, now);
  if (active) {
    return { open: true, label: `Otevřeno do ${active.range.close}` };
  }
  const next = getNextOpeningInfo(place, now);
  if (!next) {
    return { open: false, label: 'Teď zavřeno' };
  }
  return {
    open: false,
    label: `Teď zavřeno · Otevírá ${next.relativeLabel} v ${next.open}`,
  };
}

export function formatWeekdayLabel(day: Weekday): string {
  return weekdayLabel[day];
}

export const __openingHoursTests = {
  weekdayOrder,
  timeToMinutes,
  isOvernight,
  nowInRange,
  activeRange,
  previousWeekday,
};

export interface OpeningHoursScenario {
  description: string;
  hours: OpeningHours;
  at: Date;
  expected: { open: boolean; labelStartsWith: string };
}

const noHours: OpeningHours = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
};

export const openingHoursScenarios: OpeningHoursScenario[] = [
  {
    description: 'open today (lunch range)',
    hours: { ...noHours, friday: [{ open: '11:00', close: '22:00' }] },
    at: new Date(2026, 3, 24, 13, 0),
    expected: { open: true, labelStartsWith: 'Otevřeno do 22:00' },
  },
  {
    description: 'closed today (no ranges)',
    hours: { ...noHours, friday: [] },
    at: new Date(2026, 3, 24, 13, 0),
    expected: { open: false, labelStartsWith: 'Teď zavřeno' },
  },
  {
    description: 'overnight range still open after midnight',
    hours: {
      ...noHours,
      friday: [{ open: '18:00', close: '04:00' }],
      saturday: [{ open: '18:00', close: '04:00' }],
    },
    at: new Date(2026, 3, 25, 1, 30),
    expected: { open: true, labelStartsWith: 'Otevřeno do 04:00' },
  },
  {
    description: 'weekend hours (closed Sun, open Sat morning)',
    hours: {
      ...noHours,
      saturday: [{ open: '09:00', close: '14:00' }],
      sunday: [],
    },
    at: new Date(2026, 3, 26, 11, 0),
    expected: { open: false, labelStartsWith: 'Teď zavřeno · Otevírá' },
  },
];
