import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates timestamp of next Thursday 04:00 AM.
 * If today is Thursday and time is before 04:00, returns today 04:00.
 * Otherwise returns next Thursday 04:00.
 */
export function getNextThursdayResetTime(): number {
  const now = new Date();
  const result = new Date(now);
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
  
  let daysUntilThursday = (4 - day + 7) % 7;
  result.setDate(now.getDate() + daysUntilThursday);
  result.setHours(4, 0, 0, 0);
  
  if (result.getTime() <= now.getTime()) {
    result.setDate(result.getDate() + 7);
  }
  return result.getTime();
}
