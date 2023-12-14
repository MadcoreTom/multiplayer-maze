import { Arr } from "../arr";
import { pickModifierName } from "../common/modifiers";
import { maze } from "../maze";
import { RefreshServerMessage, ScoreServerMessage, ServerMessage, UpdateServerMessage } from "../net/net";
import { XY } from "../state";
import { Client, ServerState } from "../state/common.state";

export function newGame() {

}

const GAME_TIME = 20_000;
const SCORE_TIME = 3_000;

const CAT_MAP = ["17,17,",
".................",
".#...............",
".#...............",
".###.........###.",
".####.......####.",
"..####.....####..",
"...###########...",
"...###########...",
"...#..#####..#...",
"...##..###..##...",
"...###########...",
"....####.####....",
".....##.#.##.....",
"......#####......",
".................",
".................",
".................",
].join("");

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
                maze: state.maze ? state.maze.serialise(b => b) : "",
                timer: timer,
                modifiers: [...state.modifiers.keys()]
            }
            state.paintQueue = [];
        } else {
            state.sendScores = true;
            state.roundEndTime = Date.now() + SCORE_TIME;
            let size = 14 + 4 * state.players.length;
            state.modifiers = new Set(pickModifierName(Math.floor(Math.random() * 2) + 1));
            if (state.modifiers.has("CAT_MAP")) {
                state.maze = new Arr(17, 17, "?");
                state.maze.deserialise(CAT_MAP, arg => arg);
            } else if (state.modifiers.has("EMPTY_MAP")) {
                state.maze = new Arr(size, size, "?");
                state.maze.init((x, y) => "#");
            } else {
                if(state.modifiers.has("HUGE_MAP")){
                    size *= 2;
                }
                state.maze = new Arr(size, size, "?");
                state.maze.init((x, y) => (x % 2 == 1 && y % 2 == 1) ? "#" : ".");
                state.mazeGenerator = maze(state.maze, ".", "#", 15);
            }
            state.players.forEach(p => p.score = 0)
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
                !refresh || sendMessage(c, refresh);
                c.firstRefresh = false;
            }
        });
    }
    if (state.mode == "play") {
        state.players.filter(p => p.firstRefresh).forEach(c => {
            sendMessage(c, {
                type: "refresh",
                maze: state.maze ? state.maze.serialise(b => b) : "",
                timer: timer,
                modifiers: [...state.modifiers.keys()]
            });
            c.firstRefresh = false;
        })
    }

    if (state.mode == "play") {
        const paint = state.paintQueue.map(p => { return { pos: [p[0], p[1]] as XY, name: p[2] } });
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
                sendMessage(c, message);
            }
        });

        if (loopCount++ % 100 == 0) {
            console.log("PLAYERS", state.players.length);
        }

        state.paintQueue = [];
    } else if (state.sendScores){
        state.players.forEach(c => {
            const message: ScoreServerMessage = {
                type: "score",
                scores: state.players.map(c => { return { player: c.id, score: getScore(state, c.id) } })
            }
            if (c.socket.readyState == c.socket.OPEN) {
                sendMessage(c, message);
            }
        });
        state.sendScores = false;
    }

    // drop players who haven't sent a message for a while
    const exp = Date.now() - SCORE_TIME * 1.2;
    const toDropIds = state.players.filter(p => p.lastMessage < exp).map(p => p.id);
    if (toDropIds.length > 0) {
        console.warn("Dropping inactive players", toDropIds);
        state.players.filter(p => toDropIds.indexOf(p.id) >= 0).forEach(p => p.socket.close());
        state.players = state.players.filter(p => toDropIds.indexOf(p.id) < 0);
    }

}

function getScore(state: ServerState, player: string): number {
    let count = 0;
    state.maze.forEach((x, y, c) => {
        if (c == player) {
            count++;
        }
    });
    return count;
}

function sendMessage(client: Client, message: ServerMessage) {
    client.socket.send(JSON.stringify(message));
}