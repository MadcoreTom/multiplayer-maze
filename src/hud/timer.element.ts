import { getColour } from "../render";
import { State } from "../state";
import { HudElement } from "./hud.elements";

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