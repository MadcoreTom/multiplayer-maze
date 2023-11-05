import { Arr } from "./arr";
import { Path, solve } from "./astar";
import { maze } from "./maze";

const STEPS_PER_FRAME = 10;
const MAX_DISTANCE = 7;
const MAZE_SIZE = 29;
const SCALE = Math.floor(1000 / MAZE_SIZE);

const arr = new Arr<string>(MAZE_SIZE, MAZE_SIZE, ".");
arr.init((x, y) =>
    (x % 2 == 1 && y % 2 == 1) ? "#" : "."
);

const mazeGenerator = maze(arr, ".", "#", MAX_DISTANCE);



const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;



function render(path: Path | null) {
    ctx.fillStyle = "orangered";
    ctx.fillRect(0, 0, 1000, 1000);
    arr.forEach((x, y, v) => {
        ctx.fillStyle = v == "#" ? "white" : "black";
        ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
    });

    if (path) {
        ctx.fillStyle = "blue";
        path.forEach(([x, y]) => {
            ctx.fillRect(x * SCALE + SCALE / 4, y * SCALE + SCALE / 4, SCALE / 2, SCALE / 2);
        })
    }
}



function tick(time: number) {
    let result;
    for (let i = 0; i < STEPS_PER_FRAME && (!result || !result.done); i++) {
        result = mazeGenerator.next();
    }
    let path = solve(arr, v => v == ".", [1, 1], [MAZE_SIZE-2, MAZE_SIZE-2], "?");
    console.log("-")

    render(path);
    if (!result.done) {
        window.requestAnimationFrame(tick);
    }
}

tick(0);