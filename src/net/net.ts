import { State, XY } from "../state";

export type ClientMessage = {
    join?: { name: string },
    update?: { pos: XY, dir: XY },
}

export type ServerMessage = {
    newGame?: { seed: number },
    changes?: {
        paint?: { pos: XY, name: string }[],
        remotes?: { name: string, pos: XY, dir: XY }[]
    },
    timer: number
}

export interface Network {
    sendUpdate(pos: XY, ddirection: XY): void;

    processMessages(state: State);
}