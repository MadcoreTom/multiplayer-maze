import { Arr } from "./arr"
import { ClientNetwork } from "./net/client.net";
import { ClientState } from "./state/common.state";

export type XY = [number, number];


export type State = ClientState


export function initState(size: number): State {
    return {
        maze: new Arr<string>(size, size, "?"),
        pos:[1.5,1.5],
        offset: [0, 0],
        delta: 1,
        time: 0,
        server:new ClientNetwork(),
        gameTimeRemaining:0,
        players: [],
        mode: "play",
        overlayPos: 0.5,
        myId:"?",
        soundQueue:[],
        modifiers: new Set(),
        notes: []
    }
}