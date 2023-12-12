import { State, XY } from "../state";

export type ClientMessage = {
    join?: { name: string },
    update?: { pos: XY, dir: XY },
}

export type UpdateServerMessage = {
    type: "update",
    paint: { pos: XY, name: string }[],
    remotes: { id: string, pos: XY, dir: XY, score: number }[],
    timer: number
}

export type ScoreServerMessage = {
    type: "score",
    scores: { player: string, score: number }[]
}

export type RefreshServerMessage = {
    type: "refresh",
    timer: number,
    maze: string,
    modifiers:string[]
}

export type OnJoinServerMessage = {
    type: "join",
    id: string
}

export type ServerMessage = UpdateServerMessage | ScoreServerMessage | RefreshServerMessage | OnJoinServerMessage;

export interface Network {
    sendUpdate(pos: XY, ddirection: XY): void;

    processMessages(state: State);

    connected(): boolean;
}