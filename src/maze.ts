// TODO populate list of vertical and horizontal blocking XY [x,y,h|v][]
// pick at random (shift)
// a star both sides, of above threshold, join

import { Arr } from "./arr";
import { solve } from "./astar";

type Option = {
    a: [number, number],
    b: [number, number],
    centre: [number, number]
}

export function* maze<T>(arr: Arr<T>, solid: T, open: T, limit: number): Iterator<void, void> {
    const options: Option[] = [];

    // add options
    arr.forEach((x, y, cur) => {
        const left = arr.getSafe((x - 1 + arr.width) % arr.width, y, solid);
        const right = arr.getSafe((x + 1) % arr.width, y, solid);
        const up = arr.getSafe(x, (y - 1 + arr.height) % arr.height, solid);
        const down = arr.getSafe(x, (y + 1) % arr.height, solid);
        if (cur == solid) {
            if (left == open && right == open) {
                options.push({
                    a: [(x - 1 + arr.width) % arr.width, y],
                    b: [(x + 1) % arr.width, y],
                    centre: [x, y]
                });
            } else if (up == open && down == open) {
                options.push({
                    a: [x, (y - 1 + arr.height) % arr.height],
                    b: [x, (y + 1) % arr.height],
                    centre: [x, y]
                });
            }
        }
    });

    // shuffle
    for (let i = 0; i < options.length - 1; i++) {
        const r = options.length - Math.floor(Math.random() * (options.length - 1)) - 1;
        const tmp = options[i];
        options[i] = options[r];
        options[r] = tmp;
    }

    // work through the list
    for (let opt of options) {
        const path = solve(arr, a => a == solid, opt.a, opt.b, solid, limit);
        const join = path == null || path.length > limit;
        if (join) {
            arr.setSafe(opt.centre[0], opt.centre[1], open);
        }
        yield;
    }
}