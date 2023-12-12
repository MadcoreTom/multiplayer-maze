import { Arr } from "../arr";
import { maze } from "../maze";
import { RefreshServerMessage, ScoreServerMessage, UpdateServerMessage } from "../net/net";
import { XY } from "../state";
import { ServerState } from "../state/common.state";

export function newGame() {

}

const GAME_TIME = 20_000;
const SCORE_TIME = 3_000;

let loopCount = 0;
export function gameLoop(state: ServerState) {

    const timer = state.roundEndTime - Date.now();
    let refresh: RefreshServerMessage | null = null;
    if (timer < 0) {
        state.mode = state.mode == "play" ? "scores" : "play";

        if (state.mode == "play") {
            state.roundEndTime = Date.now() + GAME_TIME;
            refresh = {
                type: "refresh",
                maze: state.maze? state.maze.serialise(b=>b) : "",
                timer: timer
            }
            state.paintQueue = [];
        } else {
            state.roundEndTime = Date.now() + SCORE_TIME;
            const size = 14 + 4 * state.players.length;
            state.maze= new Arr(size,size,"?");
            state.maze.init((x,y)=> (x % 2 == 1 && y % 2 == 1) ? "#" : ".");
            state.mazeGenerator = maze(state.maze, ".", "#", 15);
            state.players.forEach(p=>p.score=0)
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
        state.players.forEach(c => {
            if (c.socket.readyState == c.socket.OPEN) {
                c.socket.send(JSON.stringify(refresh));
                c.firstRefresh = false;
            }
        });
    }
    if(state.mode == "play"){
        state.players.filter(p=>p.firstRefresh).forEach(c=>{
            c.socket.send(JSON.stringify({
                type: "refresh",
                maze: state.maze? state.maze.serialise(b=>b) : "",
                timer: timer
            }));
            c.firstRefresh = false;
        })
    }

    if (state.mode == "play") {
        const paint = state.paintQueue.map(p => { return { pos: [p[0],p[1]] as XY, name: p[2] } });
        state.players.forEach(c => {
            const message: UpdateServerMessage = {
                type: "update",
                timer: timer / GAME_TIME,
                remotes: state.players
                    // .filter(r=>r.id !== c.id)
                    .map(r => {
                        return {
                            id: r.id,
                            pos: r.pos,
                            dir: r.dir,
                            score: r.score
                        }
                    }),
                paint
            }
            if (c.socket.readyState == c.socket.OPEN) {
                c.socket.send(JSON.stringify(message));
            }
        });

        if (loopCount++ % 100 == 0) {
            console.table(state.players.map(c => [c.id, c.pos, c.score]));
        }

        state.paintQueue = [];
    } else {
        state.players.forEach(c => {
            const message: ScoreServerMessage = {
                type: "score",
                scores: state.players.map(c => { return { player: c.id, score: getScore(state, c.id) } })
            }
            if (c.socket.readyState == c.socket.OPEN) {
                c.socket.send(JSON.stringify(message));
            }
        });
    }

    // drop players who haven't sent a message for a while
    const exp = Date.now() - SCORE_TIME * 1.2;
    const toDropIds = state.players.filter(p=>p.lastMessage < exp).map(p=>p.id);
    if(toDropIds.length > 0){
        console.warn("Dropping inactive players", toDropIds);
        state.players.filter(p=>toDropIds.indexOf(p.id) >= 0).forEach(p=>p.socket.close());
        state.players = state.players.filter(p=>toDropIds.indexOf(p.id) < 0);
    }

}

function getScore(state: ServerState, player: string): number {
    let count = 0;
    state.maze.forEach((x,y,c) => {
        if (c == player) {
            count++;
        }
    });
    return count;
}