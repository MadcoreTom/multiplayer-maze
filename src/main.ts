import { Arr } from "./arr";

console.log("Maze");

const arr = new Arr<string>(9, 9, ".");
arr.init((x, y) =>
    x % 2 == 0 && y % 2 == 0 ? "#" : "."
);

console.log("Done")