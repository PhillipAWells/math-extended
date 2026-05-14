import { QuaternionNLERP, QuaternionSQUAD, QuaternionCreatePath } from './interpolation.js';
import { QuaternionIdentity, QuaternionFromAxisAngle, QuaternionEquals } from './core.js';

const TOLERANCE = 1e-6;
describe('Quaternion Interpolation', () => {
	test('QuaternionNLERP: returns start and end for t=0 and t=1', () => {
		const a = QuaternionIdentity();
		const b = QuaternionFromAxisAngle([0, 0, 1], Math.PI / 2);
		expect(QuaternionEquals(QuaternionNLERP(a, b, 0), a, TOLERANCE, true)).toBe(true);
		expect(QuaternionEquals(QuaternionNLERP(a, b, 1), b, TOLERANCE, true)).toBe(true);
	});

	test('QuaternionNLERP: interpolates halfway', () => {
		const a = QuaternionIdentity();
		const b = QuaternionFromAxisAngle([0, 0, 1], Math.PI / 2);
		const result = QuaternionNLERP(a, b, 0.5);
		// Should be normalized and between a and b
		expect(Math.abs(result[3])).toBeLessThan(1);
		expect(Math.abs(result[3])).toBeGreaterThan(0.7);
	});

	test('QuaternionNLERP: handles double-cover (q and -q)', () => {
		const a = QuaternionIdentity();
		const b: [number, number, number, number] = [0, 0, 0, -1];
		const result = QuaternionNLERP(a, b, 0.5);
		// Should interpolate along the shortest path (equivalent to a)
		expect(QuaternionEquals(result, a, TOLERANCE, true)).toBe(true);
	});

	test('QuaternionSQUAD: smooth interpolation between four quaternions', () => {
		const q0 = QuaternionFromAxisAngle([1, 0, 0], 0);
		const q1 = QuaternionFromAxisAngle([1, 0, 0], Math.PI / 4);
		const q2 = QuaternionFromAxisAngle([1, 0, 0], Math.PI / 2);
		const q3 = QuaternionFromAxisAngle([1, 0, 0], (3 * Math.PI) / 4);
		const result = QuaternionSQUAD(q0, q1, q2, q3, 0.5);
		// Should be between q1 and q2
		expect(result[3]).toBeLessThan(q1[3]);
		expect(result[3]).toBeGreaterThan(q2[3]);
	});

	test('QuaternionCreatePath: slerp path returns endpoints for t=0 and t=1', () => {
		const q1 = QuaternionIdentity();
		const q2 = QuaternionFromAxisAngle([0, 1, 0], Math.PI / 2);
		const path = [q1, q2];
		const interp = QuaternionCreatePath(path, 'slerp');
		expect(QuaternionEquals(interp(0), q1, TOLERANCE, true)).toBe(true);
		expect(QuaternionEquals(interp(1), q2, TOLERANCE, true)).toBe(true);
	});

	test('QuaternionCreatePath: nlerp and squad produce valid quaternions', () => {
		const q1 = QuaternionIdentity();
		const q2 = QuaternionFromAxisAngle([0, 1, 0], Math.PI / 2);
		const q3 = QuaternionFromAxisAngle([0, 1, 0], Math.PI);
		const path = [q1, q2, q3];
		const nlerpInterp = QuaternionCreatePath(path, 'nlerp');
		const squadInterp = QuaternionCreatePath(path, 'squad');
		const nlerpResult = nlerpInterp(0.5);
		const squadResult = squadInterp(0.5);
		// Should be normalized
		const nlerpMag = Math.sqrt(nlerpResult.reduce((s, v) => s + (v * v), 0));
		const squadMag = Math.sqrt(squadResult.reduce((s, v) => s + (v * v), 0));
		expect(Math.abs(nlerpMag - 1)).toBeLessThan(TOLERANCE);
		expect(Math.abs(squadMag - 1)).toBeLessThan(TOLERANCE);
	});

	test('QuaternionCreatePath: throws for <2 quaternions', () => {
		expect(() => QuaternionCreatePath([], 'slerp')).toThrow();
		expect(() => QuaternionCreatePath([[0, 0, 0, 1]], 'slerp')).toThrow();
	});
});
