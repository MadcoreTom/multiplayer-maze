import { Server, WebSocket, OPEN } from "ws";
import { ClientMessage, ServerMessage } from "../net/net";
import { XY } from "../state";
import { Arr } from "../arr";
import { MAZE_SIZE } from "../constants";
import { gameLoop } from "./game";

const TICK_RATE = 40;

type Client = {
    pos: XY,
    dir: XY,
    lastTime: number,
    id: string,
    socket: WebSocket
};
export type ServerState = {
    mode: "play" | "scores",
    // seed:number,
    roundEndTime: number,
    // paint:Arr<string>,
    clients: Client[],
    paintQueue: [number,number,string][],
    paintMap: Arr<string | null>
    maze?:Arr<boolean>
    mazeGenerator?: Iterator<void, void>,
}

export const state: ServerState = {
    mode: "play",
    clients: [],
    roundEndTime: 0,
    paintQueue: [],
    paintMap: new Arr(MAZE_SIZE, MAZE_SIZE, null)
};

const server = new Server({ port: 8001 });
const decoder = new TextDecoder();

server.on('connection', socket => {
    const id = randomId();

    if (socket.readyState === OPEN) {
        onConnect(socket, id);
    }

    // Handle messages from this client
    socket.on('message', data => onMessage(socket, id, decoder.decode(data as any)));

    // Handle disconnection of this client
    socket.on('close', () => onClose(socket, id));
});

function onConnect(socket: WebSocket, id: string) {
    console.log("CONNECT");
    // Add to state
    const client: Client = {
        id,
        dir: [0, 0],
        pos: [0, 0],
        lastTime: 0,
        socket
    };
    state.clients.push(client);
}

function onMessage(socket: WebSocket, id: string, data: string) {
    // console.log(">", data);
    try {
        const message = JSON.parse(data) as ClientMessage;
        // console.log(">>", message);
        if ("update" in message && message.update) {
            const me = state.clients.filter(c => c.id == id)[0];
            me.pos[0] = message.update.pos[0];
            me.pos[1] = message.update.pos[1];
            me.dir[0] = message.update.dir[0];
            me.dir[1] = message.update.dir[1];
            const x = Math.floor(me.pos[0]);
            const y = Math.floor(me.pos[1]);
            state.paintQueue.push([x, y, id]);
            state.paintMap.setSafe(x, y, id);
        }
    } catch (e) {
        console.warn("Malformed message, could not parse JSON");
    }
}

function onClose(socket: WebSocket, id: string) {
    console.log("DISCONNECT")
    // remove from state
    state.clients = state.clients.filter(c => c.id !== id);
    // broadcast
}

// TODO replace
let playerId = 0;
function randomId(): string {
    return (new Number(playerId++)).toString(32);
}

function loop() {
    gameLoop(state);
    setTimeout(loop, TICK_RATE);
}

setTimeout(loop, 500);