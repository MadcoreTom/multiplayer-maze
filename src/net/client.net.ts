import { GameModifierNames } from "../common/modifiers";
import { ControlKey, keyDown } from "../controls";
import { MENU_MOVE, WIN } from "../sound";
import { State, XY } from "../state";
import { ClientMessage, Network, ServerMessage } from "./net";

const PORT = 8001;

export class ClientNetwork implements Network {
    private isConnected = false;
    private socket: WebSocket;
    private messages: ServerMessage[] = [];
    public constructor() {

        const host = window.location.hostname;
        const port = window.location.port;
        if (port == "8000") {
            console.log("Local serving mode")
            this.socket = new WebSocket(`ws://${host}:${PORT}/socketserver`);
        } else {
            this.socket = new WebSocket(`ws://${host}:${port}/ws/socketserver`);
        }
        this.socket.onopen = (ev) => {
            console.log("Connected");
            this.isConnected = true;
        };
        this.socket.onclose = (ev) => {
            console.log("Disconnected");
            this.isConnected = false;
        }
        this.socket.onmessage = (ev) => {
            const data = ev.data as string;
            if(keyDown(ControlKey.DEBUG)){
                console.log(">", data);
            }
            try {
                const message = JSON.parse(data);
                this.messages.push(message);
            } catch (e) {
                console.warn("Could not parse message")
            }
        }
    }

    sendUpdate(pos: XY, dir: XY): void {
        const message: ClientMessage = {
            update: {
                pos, dir
            }
        }
        const data = JSON.stringify(message);
        if (this.socket.readyState == this.socket.OPEN) {
            this.socket.send(data);
        }
    }

    processMessages(state: State) {
        let message: ServerMessage | undefined;
        while ((message = this.messages.shift())) {
            // console.log("process", message);

            if (message.type == "update") {
                state.gameTimeRemaining = parseFloat("" + message.timer);
                state.players = message.remotes.map(r => {
                    return {
                        pos: r.pos,
                        dir: r.dir,
                        lastTime: state.time, //todo
                        estPos: [...r.pos] as XY,
                        score: r.score,
                        id: r.id
                    }
                });
                message.paint.forEach(p => {
                    if (p.name == state.myId) {
                        const existing = state.maze.getSafe(p.pos[0], p.pos[1], "?");
                        if(existing != p.name){
                            state.soundQueue.push(MENU_MOVE);
                        }
                    }
                    state.maze.setSafe(p.pos[0], p.pos[1], p.name);
                });
            } else if (message.type == "refresh") {
                state.mode = "play";
                console.log("REFRESH", message.maze);
                console.log("MODIFIERS", message.modifiers);
                const modifiers = message.modifiers;
                state.modifiers = new Set(modifiers as GameModifierNames[]);
                state.maze.deserialise(message.maze, v => v);
                // state.maze.map((x,y,v)=>v == '%' ? "#": v)
            } else if (message.type == "score") {
                console.log("SCORE", message)
                if (state.mode != "scores") {
                    state.soundQueue.push(WIN);
                }
                state.mode = "scores";
                // state.scores = message.scores;
            } else if (message.type == "join") {
                console.log("JOIN", message)
                state.myId = message.id;
            }
        }
    }

    connected(): boolean {
        return this.isConnected;
    }
}
