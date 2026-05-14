import {
	QUATERNION_SCHEMA,
	EULER_ANGLES_SCHEMA,
	AXIS_ANGLE_SCHEMA,
	ROTATION_MATRIX_SCHEMA,
} from './types.js';

describe('Quaternion Type Schemas', () => {
	describe('QUATERNION_SCHEMA', () => {
		it('should accept valid quaternion arrays', () => {
			expect(QUATERNION_SCHEMA.parse([1, 0, 0, 0])).toEqual([1, 0, 0, 0]);
			expect(QUATERNION_SCHEMA.parse([0, 0, 0, 1])).toEqual([0, 0, 0, 1]);
			expect(QUATERNION_SCHEMA.parse([0.707, 0.707, 0, 0])).toEqual([0.707, 0.707, 0, 0]);
			expect(QUATERNION_SCHEMA.parse([0, 0, 0, 0])).toEqual([0, 0, 0, 0]);
		});

		it('should accept negative values', () => {
			expect(QUATERNION_SCHEMA.parse([-1, 0, 0, 0])).toEqual([-1, 0, 0, 0]);
			expect(QUATERNION_SCHEMA.parse([-0.5, -0.5, -0.5, -0.5])).toEqual([
				-0.5, -0.5, -0.5, -0.5,
			]);
		});

		it('should accept Infinity', () => {
			expect(QUATERNION_SCHEMA.parse([Infinity, 0, 0, 0])).toEqual([Infinity, 0, 0, 0]);
			expect(QUATERNION_SCHEMA.parse([0, -Infinity, 0, 0])).toEqual([0, -Infinity, 0, 0]);
		});

		it('should reject non-numeric elements', () => {
			expect(() => QUATERNION_SCHEMA.parse(['1', 0, 0, 0])).toThrow();
			expect(() => QUATERNION_SCHEMA.parse([1, null, 0, 0])).toThrow();
			expect(() => QUATERNION_SCHEMA.parse([1, undefined, 0, 0])).toThrow();
			expect(() => QUATERNION_SCHEMA.parse([1, {}, 0, 0])).toThrow();
			expect(() => QUATERNION_SCHEMA.parse([1, [], 0, 0])).toThrow();
		});

		it('should reject NaN values', () => {
			expect(() => QUATERNION_SCHEMA.parse([NaN, 0, 0, 0])).toThrow();
			expect(() => QUATERNION_SCHEMA.parse([1, NaN, 0, 0])).toThrow();
			expect(() => QUATERNION_SCHEMA.parse([0, 0, NaN, 0])).toThrow();
			expect(() => QUATERNION_SCHEMA.parse([0, 0, 0, NaN])).toThrow();
		});

		it('should reject arrays with wrong length', () => {
			expect(() => QUATERNION_SCHEMA.parse([1, 0, 0])).toThrow();
			expect(() => QUATERNION_SCHEMA.parse([1, 0, 0, 0, 0])).toThrow();
			expect(() => QUATERNION_SCHEMA.parse([1])).toThrow();
			expect(() => QUATERNION_SCHEMA.parse([])).toThrow();
		});

		it('should reject non-array inputs', () => {
			expect(() => QUATERNION_SCHEMA.parse('not an array')).toThrow();
			expect(() => QUATERNION_SCHEMA.parse(123)).toThrow();
			expect(() => QUATERNION_SCHEMA.parse({})).toThrow();
			expect(() => QUATERNION_SCHEMA.parse(null)).toThrow();
			expect(() => QUATERNION_SCHEMA.parse(undefined)).toThrow();
		});

		it('should handle large and small numbers', () => {
			expect(QUATERNION_SCHEMA.parse([1e10, -1e10, 1e-10, -1e-10])).toEqual([
				1e10, -1e10, 1e-10, -1e-10,
			]);
		});

		it('should handle mixed valid values', () => {
			expect(QUATERNION_SCHEMA.parse([1, -2.5, 3.14159, 0])).toEqual([1, -2.5, 3.14159, 0]);
		});
	});

	describe('EULER_ANGLES_SCHEMA', () => {
		it('should accept valid Euler angle arrays', () => {
			expect(EULER_ANGLES_SCHEMA.parse([0, 0, 0])).toEqual([0, 0, 0]);
			expect(EULER_ANGLES_SCHEMA.parse([Math.PI, Math.PI / 2, 0])).toEqual([
				Math.PI,
				Math.PI / 2,
				0,
			]);
			expect(EULER_ANGLES_SCHEMA.parse([0.1, 0.2, 0.3])).toEqual([0.1, 0.2, 0.3]);
		});

		it('should accept negative angles', () => {
			expect(EULER_ANGLES_SCHEMA.parse([-Math.PI, -Math.PI / 2, -1])).toEqual([
				-Math.PI,
				-Math.PI / 2,
				-1,
			]);
		});

		it('should accept large angles beyond 2*PI', () => {
			expect(EULER_ANGLES_SCHEMA.parse([10, 20, 30])).toEqual([10, 20, 30]);
		});

		it('should accept Infinity', () => {
			expect(EULER_ANGLES_SCHEMA.parse([Infinity, 0, 0])).toEqual([Infinity, 0, 0]);
			expect(EULER_ANGLES_SCHEMA.parse([0, -Infinity, 0])).toEqual([0, -Infinity, 0]);
		});

		it('should reject NaN values', () => {
			expect(() => EULER_ANGLES_SCHEMA.parse([NaN, 0, 0])).toThrow();
			expect(() => EULER_ANGLES_SCHEMA.parse([0, NaN, 0])).toThrow();
			expect(() => EULER_ANGLES_SCHEMA.parse([0, 0, NaN])).toThrow();
		});

		it('should reject non-numeric elements', () => {
			expect(() => EULER_ANGLES_SCHEMA.parse(['0', 0, 0])).toThrow();
			expect(() => EULER_ANGLES_SCHEMA.parse([0, null, 0])).toThrow();
			expect(() => EULER_ANGLES_SCHEMA.parse([0, undefined, 0])).toThrow();
		});

		it('should reject arrays with wrong length', () => {
			expect(() => EULER_ANGLES_SCHEMA.parse([0, 0])).toThrow();
			expect(() => EULER_ANGLES_SCHEMA.parse([0, 0, 0, 0])).toThrow();
			expect(() => EULER_ANGLES_SCHEMA.parse([0])).toThrow();
			expect(() => EULER_ANGLES_SCHEMA.parse([])).toThrow();
		});

		it('should reject non-array inputs', () => {
			expect(() => EULER_ANGLES_SCHEMA.parse('not an array')).toThrow();
			expect(() => EULER_ANGLES_SCHEMA.parse(123)).toThrow();
			expect(() => EULER_ANGLES_SCHEMA.parse({})).toThrow();
		});

		it('should handle very small angles', () => {
			expect(EULER_ANGLES_SCHEMA.parse([1e-10, 1e-15, 1e-8])).toEqual([1e-10, 1e-15, 1e-8]);
		});
	});

	describe('AXIS_ANGLE_SCHEMA', () => {
		it('should accept valid axis-angle arrays', () => {
			expect(AXIS_ANGLE_SCHEMA.parse([0, 1, 0, Math.PI / 2])).toEqual([
				0, 1, 0, Math.PI / 2,
			]);
			expect(AXIS_ANGLE_SCHEMA.parse([1, 0, 0, 0])).toEqual([1, 0, 0, 0]);
			expect(AXIS_ANGLE_SCHEMA.parse([0, 0, 1, Math.PI])).toEqual([0, 0, 1, Math.PI]);
		});

		it('should accept negative angle values', () => {
			expect(AXIS_ANGLE_SCHEMA.parse([1, 0, 0, -Math.PI])).toEqual([1, 0, 0, -Math.PI]);
		});

		it('should accept non-normalized axes', () => {
			expect(AXIS_ANGLE_SCHEMA.parse([2, 3, 4, 1])).toEqual([2, 3, 4, 1]);
			expect(AXIS_ANGLE_SCHEMA.parse([10, 0, 0, 0.5])).toEqual([10, 0, 0, 0.5]);
		});

		it('should accept Infinity', () => {
			expect(AXIS_ANGLE_SCHEMA.parse([Infinity, 0, 0, 0])).toEqual([Infinity, 0, 0, 0]);
			expect(AXIS_ANGLE_SCHEMA.parse([0, 0, 0, Infinity])).toEqual([0, 0, 0, Infinity]);
		});

		it('should reject NaN values', () => {
			expect(() => AXIS_ANGLE_SCHEMA.parse([NaN, 0, 0, 0])).toThrow();
			expect(() => AXIS_ANGLE_SCHEMA.parse([1, NaN, 0, 0])).toThrow();
			expect(() => AXIS_ANGLE_SCHEMA.parse([1, 0, NaN, 0])).toThrow();
			expect(() => AXIS_ANGLE_SCHEMA.parse([1, 0, 0, NaN])).toThrow();
		});

		it('should reject non-numeric elements', () => {
			expect(() => AXIS_ANGLE_SCHEMA.parse(['0', 0, 0, 0])).toThrow();
			expect(() => AXIS_ANGLE_SCHEMA.parse([1, null, 0, 0])).toThrow();
			expect(() => AXIS_ANGLE_SCHEMA.parse([1, 0, undefined, 0])).toThrow();
		});

		it('should reject arrays with wrong length', () => {
			expect(() => AXIS_ANGLE_SCHEMA.parse([0, 0, 0])).toThrow();
			expect(() => AXIS_ANGLE_SCHEMA.parse([0, 0, 0, 0, 0])).toThrow();
			expect(() => AXIS_ANGLE_SCHEMA.parse([0])).toThrow();
		});

		it('should reject non-array inputs', () => {
			expect(() => AXIS_ANGLE_SCHEMA.parse('not an array')).toThrow();
			expect(() => AXIS_ANGLE_SCHEMA.parse(123)).toThrow();
			expect(() => AXIS_ANGLE_SCHEMA.parse({})).toThrow();
		});
	});

	describe('ROTATION_MATRIX_SCHEMA', () => {
		it('should accept valid 3x3 rotation matrices', () => {
			const identity = [
				[1, 0, 0],
				[0, 1, 0],
				[0, 0, 1],
			];
			expect(ROTATION_MATRIX_SCHEMA.parse(identity)).toEqual(identity);
		});

		it('should accept matrices with negative values', () => {
			const matrix = [
				[-1, 0, 0],
				[0, -1, 0],
				[0, 0, 1],
			];
			expect(ROTATION_MATRIX_SCHEMA.parse(matrix)).toEqual(matrix);
		});

		it('should accept matrices with fractional values', () => {
			const matrix = [
				[0.707, -0.707, 0],
				[0.707, 0.707, 0],
				[0, 0, 1],
			];
			expect(ROTATION_MATRIX_SCHEMA.parse(matrix)).toEqual(matrix);
		});

		it('should accept zero matrix', () => {
			const zeros = [
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0],
			];
			expect(ROTATION_MATRIX_SCHEMA.parse(zeros)).toEqual(zeros);
		});

		it('should accept matrices with Infinity', () => {
			const matrix = [
				[Infinity, 0, 0],
				[0, 1, 0],
				[0, 0, 1],
			];
			expect(ROTATION_MATRIX_SCHEMA.parse(matrix)).toEqual(matrix);
		});

		it('should reject matrices with NaN', () => {
			expect(() => ROTATION_MATRIX_SCHEMA.parse([
				[NaN, 0, 0],
				[0, 1, 0],
				[0, 0, 1],
			])).toThrow();
			expect(() => ROTATION_MATRIX_SCHEMA.parse([
				[1, 0, 0],
				[0, NaN, 0],
				[0, 0, 1],
			])).toThrow();
		});

		it('should reject non-numeric elements', () => {
			expect(() => ROTATION_MATRIX_SCHEMA.parse([
				['1', 0, 0],
				[0, 1, 0],
				[0, 0, 1],
			])).toThrow();
			expect(() => ROTATION_MATRIX_SCHEMA.parse([
				[1, 0, 0],
				[0, null, 0],
				[0, 0, 1],
			])).toThrow();
		});

		it('should reject matrices that are not 3x3', () => {
			// 2x3 matrix
			expect(() => ROTATION_MATRIX_SCHEMA.parse([
				[1, 0, 0],
				[0, 1, 0],
			])).toThrow();

			// 4x3 matrix
			expect(() => ROTATION_MATRIX_SCHEMA.parse([
				[1, 0, 0],
				[0, 1, 0],
				[0, 0, 1],
				[0, 0, 0],
			])).toThrow();

			// 3x2 matrix
			expect(() => ROTATION_MATRIX_SCHEMA.parse([
				[1, 0],
				[0, 1],
				[0, 0],
			])).toThrow();

			// 3x4 matrix
			expect(() => ROTATION_MATRIX_SCHEMA.parse([
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 1, 0],
			])).toThrow();
		});

		it('should reject non-array matrices', () => {
			expect(() => ROTATION_MATRIX_SCHEMA.parse('not an array')).toThrow();
			expect(() => ROTATION_MATRIX_SCHEMA.parse(123)).toThrow();
			expect(() => ROTATION_MATRIX_SCHEMA.parse({})).toThrow();
		});

		it('should reject matrices with non-array rows', () => {
			expect(() => ROTATION_MATRIX_SCHEMA.parse([
				[1, 0, 0],
				'not an array',
				[0, 0, 1],
			])).toThrow();
		});

		it('should reject empty matrix', () => {
			expect(() => ROTATION_MATRIX_SCHEMA.parse([])).toThrow();
		});

		it('should handle large and small numbers', () => {
			const matrix = [
				[1e10, -1e10, 1e-10],
				[-1e-10, 1, 0],
				[0, 0, 1e-15],
			];
			expect(ROTATION_MATRIX_SCHEMA.parse(matrix)).toEqual(matrix);
		});
	});
});
