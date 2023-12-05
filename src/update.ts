import { moveAndTestCollision } from "./collision";
import { MAZE_SIZE } from "./constants";
import { ControlKey, keyDown } from "./controls";
import { maze } from "./maze";
import { State, XY } from "./state";

const STEPS_PER_FRAME = 10;
const MAX_DISTANCE = 9;
const MOVE_SPEED = 0.011;

export function update(state: State) {

    const dir = move(state);
    state.offset[0] = state.pos[0] - MAZE_SIZE / 2;
    state.offset[1] = state.pos[1] - MAZE_SIZE / 2;
    if(dir && state.mode == "play"){
        state.server.sendUpdate(state.pos, dir);
    }

    state.server.processMessages(state);

    // set remote player state
    state.players.forEach(r=>{
        const move:XY = [
            (state.time - r.lastTime) * MOVE_SPEED * r.dir[0],
            (state.time - r.lastTime) * MOVE_SPEED * r.dir[1]
        ];
        moveAndTestCollision(state, r.pos, move, 0.3,
            (s, p) => s.maze.getSafe(wrap(p[0], 0, s.maze.getWidth()), wrap(p[1], 0, s.maze.getHeight()), "?") == ".",
            result =>  r.estPos = result
        );
    });

    if(state.mode == "play"){
        state.overlayPos = Math.max(0,state.overlayPos - state.delta * 0.003)
    } else {
        state.overlayPos = Math.min(1,state.overlayPos + state.delta * 0.003)
    }
}

function move(state: State) : XY | undefined{
    const { pos, delta } = state;
    const move: XY = [0, 0];
    if (keyDown(ControlKey.LEFT)) {
        move[0] = -1;
    }
    if (keyDown(ControlKey.RIGHT)) {
        move[0] = 1;
    }
    if (keyDown(ControlKey.UP)) {
        move[1] = -1;
    }
    if (keyDown(ControlKey.DOWN)) {
        move[1] = 1;
    }
    if (move[0] != 0 && move[1] != 0) {
        move[0] /= Math.SQRT2;
        move[1] /= Math.SQRT2;
    }
    const direction = [...move] as XY;
    move[0] *= delta * MOVE_SPEED;
    move[1] *= delta * MOVE_SPEED;

    let retVal: XY | undefined = undefined;
    moveAndTestCollision(state, pos, move, 0.3,
        (s, p) => s.maze.getSafe(wrap(p[0], 0, s.maze.getWidth()), wrap(p[1], 0, s.maze.getHeight()), "?") == ".",
        result => { state.pos = result; retVal = direction }
    );

    state.pos[0] = wrap(state.pos[0], 0, state.maze.getWidth());
    state.pos[1] = wrap(state.pos[1], 0, state.maze.getHeight());

    return retVal;
}

function wrap(val: number, low: number, high: number): number {
    if (val < low) {
        return (val % (high - low) + high - low) % (high - low);
    } else if (val >= high) {
        return val % (high - low);
    }
    return val;
}