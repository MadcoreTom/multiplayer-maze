import { Arr } from "./arr";
import { Path, solve } from "./astar";
import { maze } from "./maze";

const STEPS_PER_FRAME = 10;
const MAX_DISTANCE = 18;
const MAZE_SIZE = 40;
const SCALE = Math.floor(1000 / MAZE_SIZE);

const arr = new Arr<string>(MAZE_SIZE, MAZE_SIZE, ".");
arr.init((x, y) =>
    (x % 2 == 1 && y % 2 == 1) ? "#" : "."
);

const mazeGenerator = maze(arr, ".", "#", MAX_DISTANCE);



const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

let offset:[number,number] = [0,0];


function render(path: Path | null) {
    ctx.fillStyle = "grey";
    ctx.fillRect(0, 0, 1000, 1000);
    arr.forEach((x, y, v) => {
        ctx.fillStyle = v == "#" ? "white" : "black";
        x = (x + arr.width - offset[0]) %arr.width;
        y = (y + arr.height - offset[1]) %arr.height;
        ctx.fillRect(Math.floor(x * SCALE),Math.floor( y * SCALE), SCALE, SCALE);
    });

    if (path) {
        ctx.fillStyle = "blue";
        path.forEach(([x, y]) => {
            x = (x + arr.width - offset[0]) %arr.width;
            y = (y + arr.height - offset[1]) %arr.height;
            ctx.fillRect(x * SCALE + SCALE / 4, y * SCALE + SCALE / 4, SCALE / 2, SCALE / 2);
        })
    }
}

let lastTime = 0;
const MAX_FRAME_TIME = 1000/10;


function tick(time: number) {
    const delta = Math.min(MAX_FRAME_TIME, time - lastTime);
    lastTime = time;

    offset[0] += delta / 300;
    offset[1] += delta / 200;
    if(offset[0] > arr.width){
        offset[0] -= arr.width;
    }
    if(offset[1] > arr.height){
        offset[1] -= arr.height;
    }

    let result;
    for (let i = 0; i < STEPS_PER_FRAME && (!result || !result.done); i++) {
        result = mazeGenerator.next();
    }
    let path = solve(arr, v => v == ".", [1, 1], [Math.floor(MAZE_SIZE/2)-1,Math.floor(MAZE_SIZE/2)-1], "?");
    console.log("-")

    render(path);
    // if (!result.done) {
        window.requestAnimationFrame(tick);
    // }
}

tick(0);