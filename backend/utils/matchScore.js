export const calculateMatchScore = (worker, job) => {
  let score = 0;

  // Trade match (50 points)
  if (
    worker.trade &&
    job.trade &&
    worker.trade.toLowerCase() === job.trade.toLowerCase()
  ) {
    score += 50;
  }

  // Location match (30 points)
  if (
    worker.locationName &&
    job.locationName &&
    worker.locationName.toLowerCase() === job.locationName.toLowerCase()
  ) {
    score += 30;
  }

  // Wage match (20 points)
  if (job.wage >= worker.wage) {
    score += 20;
  }

  return score;
};