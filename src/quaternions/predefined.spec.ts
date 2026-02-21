import {
	QuaternionRotationX,
	QuaternionRotationY,
	QuaternionRotationZ,
} from './predefined.js';
import { QuaternionIdentity, QuaternionEquals, QuaternionFromAxisAngle } from './core.js';

const TOLERANCE = 1e-6;
describe('Predefined Quaternions', () => {
	test('QuaternionIdentity returns [0,0,0,1]', () => {
		expect(QuaternionIdentity()).toEqual([0, 0, 0, 1]);
		expect(QuaternionEquals(QuaternionIdentity(), QuaternionIdentity(), TOLERANCE, true)).toBe(true);
	});

	test('QuaternionRotationX returns correct quaternion for 90°', () => {
		const angle = Math.PI / 2;
		const expected = QuaternionFromAxisAngle([1, 0, 0], angle);
		expect(QuaternionEquals(QuaternionRotationX(angle), expected, TOLERANCE, true)).toBe(true);
	});

	test('QuaternionRotationY returns correct quaternion for 90°', () => {
		const angle = Math.PI / 2;
		const expected = QuaternionFromAxisAngle([0, 1, 0], angle);
		expect(QuaternionEquals(QuaternionRotationY(angle), expected, TOLERANCE, true)).toBe(true);
	});

	test('QuaternionRotationZ returns correct quaternion for 90°', () => {
		const angle = Math.PI / 2;
		const expected = QuaternionFromAxisAngle([0, 0, 1], angle);
		expect(QuaternionEquals(QuaternionRotationZ(angle), expected, TOLERANCE, true)).toBe(true);
	});

	test('QuaternionRotationX/Y/Z are normalized', () => {
		const angle = Math.PI / 3;
		const qx = QuaternionRotationX(angle);
		const qy = QuaternionRotationY(angle);
		const qz = QuaternionRotationZ(angle);
		const mag = (q: number[]): number => Math.sqrt(q.reduce((s, v) => s + (v * v), 0));
		expect(Math.abs(mag(qx) - 1)).toBeLessThan(TOLERANCE);
		expect(Math.abs(mag(qy) - 1)).toBeLessThan(TOLERANCE);
		expect(Math.abs(mag(qz) - 1)).toBeLessThan(TOLERANCE);
	});
});
