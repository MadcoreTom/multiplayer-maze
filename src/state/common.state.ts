import { Arr } from "../arr";
import { Network } from "../net/net";
import { XY } from "../state";

export type GameMode = "play" | "scores";

// Players

type CommonPlayer = {
    pos: XY,
    dir: XY,
    id: string,
    score:number
}

export type Client = CommonPlayer & {
    lastTime: number,
    socket: WebSocket,
    firstRefresh:boolean
};

export type RemotePlayer = CommonPlayer & {
    lastTime: number,
    estPos: XY
}


// State

export type CommonState<T> = {
    mode: GameMode,
    players: T[],
    maze: Arr<string>
}

export type ServerState = CommonState<Client> & {
    roundEndTime: number,
    paintQueue: [number,number,string][],
    mazeGenerator?: Iterator<void, void>,
}

export type ClientState = CommonState<RemotePlayer> & {
    offset: XY,
    pos:XY,
    delta: number,
    time: number,
    gameTimeRemaining: number,
    server: Network,
    myId:string,
    overlayPos: number
}