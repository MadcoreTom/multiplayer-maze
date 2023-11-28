import { Server, WebSocket, OPEN } from "ws";
import { ClientMessage } from "../net/net";
import { Arr } from "../arr";
import { MAZE_SIZE } from "../constants";
import { gameLoop } from "./game";
import { Client, ServerState } from "../state/common.state";

const TICK_RATE = 40;

export const state: ServerState = {
    mode: "play",
    players: [],
    roundEndTime: 0,
    paintQueue: [],
    maze: new Arr(MAZE_SIZE, MAZE_SIZE, " ")
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
        socket,
        score: 0
    };
    state.players.push(client);
}

function onMessage(socket: WebSocket, id: string, data: string) {
    // console.log(">", data);
    try {
        const message = JSON.parse(data) as ClientMessage;
        // console.log(">>", message);
        if ("update" in message && message.update) {
            const me = state.players.filter(c => c.id == id)[0];
            me.pos[0] = message.update.pos[0];
            me.pos[1] = message.update.pos[1];
            me.dir[0] = message.update.dir[0];
            me.dir[1] = message.update.dir[1];
            const x = Math.floor(me.pos[0]);
            const y = Math.floor(me.pos[1]);
            state.paintQueue.push([x, y, id]);
            const oldVal = state.maze.getSafe(x, y, "?");
            const oldPlayer = state.players.filter(p=>p.id == oldVal)[0];
            if(oldPlayer){
                oldPlayer.score--;
            }
            state.maze.setSafe(x, y, id);
            me.score++;
        }
    } catch (e) {
        console.warn("Malformed message, could not parse JSON");
    }
}

function onClose(socket: WebSocket, id: string) {
    console.log("DISCONNECT")
    // remove from state
    state.players = state.players.filter(c => c.id !== id);
    // broadcast
}

// TODO replace
let playerId = 0;
function randomId(): string {
    return (new Number(playerId++)).toString(16).toUpperCase();
}

function loop() {
    gameLoop(state);
    setTimeout(loop, TICK_RATE);
}

setTimeout(loop, 500);