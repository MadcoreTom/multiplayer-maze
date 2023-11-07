import { Arr } from "./arr"
import { Path } from "./astar";
import { SimulatedNetwork } from "./net/simulated.net";
import { Network } from "./net/net";
import { ClientNetwork } from "./net/client.net";

export type XY = [number, number];

export type RemotePlayer = {
    lastPos:XY,
    lastDir: XY,
    lastTime: number,
    pos: XY
}

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
    remotePlayers: RemotePlayer[]
}

export function initState(size: number): State {
    return {
        maze: new Arr<string>(size, size, "?"),
        pos:[1.5,1.5],
        offset: [0, 0],
        delta: 1,
        time: 0,
        server:new ClientNetwork(),
        gameTimeRemaining:0,
        remotePlayers: []
    }
}