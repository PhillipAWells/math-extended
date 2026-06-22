import { EPSILON, EPSILON_LOOSE, EPSILON_TIGHT, EPSILON_COMPARISON, EPSILON_ORTHOGONAL, EPSILON_STRUCTURAL, EPSILON_DECOMPOSITION } from './constants.js';

describe('Math Extended > Constants', () => {
	test('EPSILON is a small positive number suitable for general tolerance', () => {
		expect(EPSILON).toBe(1e-10);
		expect(EPSILON).toBeGreaterThan(0);
		expect(EPSILON).toBeLessThan(1);
	});

	test('EPSILON_LOOSE is larger than EPSILON for less strict comparisons', () => {
		expect(EPSILON_LOOSE).toBe(1e-6);
		expect(EPSILON_LOOSE).toBeGreaterThan(EPSILON);
		expect(EPSILON_LOOSE).toBeLessThan(1);
	});

	test('EPSILON_TIGHT is Number.EPSILON for maximum precision', () => {
		expect(EPSILON_TIGHT).toBe(Number.EPSILON);
		expect(EPSILON_TIGHT).toBeLessThan(EPSILON);
		expect(EPSILON_TIGHT).toBeGreaterThan(0);
	});

	test('EPSILON is suitable for typical floating-point comparisons', () => {
		const sum = 0.1 + 0.2;
		const diff = Math.abs(sum - 0.3);
		expect(diff).toBeLessThan(EPSILON);
	});

	test('EPSILON_LOOSE is suitable for accumulated rounding errors', () => {
		let acc = 0;
		for (let i = 0; i < 1000; i++) {
			acc += 0.001;
		}
		const expected = 1.0;
		const diff = Math.abs(acc - expected);
		expect(diff).toBeLessThan(EPSILON_LOOSE);
	});

	test('Tolerance constants have expected ordering', () => {
		expect(EPSILON_TIGHT < EPSILON).toBe(true);
		expect(EPSILON < EPSILON_LOOSE).toBe(true);
	});

	test('EPSILON_COMPARISON is the standard default tolerance for value equality', () => {
		expect(EPSILON_COMPARISON).toBe(1e-8);
	});

	test('EPSILON_ORTHOGONAL is the tolerance for orthogonality checks', () => {
		expect(EPSILON_ORTHOGONAL).toBe(1e-9);
	});

	test('EPSILON_STRUCTURAL is the tight tolerance for structural predicates', () => {
		expect(EPSILON_STRUCTURAL).toBe(1e-14);
	});

	test('EPSILON_DECOMPOSITION is the tolerance for matrix decompositions', () => {
		expect(EPSILON_DECOMPOSITION).toBe(1e-12);
	});
});
