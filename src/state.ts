import { Arr } from "./arr"
import { Path } from "./astar";

export type XY = [number, number];

export type State = {
    maze: Arr<string>,
    offset: XY,
    path?: Path,
    delta: number,
    time: number,
    mazeGenerator?: Iterator<void, void>
}

export function initState(size: number): State {
    return {
        maze: new Arr<string>(size, size, "?"),
        offset: [0, 0],
        delta: 1,
        time: 0
    }
}