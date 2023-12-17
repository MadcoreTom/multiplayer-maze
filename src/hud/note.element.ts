import { State } from "../state";
import { HudElement } from "./hud.elements";

export class NoteElement extends HudElement {
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