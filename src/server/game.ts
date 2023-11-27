import { Arr } from "../arr";
import { maze } from "../maze";
import { RefreshServerMessage, ScoreServerMessage, UpdateServerMessage } from "../net/net";
import { XY } from "../state";
import { ServerState } from "./server";

export function newGame() {

}

let loopCount = 0;
export function gameLoop(state: ServerState) {

    const timer = state.roundEndTime - Date.now();
    let refresh: RefreshServerMessage | null = null;
    if (timer < 0) {
        state.mode = state.mode == "play" ? "scores" : "play";

        if (state.mode == "play") {
            state.roundEndTime = Date.now() + 20000;
            refresh = {
                type: "refresh",
                maze: state.maze? state.maze.serialise(b=>b?"1":"0") : "",
                timer: timer
            }
            state.paintQueue = [];
        } else {
            state.roundEndTime = Date.now() + 2000;
            state.maze= new Arr(40,40,true);
            state.maze.init((x,y)=> (x % 2 == 1 && y % 2 == 1));
            state.mazeGenerator = maze(state.maze, false, true, 15);
        }
        console.log("MODE", state.mode)
    }

    if (state.mazeGenerator) {
        console.log("GENERATE")
        let result = state.mazeGenerator.next();
        for (let i = 0; i < 100 && !result.done; i++) {
            result = state.mazeGenerator.next();
        }
        if (result.done) {
            state.mazeGenerator = undefined;
        }
    }

    if (refresh) {
        state.clients.forEach(c => {
            if (c.socket.readyState == c.socket.OPEN) {
                c.socket.send(JSON.stringify(refresh));
            }
        });
    }

    if (state.mode == "play") {
        const paint = state.paintQueue.map(p => { return { pos: [p[0],p[1]] as XY, name: p[2] } });
        state.clients.forEach(c => {
            const message: UpdateServerMessage = {
                type: "update",
                timer: timer,
                remotes: state.clients
                    // .filter(r=>r.id !== c.id)
                    .map(r => {
                        return {
                            name: r.id,
                            pos: r.pos,
                            dir: r.dir
                        }
                    }),
                paint
            }
            if (c.socket.readyState == c.socket.OPEN) {
                c.socket.send(JSON.stringify(message));
            }
        });

        if (loopCount++ % 10 == 0) {
            console.table(state.clients.map(c => [c.id, c.pos]));
        }

        state.paintQueue = [];
    } else {
        state.clients.forEach(c => {
            const message: ScoreServerMessage = {
                type: "score",
                scores: state.clients.map(c => { return { player: c.id, score: getScore(state, c.id) } })
            }
            if (c.socket.readyState == c.socket.OPEN) {
                c.socket.send(JSON.stringify(message));
            }
        });
    }

}

function getScore(state: ServerState, player: string): number {
    let count = 0;
    state.paintMap.forEach((x,y,c) => {
        if (c == player) {
            count++;
        }
    });
    return count;
}