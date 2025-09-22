/**
 * Calculates the number of days between two date strings (inclusive).
 * @param startDate The start date in 'YYYY-MM-DD' format.
 * @param endDate The end date in 'YYYY-MM-DD' format.
 * @returns The total number of days.
 */
export const getDaysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // To avoid issues with timezones, we work with UTC dates
  const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((utcEnd - utcStart) / msPerDay) + 1;
};