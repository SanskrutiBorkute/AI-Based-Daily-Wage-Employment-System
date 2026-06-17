export const getRecommendedWage = (trade, experience) => {
  const wageMap = {
    '0-1': 500,
    '1-3': 700,
    '3-5': 900,
    '5-10': 1200,
    '10+': 1500
  };

  return wageMap[experience] || 500;
};