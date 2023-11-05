import { Arr } from "../arr";
import { maze } from "../maze";
import { State, XY } from "../state";
import { Network, ServerMessage } from "./net";


const GAME_TIME = 1000 * 20;

export class SimulatedNetwork implements Network {
    private messages: ServerMessage[] = [];
    private gameTimer: number = Date.now() + GAME_TIME;
    sendUpdate(pos: XY, ddirection: XY): void {
        const timeRemaining = this.gameTimer - Date.now();
        this.messages.push({
            changes: {
                paint: [{
                    pos: [Math.floor(pos[0]), Math.floor(pos[1])],
                    name: "you"
                }]
            },
            timer: timeRemaining
        });
        if (timeRemaining <= 0) {
            this.messages.push({ newGame: { seed: 0 }, timer: GAME_TIME })
            this.gameTimer = Date.now() + 1000 * 20;
        }
    }

    processMessages(state: State) {
        if (this.messages.length > 1) {
            console.log("Messages > 1", this.messages.length)
        }

        let message: ServerMessage | undefined;

        while ((message = this.messages.shift())) {
            if ("changes" in message && message.changes && "paint" in message.changes && message.changes.paint) {
                message.changes.paint.forEach(p => {
                    state.maze.setSafe(Math.floor(p.pos[0]), Math.floor(p.pos[1]), "%");
                });
            }
            if ("newGame" in message && message.newGame) {
                console.log("Nerw Game")
                state.maze = new Arr<string>(40, 40, "?");
                state.maze.init((x, y) =>
                    (x % 2 == 1 && y % 2 == 1) ? "#" : "."
                );
                state.mazeGenerator = maze(state.maze, ".", "#", 20);
            }
            state.gameTimeRemaining = message.timer;
        }
    }

}