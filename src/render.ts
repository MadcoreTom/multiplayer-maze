import { MAZE_SIZE } from "./constants";
import { State } from "./state";

const SCALE = Math.floor(1000 / MAZE_SIZE);

const COLOUR_MAP = {
    ".": "black",
    "#": "white",
    "?": "red",
    "%": "#FFC6B1"
}

export function render(ctx: CanvasRenderingContext2D, state: State) {
    const { maze, offset, path } = state;
    ctx.fillStyle = "grey";
    ctx.fillRect(0, 0, 1000, 1000);
    maze.forEach((x, y, v) => {
        ctx.fillStyle =COLOUR_MAP[v];
        x = (x + maze.width - offset[0]) % maze.width;
        y = (y + maze.height - offset[1]) % maze.height;
        ctx.fillRect(Math.round(x * SCALE), Math.round(y * SCALE), SCALE, SCALE);
    });

    if (path) {
        ctx.fillStyle = "blue";
        path.forEach(([x, y]) => {
            x = (x + maze.width - offset[0]) % maze.width;
            y = (y + maze.height - offset[1]) % maze.height;
            ctx.fillRect(x * SCALE + SCALE / 4, y * SCALE + SCALE / 4, SCALE / 2, SCALE / 2);
        })
    }


    ctx.fillStyle = "orangered";
    ctx.beginPath();
    ctx.arc((state.pos[0] - state.offset[0]) * SCALE, (state.pos[1] - state.offset[1]) * SCALE, SCALE * 0.6 * 0.5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(500, 500, SCALE * 8, 0, 2 * Math.PI);
    ctx.stroke();
}
