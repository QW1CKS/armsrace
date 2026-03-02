/** Clamp a numeric value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Normalize a value from [inMin, inMax] to [0, 100] */
export function normalizeToHundred(value: number, inMin: number, inMax: number): number {
  if (inMax === inMin) return 0;
  return clamp(((value - inMin) / (inMax - inMin)) * 100, 0, 100);
}

/** Weighted average of (value, weight) pairs */
export function weightedAverage(pairs: Array<{ value: number; weight: number }>): number {
  const totalWeight = pairs.reduce((sum, p) => sum + p.weight, 0);
  if (totalWeight === 0) return 0;
  return pairs.reduce((sum, p) => sum + p.value * p.weight, 0) / totalWeight;
}

/** Compute z-score: how many standard deviations above/below the mean */
export function zScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

/** Compute rolling mean and standard deviation from an array of numbers */
export function rollingStats(values: number[]): { mean: number; stdDev: number } {
  if (values.length === 0) return { mean: 0, stdDev: 0 };
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return { mean, stdDev: Math.sqrt(variance) };
}
