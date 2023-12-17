import { getColour } from "../render";
import { State, XY } from "../state"

export type BaseHudElement = {
    pos: XY,
    vel: XY,
    target: XY,
    anim: {
        time: number,
        target: XY
    }[]
}

export type Note = BaseHudElement & {
    type: "note"
    text: string,
};

export type Timer = BaseHudElement & {
    type: "timer"
    progress: number
};



// export type HudElement = Note | Timer;


export abstract class HudElement {
    pos: XY;
    vel: XY = [0, 0];
    target: XY;
    anim: {
        time: number;
        target: XY
    }[] = [];
    public readonly type: "note" | "timer";
    update(state: State) {
        const delta = [this.target[0] - this.pos[0], this.target[1] - this.pos[1]] as XY;
        delta[0] *= state.delta / 1000;
        delta[1] *= state.delta / 1000;
        this.vel[0] += delta[0];
        this.vel[1] += delta[1];
        this.pos[0] += this.vel[0] * state.delta / 50;
        this.pos[1] += this.vel[1] * state.delta / 50;
        this.vel[0] *= 0.95;
        this.vel[1] *= 0.95;
        if (this.anim.length > 0 && state.time >= this.anim[0].time) {
            this.target = this.anim[0].target;
            this.anim.shift();
        }
    }
    abstract render(state: State, ctx: CanvasRenderingContext2D);
}

