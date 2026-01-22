export function generateWeeksForYear(year: number): (string | null)[][] {
  const weeks: (string | null)[][] = [];
  const startDate = new Date(year, 0, 1);
  const startDay = startDate.getDay();
  const adjustedStart = new Date(startDate);
  if (startDay !== 0) {
    adjustedStart.setDate(startDate.getDate() - startDay);
  }

  const now = new Date();
  const isCurrentYear = year === now.getFullYear();
  const endDate = isCurrentYear ? now : new Date(year, 11, 31);

  let currentDate = new Date(adjustedStart);

  while (currentDate <= endDate || weeks.length === 0) {
    const week: (string | null)[] = [];

    for (let d = 0; d < 7; d++) {
      if (currentDate.getFullYear() === year && currentDate <= endDate) {
        week.push(formatDateKey(currentDate));
      } else if (currentDate.getFullYear() < year || currentDate > endDate) {
        week.push(null);
      } else {
        week.push(null);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (week.some((d) => d !== null)) {
      weeks.push(week);
    }

    if (currentDate.getFullYear() > year) break;
  }

  return weeks;
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getIntensityLevel(count: number, maxCount: number): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  if (count === 0) return 0;
  if (maxCount === 0) return 0;

  const ratio = count / maxCount;
  if (ratio <= 0.1) return 1;
  if (ratio <= 0.25) return 2;
  if (ratio <= 0.4) return 3;
  if (ratio <= 0.6) return 4;
  if (ratio <= 0.8) return 5;
  return 6;
}
