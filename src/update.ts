import { solve } from "./astar";
import { MAZE_SIZE } from "./constants";
import { ControlKey, keyDown } from "./controls";
import { maze } from "./maze";
import { State, XY } from "./state";

const STEPS_PER_FRAME = 10;
const MAX_DISTANCE = 28;
const MOVE_SPEED = 0.021;

export function update(state: State) {
    const { offset, delta, time } = state;

    move(state);

    // Keep generating the map
    if (!state.mazeGenerator) {
        state.mazeGenerator = maze(state.maze, ".", "#", MAX_DISTANCE);
    }
    let result;
    for (let i = 0; i < STEPS_PER_FRAME && (!result || !result.done); i++) {
        result = state.mazeGenerator.next();
    }
    state.path = solve(state.maze, v => v == ".", [1, 1], [Math.floor(MAZE_SIZE / 2 + offset[0]) - 1, Math.floor(MAZE_SIZE / 2 + offset[1]) - 1], "?");
}

function move(state: State) {
    const { offset, delta } = state;
    const move: XY = [0, 0];
    if (keyDown(ControlKey.LEFT)) {
        move[0] = -1;
    }
    if (keyDown(ControlKey.RIGHT)) {
        move[0] = 1;
    }
    if (keyDown(ControlKey.UP)) {
        move[1] = -1;
    }
    if (keyDown(ControlKey.DOWN)) {
        move[1] = 1;
    }
	if (move[0] != 0 && move[1] != 0) {
		move[0] /= Math.SQRT2;
		move[1] /= Math.SQRT2;
	}
	move[0] *= delta * MOVE_SPEED;
	move[1] *= delta * MOVE_SPEED;

	offset[0] += move[0];
	offset[1] += move[1];
    offset[0] = clamp(offset[0], 0, state.maze.width);
    offset[1] = clamp(offset[1], 0, state.maze.height);
}

function clamp(val: number, low: number, high: number): number {
    if (val < low) {
        return (val + high - low) % (high - low);
    } else if (val >= high) {
        return val % (high - low);
    }
    return val;
}