import { Server, WebSocket, OPEN } from "ws";
import { ClientMessage, ServerMessage } from "../net/net";
import { XY } from "../state";
import { Arr } from "../arr";
import { MAZE_SIZE } from "../constants";

const TICK_RATE = 40;

type Client = {
    pos: XY,
    dir: XY,
    lastTime: number,
    id: string,
    socket: WebSocket
};
type ServerState = {
    // seed:number,
    roundEndTime: number,
    // paint:Arr<string>,
    clients: Client[],
    paintQueue:XY[],
    paintMap:Arr<"%" | null>
}

const state: ServerState = {
    clients: [],
    roundEndTime :0,
    paintQueue :[],
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
    const client :Client= {
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
            state.paintQueue.push([x,y]);
            state.paintMap.setSafe(x,y,"%");
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
function randomId(): string {
    return (new Number(Math.random() * 9999999)).toString(32);
}

let loopCount = 0;
function loop() {

    const timer = state.roundEndTime -  Date.now();
    if(timer < 0){
        state.roundEndTime = Date.now() + 20000;
    }

const paint = state.paintQueue.map(p=>{return {pos:p, name:'red'}});

    state.clients.forEach(c => {
        const message: ServerMessage = {
            timer: timer,
            changes: {
                remotes: state.clients
                    // .filter(r=>r.id !== c.id)
                    .map(r => {
                        return {
                            name: "a",
                            pos: r.pos,
                            dir: r.dir
                        }
                    }),
                paint
            }
        }
        if (c.socket.readyState == c.socket.OPEN) {
            c.socket.send(JSON.stringify(message));
        }
    });

    if (loopCount++ % 10 == 0) {
        console.table(state.clients.map(c => [c.id, c.pos]));
    }

    state.paintQueue = [];


    setTimeout(loop, TICK_RATE);
}

setTimeout(loop, 500);