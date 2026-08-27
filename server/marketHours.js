// MOEX-style trading schedule, in Moscow time (MSK = UTC+3, no DST since
// 2014, so this offset is constant year-round).
// Weekdays: 06:50–23:50 · Weekends: 10:00–19:00
// Kept in sync by hand with the identical function in src/marketHours.js —
// the browser and this server can't share a module without a build-time
// link, and the logic is short enough that duplicating it beats wiring one up.
const WEEKDAY_OPEN = 6 * 60 + 50;
const WEEKDAY_CLOSE = 23 * 60 + 50;
const WEEKEND_OPEN = 10 * 60;
const WEEKEND_CLOSE = 19 * 60;

// MOEX observes Russia's official non-working holidays as non-trading days.
// Anonymous MOEX ISS has no reachable endpoint for this calendar, so it's a
// manually maintained list — needs a yearly top-up from the official MOEX
// trading calendar. Kept in sync by hand with src/marketHours.js's copy.
const MOEX_HOLIDAYS = new Set([
  // 2026
  '2026-01-01', '2026-01-02', '2026-01-05', '2026-01-06', '2026-01-07', '2026-01-08',
  '2026-02-23', '2026-03-09', '2026-05-01', '2026-05-11', '2026-06-12', '2026-11-04',
]);

function mskParts(date) {
  const msk = new Date(date.getTime() + 3 * 3600 * 1000);
  return {
    day: msk.getUTCDay(),
    minutesOfDay: msk.getUTCHours() * 60 + msk.getUTCMinutes(),
    isoDate: msk.toISOString().slice(0, 10),
  };
}

export function isMarketOpen(date = new Date()) {
  const { day, minutesOfDay, isoDate } = mskParts(date);
  if (MOEX_HOLIDAYS.has(isoDate)) return false;
  const isWeekend = day === 0 || day === 6;
  const open = isWeekend ? WEEKEND_OPEN : WEEKDAY_OPEN;
  const close = isWeekend ? WEEKEND_CLOSE : WEEKDAY_CLOSE;
  return minutesOfDay >= open && minutesOfDay < close;
}
