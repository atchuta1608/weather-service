const { classifyTemp } = require('../src/utils/tempClassifier');

test('classifies hot temperatures', () => {
  expect(classifyTemp(95)).toBe('hot');
  expect(classifyTemp(80)).toBe('hot');
});

test('classifies cold temperatures', () => {
  expect(classifyTemp(-5)).toBe('cold');
  expect(classifyTemp(50)).toBe('cold');
});

test('classifies moderate temperatures', () => {
  expect(classifyTemp(60)).toBe('moderate');
  expect(classifyTemp(79)).toBe('moderate');
});

test('returns unknown for invalid input', () => {
  expect(classifyTemp(null)).toBe('unknown');
  expect(classifyTemp('abc')).toBe('unknown');
});
