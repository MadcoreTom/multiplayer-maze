import { State, XY } from "../state";
import { ClientMessage, Network, ServerMessage } from "./net";

const PORT = 8001;

export class ClientNetwork implements Network {
    private socket: WebSocket;
    private messages: ServerMessage[] = [];
    public constructor() {

        const host = window.location.hostname;
        this.socket = new WebSocket(`ws://${host}:${PORT}/socketserver`);
        this.socket.onopen = (ev) => {
            console.log("Connected");
        };
        this.socket.onclose = (ev) => {
            console.log("Disconnected");
        }
        this.socket.onmessage = (ev) => {
            const data = ev.data as string;
            // console.log(">", data);
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
                state.remotePlayers = message.remotes.map(r => {
                    return {
                        lastPos: r.pos,
                        lastDir: r.dir,
                        lastTime: state.time, //todo
                        pos: [...r.pos] as XY
                    }
                });
                message.paint.forEach(p => {
                    state.maze.setSafe(p.pos[0], p.pos[1], "%")
                });
            } else if(message.type == "refresh"){
                console.log("REFRESH", message.maze);
                state.maze.deserialise(message.maze, v=>v=="1"?'#':'.');
                // state.maze.map((x,y,v)=>v == '%' ? "#": v)
            }
        }
    }
}
