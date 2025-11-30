function classifyTemp(tempF) {
  if (typeof tempF !== 'number' || Number.isNaN(tempF)) return 'unknown';
  if (tempF >= 80) return 'hot';
  if (tempF <= 65) return 'cold';
  return 'moderate';
}

module.exports = { classifyTemp };
