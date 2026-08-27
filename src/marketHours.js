import React from 'react';

// MOEX-style trading schedule, in Moscow time (MSK = UTC+3, Russia hasn't
// observed DST since 2014, so this offset is constant year-round — no
// timezone table needed).
// Weekdays: 06:50–23:50 · Weekends: 10:00–19:00
// Kept in sync by hand with the identical function in server/marketHours.js
// (the two runtimes can't share a module without a build-time link, and the
// logic is short enough that duplicating it beats wiring one up).
const WEEKDAY_OPEN = 6 * 60 + 50;
const WEEKDAY_CLOSE = 23 * 60 + 50;
const WEEKEND_OPEN = 10 * 60;
const WEEKEND_CLOSE = 19 * 60;

// MOEX observes Russia's official non-working holidays as non-trading days.
// Anonymous MOEX ISS has no reachable endpoint for this calendar, so it's a
// manually maintained list (same spirit as the session-phase simplification
// below) — needs a yearly top-up from the official MOEX trading calendar.
const MOEX_HOLIDAYS = new Set([
  // 2026
  '2026-01-01', '2026-01-02', '2026-01-05', '2026-01-06', '2026-01-07', '2026-01-08',
  '2026-02-23', '2026-03-09', '2026-05-01', '2026-05-11', '2026-06-12', '2026-11-04',
]);

function mskParts(date) {
  const msk = new Date(date.getTime() + 3 * 3600 * 1000);
  return {
    day: msk.getUTCDay(), // 0 = Sunday, 6 = Saturday
    minutesOfDay: msk.getUTCHours() * 60 + msk.getUTCMinutes(),
    isoDate: msk.toISOString().slice(0, 10),
  };
}

export function isMoexHoliday(date = new Date()) {
  return MOEX_HOLIDAYS.has(mskParts(date).isoDate);
}

export function isMarketOpen(date = new Date()) {
  const { day, minutesOfDay, isoDate } = mskParts(date);
  if (MOEX_HOLIDAYS.has(isoDate)) return false;
  const isWeekend = day === 0 || day === 6;
  const open = isWeekend ? WEEKEND_OPEN : WEEKDAY_OPEN;
  const close = isWeekend ? WEEKEND_CLOSE : WEEKDAY_CLOSE;
  return minutesOfDay >= open && minutesOfDay < close;
}

export function marketScheduleLabel(date = new Date()) {
  const { day } = mskParts(date);
  const isWeekend = day === 0 || day === 6;
  return isWeekend ? '10:00–19:00 МСК' : '06:50–23:50 МСК';
}

/** Re-evaluates every 15s — cheap enough, and precise enough to flip within
 * 15s of the actual open/close boundary. */
export function useMarketOpen() {
  const [open, setOpen] = React.useState(() => isMarketOpen());
  React.useEffect(() => {
    const id = setInterval(() => setOpen(isMarketOpen()), 15000);
    return () => clearInterval(id);
  }, []);
  return open;
}

// Simplified session-phase model — real MOEX has per-instrument-group
// auction windows that shift slightly by board; this collapses that into one
// schedule so the UI can show *something* honest instead of pretending the
// whole day is one continuous match. Not used for order-matching, only display.
const OPENING_AUCTION_END = WEEKDAY_OPEN + 10; // 06:50–07:00
const CLOSING_AUCTION_START = 18 * 60 + 40; // 18:40
const CLOSING_AUCTION_END = 18 * 60 + 50; // 18:40–18:50
const EVENING_START = 19 * 60; // 19:00–23:50

export function getSessionPhase(date = new Date()) {
  const { day, minutesOfDay, isoDate } = mskParts(date);
  if (MOEX_HOLIDAYS.has(isoDate)) return 'closed';
  const isWeekend = day === 0 || day === 6;

  if (isWeekend) {
    if (minutesOfDay < WEEKEND_OPEN || minutesOfDay >= WEEKEND_CLOSE) return 'closed';
    return 'main';
  }

  if (minutesOfDay < WEEKDAY_OPEN || minutesOfDay >= WEEKDAY_CLOSE) return 'closed';
  if (minutesOfDay < OPENING_AUCTION_END) return 'opening-auction';
  if (minutesOfDay < CLOSING_AUCTION_START) return 'main';
  if (minutesOfDay < CLOSING_AUCTION_END) return 'closing-auction';
  if (minutesOfDay < EVENING_START) return 'main';
  return 'evening';
}

export const SESSION_PHASE_LABELS = {
  closed: 'Торги закрыты',
  'opening-auction': 'Аукцион открытия',
  main: 'Торговый период',
  'closing-auction': 'Аукцион закрытия',
  evening: 'Вечерняя сессия',
};

export function useSessionPhase() {
  const [phase, setPhase] = React.useState(() => getSessionPhase());
  React.useEffect(() => {
    const id = setInterval(() => setPhase(getSessionPhase()), 15000);
    return () => clearInterval(id);
  }, []);
  return phase;
}
