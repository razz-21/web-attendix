export const SCHEDULE_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const SCHEDULE_DAY_MAP: Record<string, string> = {
  'Monday': 'Mon',
  'Tuesday': 'Tue',
  'Wednesday': 'Wed',
  'Thursday': 'Thu',
  'Friday': 'Fri',
  'Saturday': 'Sat',
  'Sunday': 'Sun',
};

export const SCHEDULE_DAYS_ORDER = SCHEDULE_DAYS.reduce((acc, day, index) => {
  acc[day] = index;
  acc[SCHEDULE_DAY_MAP[day]] = index;
  return acc;
}, {} as Record<string, number>);

export function sortScheduleDays(days: string[]): string[] {
  return [...days].sort((a, b) => {
    const orderA = SCHEDULE_DAYS_ORDER[a] ?? 99;
    const orderB = SCHEDULE_DAYS_ORDER[b] ?? 99;
    return orderA - orderB;
  });
}
