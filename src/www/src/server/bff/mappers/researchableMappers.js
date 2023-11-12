import { sortDescend } from '../utils/dataSorting';

export const productLastestYearMapper = (makeId, modelId) => {
  const func = (years) => {
    if (years.length < 1) return null;

    const sortedYears = sortDescend(years, 'yearId');
    const yearsFiltered = sortedYears.filter(year => year.yearId <= new Date().getFullYear());
    const [lastestYear] = yearsFiltered;

    return lastestYear?.yearId;
  };
};