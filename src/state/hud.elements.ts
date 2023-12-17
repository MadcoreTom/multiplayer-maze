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

export class NoteElements extends HudElement {
    public readonly type = "note"
    public constructor(public text: string) {
        super();
    }
    render(state: State, ctx: CanvasRenderingContext2D) {
        ctx.textAlign = "center";
        ctx.font = "bold 18px sans-serif"

        const [x, y] = this.pos;
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.beginPath();
        ctx.roundRect(x - 100, y - 20, 200, 30, 5);
        ctx.fill();
        ctx.fillStyle = "limegreen";
        ctx.fillText(this.text, x, y);
    }
}

export class TimerElement extends HudElement {
    public readonly type = "timer"
    public progress: 0;
    render(state: State, ctx: CanvasRenderingContext2D) {
        const [x, y] = this.pos;
        // shadow
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'; // Adjust alpha for shadow transparency
        // Outline
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(x, y, 45, 0, 2 * Math.PI);
        ctx.lineTo(x, y);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        // progress
        ctx.fillStyle = getColour(state.myId);
        ctx.beginPath();
        ctx.arc(x, y, 40, - Math.PI / 2, 2 * Math.PI * state.gameTimeRemaining - Math.PI / 2, true);
        ctx.lineTo(x, y);
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(y, y, 40, - Math.PI / 2, 2 * Math.PI * state.gameTimeRemaining - Math.PI / 2, false);
        ctx.lineTo(x, y);
        ctx.fill();
    }

    update(state: State) {
        super.update(state);
        if (state.mode != "play") {
            this.target = [-50, -50]
        }
    }
}