import { MAZE_SIZE } from "./constants";
import { registerKeyboard } from "./controls";
import { render } from "./render";
import { initState } from "./state";
import { update } from "./update";

const state = initState(MAZE_SIZE);
state.maze.init((x, y) =>
    (x % 2 == 1 && y % 2 == 1) ? "#" : "."
);

const a =state.maze.serialise(v=>v,",")
console.log("SER",a);
state.maze.deserialise(a,v=>v,",");

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
registerKeyboard();

let lastTime = 0;
const MAX_FRAME_TIME = 1000 / 10;

function tick(time: number) {
    // Time
    state.delta = Math.min(MAX_FRAME_TIME, time - lastTime);
    state.time = time;
    lastTime = time;

    // Update and render loop
    update(state);
    render(ctx, state);

    // Do it again
    window.requestAnimationFrame(tick);
}

tick(0);