import { Arr } from "./arr";
import { solve } from "./astar";

console.log("Maze");

const arr = new Arr<string>(19, 19, ".");
arr.init((x, y) =>
    (x % 2 == 1 && y % 2 == 1) || Math.random() > 0.3 ? "#" : "."
);

const path = solve(arr,v=>v==".",[1,3],[15,13],"?");
console.log(path)

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

    if(path){
        ctx.fillStyle = "blue";
        path.forEach(([x,y])=>{
            ctx.fillRect(x * size+size/4, y * size+size/4, size/2, size/2);
        })
    }
}

render();