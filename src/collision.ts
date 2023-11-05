import { XY } from "./state";

/**
 * @param state game state
 * @param start start position
 * @param delta movement vector
 * @param radius radius of collider
 * @param isSolid given an XY, return true of solid
 * @param callback called with the potentially modified destination
 * @returns true if nothing was hit
 */
export function moveAndTestCollision<T>(state: T, start: XY, delta: XY, radius: number, isSolid: (state: T, pos: XY) => boolean, callback: (result: XY) => void): boolean {
	const topLeftCorner = [start[0] + delta[0] - radius, start[1] + delta[1] - radius] as XY; // top left corner of pos bounding box
	const root = topLeftCorner.map(Math.floor) as XY;// top left corner of pos bounding box, to grid

	const tl = isSolid(state, root);
	const tr = isSolid(state, [root[0] + 1, root[1]]);
	const bl = isSolid(state, [root[0], root[1] + 1]);
	const br = isSolid(state, [root[0] + 1, root[1] + 1]);

	// all solid
	if (tr && tl && br && bl) {
		return false;
	}

	const result = [start[0] + delta[0], start[1] + delta[1]] as XY; // new center (That we're testing)

	// all free, shortcut
	if (!tr && !tl && !br && !bl) {
		callback(result);
		return true;
	}

	let hit = false;

	// Walls
	// up down
	if (tr && tl || (tl && result[0] < root[0] + 1) || (tr && result[0] > root[0] + 1)) {
		if (result[1] < root[1] + 1 + radius) {
			result[1] = root[1] + 1 + radius;
			hit = true;
		}
	}
	if (br && bl || (bl && result[0] < root[0] + 1) || (br && result[0] > root[0] + 1)) {
		if (result[1] > root[1] + 1 - radius) {
			result[1] = root[1] + 1 - radius;
			hit = true;
		}
	}
	// left right
	if (tl && bl || (tl && result[1] < root[1] + 1) || (bl && result[1] > root[1] + 1)) {
		if (result[0] < root[0] + 1 + radius) {
			result[0] = root[0] + 1 + radius;
			hit = true;
		}
	}
	if (tr && br || (tr && result[1] < root[1] + 1) || (br && result[1] > root[1] + 1)) {
		if (result[0] > root[0] + 1 - radius) {
			result[0] = root[0] + 1 - radius;
			hit = true;
		}
	}

	// Corners
	if (
		(tl && !tr && !bl) ||
        (tr && !tl && !br) ||
        (bl && !br && !tl) ||
        (br && !bl && !tr)
	) {
		const centreRoot = [root[0] + 1, root[1] + 1] as XY;
		const collisionResult = circlePointCollision(centreRoot, result, radius);
		if (collisionResult !== false) {
			result[0] = collisionResult.newPos[0];
			result[1] = collisionResult.newPos[1];
			hit = true;
		}
	}

	callback(result);
	return !hit;
}

function min2(a:number,b:number):[number,boolean]{
	if(a<b){
		return [a,true];
	}
	return [b,false];
}

function circlePointCollision(pt: XY, circle: XY, radius: number): false | { overlap: number, newPos: XY } {
	const dx = circle[0] - pt[0];
	const dy = circle[1] - pt[1];
	const distSq = dx * dx + dy * dy;
	if (distSq < radius * radius) {
		const dist = Math.sqrt(distSq);
		const overlap = radius - dist;
		if (overlap > 0) {
			return {
				overlap: overlap,
				newPos: [
					circle[0] + dx / dist * overlap,
					circle[1] + dy / dist * overlap
				]
			};
		}
	}
	return false;
}