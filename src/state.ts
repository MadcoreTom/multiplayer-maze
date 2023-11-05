import { Arr } from "./arr"
import { Path } from "./astar";
import { SimulatedNetwork } from "./net/simulated.net";
import { Network } from "./net/net";

export type XY = [number, number];

export type State = {
    maze: Arr<string>,
    offset: XY,
    pos:XY,
    path?: Path,
    delta: number,
    time: number,
    mazeGenerator?: Iterator<void, void>,
    server: Network,
    gameTimeRemaining: number,
}

export function initState(size: number): State {
    return {
        maze: new Arr<string>(size, size, "?"),
        pos:[1.5,1.5],
        offset: [0, 0],
        delta: 1,
        time: 0,
        server:new SimulatedNetwork(),
        gameTimeRemaining:0
    }
}