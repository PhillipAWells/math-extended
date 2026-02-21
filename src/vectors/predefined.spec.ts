import {
	VectorZero,
	VectorOne,
	Vector2Up,
	Vector3Up,
	Vector4Up,
	Vector2Down,
	Vector3Down,
	Vector4Down,
	Vector2Left,
	Vector3Left,
	Vector4Left,
	Vector2Right,
	Vector3Right,
	Vector4Right,
	Vector3Forward,
	Vector4Forward,
	Vector3Backward,
	Vector4Backward,
} from './predefined.js';

describe('Predefined Vectors', () => {
	describe('VectorZero', () => {
		it('should create a 1D zero vector', () => {
			const vector = VectorZero(1);
			expect(vector).toEqual([0]);
			expect(vector).toHaveLength(1);
		});

		it('should create a 2D zero vector', () => {
			const vector = VectorZero(2);
			expect(vector).toEqual([0, 0]);
			expect(vector).toHaveLength(2);
		});

		it('should create a 3D zero vector', () => {
			const vector = VectorZero(3);
			expect(vector).toEqual([0, 0, 0]);
			expect(vector).toHaveLength(3);
		});

		it('should create a 4D zero vector', () => {
			const vector = VectorZero(4);
			expect(vector).toEqual([0, 0, 0, 0]);
			expect(vector).toHaveLength(4);
		});
	});

	describe('VectorOne', () => {
		it('should create a 1D ones vector', () => {
			const vector = VectorOne(1);
			expect(vector).toEqual([1]);
			expect(vector).toHaveLength(1);
		});

		it('should create a 2D ones vector', () => {
			const vector = VectorOne(2);
			expect(vector).toEqual([1, 1]);
			expect(vector).toHaveLength(2);
		});

		it('should create a 3D ones vector', () => {
			const vector = VectorOne(3);
			expect(vector).toEqual([1, 1, 1]);
			expect(vector).toHaveLength(3);
		});

		it('should create a 4D ones vector', () => {
			const vector = VectorOne(4);
			expect(vector).toEqual([1, 1, 1, 1]);
			expect(vector).toHaveLength(4);
		});
	});

	describe('2D Direction Vectors', () => {
		describe('Vector2Up', () => {
			it('should create a 2D up direction vector', () => {
				const vector = Vector2Up();
				expect(vector).toEqual([0, 1]);
				expect(vector).toHaveLength(2);
			});

			it('should return a new instance each time', () => {
				const vector1 = Vector2Up();
				const vector2 = Vector2Up();
				expect(vector1).toEqual(vector2);
				expect(vector1).not.toBe(vector2); // Different instances
			});
		});

		describe('Vector2Down', () => {
			it('should create a 2D down direction vector', () => {
				const vector = Vector2Down();
				expect(vector).toEqual([0, -1]);
				expect(vector).toHaveLength(2);
			});

			it('should return a new instance each time', () => {
				const vector1 = Vector2Down();
				const vector2 = Vector2Down();
				expect(vector1).toEqual(vector2);
				expect(vector1).not.toBe(vector2);
			});
		});

		describe('Vector2Left', () => {
			it('should create a 2D left direction vector', () => {
				const vector = Vector2Left();
				expect(vector).toEqual([-1, 0]);
				expect(vector).toHaveLength(2);
			});

			it('should return a new instance each time', () => {
				const vector1 = Vector2Left();
				const vector2 = Vector2Left();
				expect(vector1).toEqual(vector2);
				expect(vector1).not.toBe(vector2);
			});
		});

		describe('Vector2Right', () => {
			it('should create a 2D right direction vector', () => {
				const vector = Vector2Right();
				expect(vector).toEqual([1, 0]);
				expect(vector).toHaveLength(2);
			});

			it('should return a new instance each time', () => {
				const vector1 = Vector2Right();
				const vector2 = Vector2Right();
				expect(vector1).toEqual(vector2);
				expect(vector1).not.toBe(vector2);
			});
		});
	});

	describe('3D Direction Vectors', () => {
		describe('Vector3Up', () => {
			it('should create a 3D up direction vector', () => {
				const vector = Vector3Up();
				expect(vector).toEqual([0, 1, 0]);
				expect(vector).toHaveLength(3);
			});

			it('should return a new instance each time', () => {
				const vector1 = Vector3Up();
				const vector2 = Vector3Up();
				expect(vector1).toEqual(vector2);
				expect(vector1).not.toBe(vector2);
			});
		});

		describe('Vector3Down', () => {
			it('should create a 3D down direction vector', () => {
				const vector = Vector3Down();
				expect(vector).toEqual([0, -1, 0]);
				expect(vector).toHaveLength(3);
			});

			it('should return a new instance each time', () => {
				const vector1 = Vector3Down();
				const vector2 = Vector3Down();
				expect(vector1).toEqual(vector2);
				expect(vector1).not.toBe(vector2);
			});
		});

		describe('Vector3Left', () => {
			it('should create a 3D left direction vector', () => {
				const vector = Vector3Left();
				expect(vector).toEqual([-1, 0, 0]);
				expect(vector).toHaveLength(3);
			});

			it('should return a new instance each time', () => {
				const vector1 = Vector3Left();
				const vector2 = Vector3Left();
				expect(vector1).toEqual(vector2);
				expect(vector1).not.toBe(vector2);
			});
		});

		describe('Vector3Right', () => {
			it('should create a 3D right direction vector', () => {
				const vector = Vector3Right();
				expect(vector).toEqual([1, 0, 0]);
				expect(vector).toHaveLength(3);
			});

			it('should return a new instance each time', () => {
				const vector1 = Vector3Right();
				const vector2 = Vector3Right();
				expect(vector1).toEqual(vector2);
				expect(vector1).not.toBe(vector2);
			});
		});

		describe('Vector3Forward', () => {
			it('should create a 3D forward direction vector', () => {
				const vector = Vector3Forward();
				expect(vector).toEqual([0, 0, 1]);
				expect(vector).toHaveLength(3);
			});

			it('should return a new instance each time', () => {
				const vector1 = Vector3Forward();
				const vector2 = Vector3Forward();
				expect(vector1).toEqual(vector2);
				expect(vector1).not.toBe(vector2);
			});
		});

		describe('Vector3Backward', () => {
			it('should create a 3D backward direction vector', () => {
				const vector = Vector3Backward();
				expect(vector).toEqual([0, 0, -1]);
				expect(vector).toHaveLength(3);
			});

			it('should return a new instance each time', () => {
				const vector1 = Vector3Backward();
				const vector2 = Vector3Backward();
				expect(vector1).toEqual(vector2);
				expect(vector1).not.toBe(vector2);
			});
		});
	});

	describe('4D Direction Vectors', () => {
		describe('Vector4Up', () => {
			it('should create a 4D up direction vector', () => {
				const vector = Vector4Up();
				expect(vector).toEqual([0, 1, 0, 0]);
				expect(vector).toHaveLength(4);
			});

			it('should return a new instance each time', () => {
				const vector1 = Vector4Up();
				const vector2 = Vector4Up();
				expect(vector1).toEqual(vector2);
				expect(vector1).not.toBe(vector2);
			});
		});

		describe('Vector4Down', () => {
			it('should create a 4D down direction vector', () => {
				const vector = Vector4Down();
				expect(vector).toEqual([0, -1, 0, 0]);
				expect(vector).toHaveLength(4);
			});

			it('should return a new instance each time', () => {
				const vector1 = Vector4Down();
				const vector2 = Vector4Down();
				expect(vector1).toEqual(vector2);
				expect(vector1).not.toBe(vector2);
			});
		});

		describe('Vector4Left', () => {
			it('should create a 4D left direction vector', () => {
				const vector = Vector4Left();
				expect(vector).toEqual([-1, 0, 0, 0]);
				expect(vector).toHaveLength(4);
			});

			it('should return a new instance each time', () => {
				const vector1 = Vector4Left();
				const vector2 = Vector4Left();
				expect(vector1).toEqual(vector2);
				expect(vector1).not.toBe(vector2);
			});
		});

		describe('Vector4Right', () => {
			it('should create a 4D right direction vector', () => {
				const vector = Vector4Right();
				expect(vector).toEqual([1, 0, 0, 0]);
				expect(vector).toHaveLength(4);
			});

			it('should return a new instance each time', () => {
				const vector1 = Vector4Right();
				const vector2 = Vector4Right();
				expect(vector1).toEqual(vector2);
				expect(vector1).not.toBe(vector2);
			});
		});

		describe('Vector4Forward', () => {
			it('should create a 4D forward direction vector', () => {
				const vector = Vector4Forward();
				expect(vector).toEqual([0, 0, 1, 0]);
				expect(vector).toHaveLength(4);
			});

			it('should return a new instance each time', () => {
				const vector1 = Vector4Forward();
				const vector2 = Vector4Forward();
				expect(vector1).toEqual(vector2);
				expect(vector1).not.toBe(vector2);
			});
		});

		describe('Vector4Backward', () => {
			it('should create a 4D backward direction vector', () => {
				const vector = Vector4Backward();
				expect(vector).toEqual([0, 0, -1, 0]);
				expect(vector).toHaveLength(4);
			});

			it('should return a new instance each time', () => {
				const vector1 = Vector4Backward();
				const vector2 = Vector4Backward();
				expect(vector1).toEqual(vector2);
				expect(vector1).not.toBe(vector2);
			});
		});
	});

	describe('Mathematical Properties', () => {
		it('should create unit vectors for all direction functions', () => {
			// Test that all direction vectors have magnitude of 1 (within floating point precision)
			const vectors = [
				Vector2Up(),
				Vector2Down(),
				Vector2Left(),
				Vector2Right(),
				Vector3Up(),
				Vector3Down(),
				Vector3Left(),
				Vector3Right(),
				Vector3Forward(),
				Vector3Backward(),
				Vector4Up(),
				Vector4Down(),
				Vector4Left(),
				Vector4Right(),
				Vector4Forward(),
				Vector4Backward(),
			];
			vectors.forEach((vector) => {
				const magnitude = Math.sqrt(vector.reduce((sum, component) => sum + (component * component), 0));
				expect(magnitude).toBeCloseTo(1, 10);
			});
		});

		it('should create orthogonal pairs for opposite directions', () => {
			// Test 2D orthogonal pairs
			const up2D = Vector2Up();
			const down2D = Vector2Down();
			const left2D = Vector2Left();
			const right2D = Vector2Right();
			// Dot product of opposite vectors should be -1
			expect((up2D[0] * down2D[0]) + (up2D[1] * down2D[1])).toBeCloseTo(-1);
			expect((left2D[0] * right2D[0]) + (left2D[1] * right2D[1])).toBeCloseTo(-1);

			// Dot product of perpendicular vectors should be 0
			expect((up2D[0] * left2D[0]) + (up2D[1] * left2D[1])).toBeCloseTo(0);
			expect((up2D[0] * right2D[0]) + (up2D[1] * right2D[1])).toBeCloseTo(0);

			// Test 3D orthogonal pairs
			const up3D = Vector3Up();
			const down3D = Vector3Down();
			const left3D = Vector3Left();
			const right3D = Vector3Right();
			const forward3D = Vector3Forward();
			const backward3D = Vector3Backward();
			// Dot product of opposite vectors should be -1
			expect((up3D[0] * down3D[0]) + (up3D[1] * down3D[1]) + (up3D[2] * down3D[2])).toBeCloseTo(-1);
			expect((left3D[0] * right3D[0]) + (left3D[1] * right3D[1]) + (left3D[2] * right3D[2])).toBeCloseTo(-1);
			expect((forward3D[0] * backward3D[0]) + (forward3D[1] * backward3D[1]) + (forward3D[2] * backward3D[2])).toBeCloseTo(-1);

			// Dot product of perpendicular vectors should be 0
			expect((up3D[0] * left3D[0]) + (up3D[1] * left3D[1]) + (up3D[2] * left3D[2])).toBeCloseTo(0);
			expect((up3D[0] * forward3D[0]) + (up3D[1] * forward3D[1]) + (up3D[2] * forward3D[2])).toBeCloseTo(0);
			expect((left3D[0] * forward3D[0]) + (left3D[1] * forward3D[1]) + (left3D[2] * forward3D[2])).toBeCloseTo(0);
		});
	});

	describe('Immutability', () => {
		it('should not affect original vectors when modified', () => {
			const zero2D = VectorZero(2);
			const originalZero = [...zero2D];
			zero2D[0] = 999;

			const newZero2D = VectorZero(2);
			expect(newZero2D).toEqual(originalZero);
			expect(newZero2D).not.toEqual(zero2D);

			const up = Vector3Up();
			const originalUp = [...up];
			up[1] = 999;

			const newUp = Vector3Up();
			expect(newUp).toEqual(originalUp);
			expect(newUp).not.toEqual(up);
		});
	});
});
