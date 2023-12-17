import {  WebSocket } from "ws";
import { ClientMessage, OnJoinServerMessage } from "../net/net";
import { Arr } from "../arr";
import { MAZE_SIZE } from "../constants";
import { gameLoop } from "./game";
import { Client, ServerState } from "../state/common.state";
import { pickRandom } from "../common/util";
const {Server, OPEN} = require('ws')
const TICK_RATE = 30;

export const state: ServerState = {
    mode: "play",
    players: [],
    roundEndTime: 0,
    paintQueue: [],
    maze: new Arr(MAZE_SIZE, MAZE_SIZE, " "),
    modifiers: new Set(),
    sendScores: true
};

const server = new Server({ port: 8001 });
const decoder = new TextDecoder();

server.on('connection', socket => {
    const id = nextPlayerId();

    if (socket.readyState === OPEN) {
        onConnect(socket, id);
        if(state.players.length == 1){
            state.mode = "play";
            state.roundEndTime = -1;
        }
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
        firstRefresh:true,
        score: 0,
        lastMessage: Date.now()
    };
    state.players.push(client);
    const msg:OnJoinServerMessage = {
        type:"join",
        id
    }
    socket.send(JSON.stringify(msg));
}

function onMessage(socket: WebSocket, id: string, data: string) {
    // console.log(">", data);
    try {
        const message = JSON.parse(data) as ClientMessage;
        // console.log(">>", message);
        if ("update" in message && message.update && state.mode == "play") {
            const me = state.players.filter(c => c.id == id)[0];
            me.lastMessage = Date.now();
            me.pos[0] = message.update.pos[0];
            me.pos[1] = message.update.pos[1];
            me.dir[0] = message.update.dir[0];
            me.dir[1] = message.update.dir[1];
            const x = Math.floor(me.pos[0]);
            const y = Math.floor(me.pos[1]);
            const oldVal = state.maze.getSafe(x, y, "?");
            let repaint = oldVal != id;
            if(state.modifiers.has("RANDOM_PAINT") || state.modifiers.has("NO_REPAINT")){
                repaint = oldVal == "#";
            }
            if (repaint) {
                const newVal = state.modifiers.has("RANDOM_PAINT") ? pickRandom(ALL_PLAYER_IDS) : id;
                state.paintQueue.push([x, y, newVal]);
                const oldPlayer = state.players.filter(p => p.id == oldVal)[0];
                if (oldPlayer) {
                    oldPlayer.score--;
                }
                const newPlayer = state.players.filter(p => p.id == newVal)[0];
                state.maze.setSafe(x, y, newVal);
                if (newPlayer) {
                    newPlayer.score++;
                }
            }
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

export const ALL_PLAYER_IDS = "0123456789ABCDEF".split("");


function nextPlayerId(): string {
    const availablePlayers = ALL_PLAYER_IDS.filter(id => state.players.filter(p => p.id == id).length == 0);
    return pickRandom(availablePlayers);
}

function loop() {
    gameLoop(state);
    setTimeout(loop, TICK_RATE);
}

setTimeout(loop, 500);