import { MAZE_SIZE } from "./constants";
import { State } from "./state";

const SCALE = Math.floor(1000 / MAZE_SIZE);

export function render(ctx: CanvasRenderingContext2D, state: State) {
    const { maze, offset, path } = state;
    ctx.fillStyle = "grey";
    ctx.fillRect(0, 0, 1000, 1000);
    maze.forEach((x, y, v) => {
        ctx.fillStyle = v == "#" ? "white" : "black";
        x = (x + maze.width - offset[0]) % maze.width;
        y = (y + maze.height - offset[1]) % maze.height;
        ctx.fillRect(Math.floor(x * SCALE), Math.floor(y * SCALE), SCALE, SCALE);
    });

    if (path) {
        ctx.fillStyle = "blue";
        path.forEach(([x, y]) => {
            x = (x + maze.width - offset[0]) % maze.width;
            y = (y + maze.height - offset[1]) % maze.height;
            ctx.fillRect(x * SCALE + SCALE / 4, y * SCALE + SCALE / 4, SCALE / 2, SCALE / 2);
        })
    }
}
