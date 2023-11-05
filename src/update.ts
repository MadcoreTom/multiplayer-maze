import { moveAndTestCollision } from "./collision";
import { MAZE_SIZE } from "./constants";
import { ControlKey, keyDown } from "./controls";
import { maze } from "./maze";
import { State, XY } from "./state";

const STEPS_PER_FRAME = 10;
const MAX_DISTANCE = 9;
const MOVE_SPEED = 0.011;

export function update(state: State) {

    move(state);
    state.offset[0] = state.pos[0] - MAZE_SIZE / 2;
    state.offset[1] = state.pos[1] - MAZE_SIZE / 2;


    // Keep generating the map
    if (!state.mazeGenerator) {
        state.mazeGenerator = maze(state.maze, ".", "#", MAX_DISTANCE);
    }
    let result;
    for (let i = 0; i < STEPS_PER_FRAME && (!result || !result.done); i++) {
        result = state.mazeGenerator.next();
    }
    if (result.done) {
        console.log(Math.floor(state.pos[0]), Math.floor(state.pos[1]))
        state.maze.setSafe(Math.floor(state.pos[0]), Math.floor(state.pos[1]), "%");
    }
}

function move(state: State) {
    const { pos, delta } = state;
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

    moveAndTestCollision(state, pos, move, 0.3,
        (s, p) => s.maze.getSafe(wrap(p[0], 0, s.maze.width), wrap(p[1], 0, s.maze.height), "?") == ".",
        result => state.pos = result
    );

    state.pos[0] = wrap(state.pos[0], 0, state.maze.width);
    state.pos[1] = wrap(state.pos[1], 0, state.maze.height);
}

function wrap(val: number, low: number, high: number): number {
    if (val < low) {
        return (val % (high - low) + high - low) % (high - low);
    } else if (val >= high) {
        return val % (high - low);
    }
    return val;
}