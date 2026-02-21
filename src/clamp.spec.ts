import { Clamp } from './clamp.ts';

describe('Math Extended > Clamp', () => {
	test('If the value is within range, return the value.', () => {
		expect(Clamp(5, 0, 10)).toBe(5);
		expect(Clamp(-3, -5, 5)).toBe(-3);
		expect(Clamp(0, -10, 10)).toBe(0);
	});
	test('If the value is less than the minimum, return the minimum value.', () => {
		expect(Clamp(-10, 0, 10)).toBe(0);
		expect(Clamp(-100, -50, 50)).toBe(-50);
		expect(Clamp(-5, -2, 2)).toBe(-2);
	});
	test('If the value is greater than the maximum, return the maximum value.', () => {
		expect(Clamp(15, 0, 10)).toBe(10);
		expect(Clamp(100, -50, 50)).toBe(50);
		expect(Clamp(3, -2, 2)).toBe(2);
	});
});
