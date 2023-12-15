import { MAZE_SIZE } from "./constants";
import { State } from "./state";

const SCALE = Math.floor(1000 / MAZE_SIZE);

function mod(n: number, m: number): number {
    return ((n % m) + m) % m;
}

export function render(ctx: CanvasRenderingContext2D, state: State) {
    const { maze, offset } = state;
    ctx.fillStyle = "grey";
    ctx.fillRect(0, 0, 1000, 1000);

    // const smallOffset = [offset[0]%1, offset[1]%1];
    const smallOffset = [mod(offset[0], 1), mod(offset[1], 1)];
    const tileOffset = [Math.floor(offset[0]), Math.floor(offset[1])];
    for (let x = 0; x < 1000 / SCALE + 1; x++) {
        for (let y = 0; y < 1000 / SCALE + 1; y++) {
            // const xx = (x + tileOffset[0] + maze.getWidth()) % maze.getWidth();
            const v = maze.getSafe(
                (x + tileOffset[0] + maze.getWidth()) % maze.getWidth(),
                (y + tileOffset[1] + maze.getHeight()) % maze.getHeight(),
                '#');
            ctx.fillStyle = getColour(v);
            ctx.fillRect(Math.round((x - smallOffset[0]) * SCALE), Math.round((y - smallOffset[1]) * SCALE), SCALE, SCALE);
        }
    }



    if (state.mode == "play") {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(50, 50, 45, 0, 2 * Math.PI);
        ctx.lineTo(50, 50);
        ctx.fill();
        ctx.fillStyle = getColour(state.myId);
        ctx.beginPath();
        ctx.arc(50, 50, 40, - Math.PI / 2, 2 * Math.PI * state.gameTimeRemaining - Math.PI / 2, true);
        ctx.lineTo(50, 50);
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(50, 50, 40, - Math.PI / 2, 2 * Math.PI * state.gameTimeRemaining - Math.PI / 2, false);
        ctx.lineTo(50, 50);
        ctx.fill();
    }

    // Player icons
    state.players.forEach((r, i) => {
        ctx.fillStyle = getColour(r.id);
        ctx.beginPath();
        const radius = SCALE * 0.6 * 0.5 * (r.id == state.myId ? 1 : 0.5);
        ctx.arc(1000 - (i + 0.5) * SCALE, 0.6 * SCALE, radius, 0, 2 * Math.PI);
        ctx.fill();
    });

    // remote players
    ctx.strokeStyle = "blue";
    state.players.forEach(r => {

        let pos = r.id == state.myId ? state.pos : r.estPos;

        // use r.pos to show last know position instead of estimated pos
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.beginPath();
        ctx.arc(mod(pos[0] - state.offset[0], maze.getWidth()) * SCALE, mod(pos[1] - state.offset[1], maze.getHeight()) * SCALE, SCALE * 0.6 * 0.5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = getColour(r.id);
        ctx.beginPath();
        ctx.arc(mod(pos[0] - state.offset[0], maze.getWidth()) * SCALE, mod(pos[1] - state.offset[1], maze.getHeight()) * SCALE, SCALE * 0.6 * 0.5 * 0.5, 0, 2 * Math.PI);
        ctx.fill();
    });


    if (state.overlayPos > 0) {
        ctx.fillStyle = `rgba(255,255,255,${state.overlayPos * 0.9})`;
        if (state.overlayPos < 1) {
            // top left
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(1000 * state.overlayPos, 0);
            ctx.lineTo(0, 1000 * state.overlayPos);
            ctx.fill();
            // bottom right
            ctx.beginPath();
            ctx.moveTo(1000, 1000);
            ctx.lineTo(1000 - 1000 * state.overlayPos, 1000);
            ctx.lineTo(1000, 1000 - 1000 * state.overlayPos);
            ctx.fill();
        } else {
            ctx.fillRect(0, 0, 1000, 1000);
        }
    }

    // scores
    if (state.mode == "scores") {
        renderScores(ctx, state);
    }

    if(!state.server.connected()){
        
        ctx.font = "bold 24px sans-serif"
        ctx.fillStyle = "red";
        ctx.fillText("DISCONNECTED", 450, 400+2);
        ctx.fillStyle = "yellow";
        ctx.fillText("DISCONNECTED", 450, 400);
        ctx.font = "bold 48px sans-serif"
    }

    // TMP
    ctx.textAlign = "center";
    ctx.font = "bold 18px sans-serif"
    // const modifierColour = [colours.A, colours.B, colours.C][Math.floor((state.time / 500)%3)]
    // for(let i=0;i<state.modifiers.size;i++){
    //     const y = 1000 - 50 - 40*i;
    //     ctx.fillStyle = "rgba(0,0,0,0.8)";
    //     ctx.beginPath();
    //     ctx.roundRect(500-100, y - 20, 200, 30, 5);
    //     ctx.fill();
    //     ctx.fillStyle = modifierColour;
    //     ctx.fillText([...state.modifiers.keys()][i], 500, y);
    // }

    state.notes.forEach(n=>{
        const [x,y] = n.pos;
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.beginPath();
        ctx.roundRect(x-100, y - 20, 200, 30, 5);
        ctx.fill();
        ctx.fillStyle = "limegreen";
        ctx.fillText(n.text, x, y);
    })
}

function renderScores(ctx: CanvasRenderingContext2D, state: State) {
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("Round Over", 500, 50);

    // TODO do this once, not every frame
    const scores = state.players.map(p => {
        return {
            colour: getColour(p.id),
            score: p.score,
            isYou: p.id == state.myId,
        };
    }).sort((a, b) => b.score - a.score);

    scores.forEach((p, i) => {
        let shadow = "black";
        const y = 200 + i * 50;
        if (p.isYou) {
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.roundRect(350, y - 40, 300, 50, 5);
            ctx.fill();
            shadow = "white"
        }
        const nth = NTH[i];
        if (nth) {
            ctx.font = "bold 24px sans-serif"
            ctx.fillStyle = shadow;
            ctx.fillText(nth, 450, y - 10 + 2);
            ctx.fillStyle = p.colour;
            ctx.fillText(nth, 450, y - 10);
            ctx.font = "bold 48px sans-serif"
        }

        ctx.fillStyle = shadow;
        ctx.fillText("" + p.score, 550, y + 2);
        ctx.fillStyle = p.colour;
        ctx.fillText("" + p.score, 550, y);
    });
}

const NTH = ["1st", "2nd", "3rd"]

// TODO use https://lospec.com/palette-list/r-place-2022-day2
const colours: { [id: string]: string } = {
    ".": "#060606",
    "#": "#f2f2f2",
    "0": "#b44ac0",
    "1": "#009eaa",
    "2": "#ff99aa",
    "3": "#ffd635",
    "4": "#493ac1",
    "5": "#2450a4",
    "6": "#ff4500",
    "7": "#7eed56",
    "8": "#51e9f4",
    "9": "#00a368",
    "A": "#00cc78",
    "B": "#ffa800",
    "C": "#6a5cff",
    "D": "#00756f",
    "E": "#be0039",
    "F": "#811e9f"
};


function getColour(key: string): string {
    let a = colours[key];
    if (!a) {
        a = `hsl(${Math.floor(Math.random() * 360)}, 50%, 80%)`;
        colours[key] = a;
    }
    return a;
}