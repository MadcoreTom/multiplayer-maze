import { solve } from "./astar";
import { MAZE_SIZE } from "./constants";
import { maze } from "./maze";
import { State } from "./state";

const STEPS_PER_FRAME = 10;
const MAX_DISTANCE = 18;

export function update(state: State) {
    const { offset, delta, time } = state;

    // Move the camera
    offset[0] += delta / 300;
    offset[1] += Math.sin(time / 2000) * 0.04;
    if (offset[0] > state.maze.width) {
        offset[0] -= state.maze.width;
    }
    if (offset[1] > state.maze.height) {
        offset[1] -= state.maze.height;
    }

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