import { Arr } from "./arr";

console.log("Maze");

const arr = new Arr<string>(19, 19, ".");
arr.init((x, y) =>
    x % 2 == 1 && y % 2 == 1 ? "#" : "."
);

console.log("Done")


const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;


function render() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 1000, 1000);
    const size = 20;
    arr.forEach((x, y, v) => {
        ctx.fillStyle = v == "#" ? "orangered" : "white";
        ctx.fillRect(x * size, y * size, size, size);
    });
}

render();