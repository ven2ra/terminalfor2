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

export function isMarketOpen(date = new Date()) {
  const mskMs = date.getTime() + 3 * 3600 * 1000;
  const msk = new Date(mskMs);
  const day = msk.getUTCDay(); // 0 = Sunday, 6 = Saturday
  const minutesOfDay = msk.getUTCHours() * 60 + msk.getUTCMinutes();
  const isWeekend = day === 0 || day === 6;
  const open = isWeekend ? WEEKEND_OPEN : WEEKDAY_OPEN;
  const close = isWeekend ? WEEKEND_CLOSE : WEEKDAY_CLOSE;
  return minutesOfDay >= open && minutesOfDay < close;
}

export function marketScheduleLabel(date = new Date()) {
  const mskMs = date.getTime() + 3 * 3600 * 1000;
  const day = new Date(mskMs).getUTCDay();
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
