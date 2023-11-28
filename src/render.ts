import { MAZE_SIZE } from "./constants";
import { State } from "./state";

const SCALE = Math.floor(1000 / MAZE_SIZE);

function mod(n:number,m:number):number{
    return ((n % m)+m)%m;
}

export function render(ctx: CanvasRenderingContext2D, state: State) {
    const { maze, offset } = state;
    ctx.fillStyle = "grey";
    ctx.fillRect(0, 0, 1000, 1000);

    // const smallOffset = [offset[0]%1, offset[1]%1];
    const smallOffset = [mod(offset[0],1), mod(offset[1],1)];
    const tileOffset = [Math.floor(offset[0]),Math.floor(offset[1])];
    for(let x = 0; x<maze.getWidth();x++){
        for(let y=0;y<maze.getHeight();y++){
            // const xx = (x + tileOffset[0] + maze.getWidth()) % maze.getWidth();
            const v = maze.getSafe(
                (x+tileOffset[0] + maze.getWidth()) % maze.getWidth(),
                (y+tileOffset[1] + maze.getHeight()) % maze.getHeight(),
                '#');
            ctx.fillStyle = getColour(v);
            ctx.fillRect(Math.round((x - smallOffset[0]) * SCALE), Math.round((y - smallOffset[1]) * SCALE), SCALE, SCALE);
        }
    }


    ctx.fillStyle = "orangered";
    ctx.beginPath();
    ctx.arc((state.pos[0] - state.offset[0]) * SCALE, (state.pos[1] - state.offset[1]) * SCALE, SCALE * 0.6 * 0.5, 0, 2 * Math.PI);
    ctx.fill();


    // timer
    ctx.font = "small-caps bold 40px monospace";
    ctx.fillStyle = "black";
    ctx.fillText("Timer: " + Math.floor(state.gameTimeRemaining/100)/10, 10,30+2);
    ctx.fillStyle = "yellow";
    ctx.fillText("Timer: " + Math.floor(state.gameTimeRemaining/100)/10, 10,30);

    // remote players
    ctx.strokeStyle = "blue";
    state.players.forEach(r=>{
        /*
        ctx.beginPath();
        
        ctx.arc(mod(r.estPos[0] - state.offset[0],maze.getWidth()) * SCALE, mod(r.estPos[1] - state.offset[1],maze.getHeight()) * SCALE, SCALE * 0.6 * 0.5, 0, 2 * Math.PI);
        // ctx.arc((r.pos[0] - state.offset[0]) * SCALE, (r.pos[1] - state.offset[1]) * SCALE, SCALE * 0.6 * 0.5, 0, 2 * Math.PI);
        ctx.arc((r.pos[0] - state.offset[0]) * SCALE, (r.pos[1] - state.offset[1]) * SCALE, SCALE * 0.6 * 0.5*0.5, 0, 2 * Math.PI);
        ctx.stroke();
        */
       
        // use r.pos to show last know position instead of estimated pos
        ctx.fillStyle = getColour(r.id);
        ctx.beginPath();
        ctx.arc(mod(r.estPos[0] - state.offset[0],maze.getWidth()) * SCALE, mod(r.estPos[1] - state.offset[1],maze.getHeight()) * SCALE, SCALE * 0.6 * 0.5, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc((r.estPos[0] - state.offset[0]) * SCALE, (r.estPos[1] - state.offset[1]) * SCALE, SCALE * 0.6 * 0.5*0.5, 0, 2 * Math.PI);
        ctx.fill();
    });

    // scores
    if(state.mode == "scores"){
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.beginPath();
        ctx.roundRect(100,100,800,800, 20);
        ctx.fill();

        ctx.fillStyle = "yellow";
        ctx.font = "bold 48px sans-serif"
        state.players.forEach((p,i)=>{
            ctx.fillStyle = getColour(p.id);
            ctx.fillText(`${p.id}:\t${p.score}`, 500, 200 + i*50);
        });
    }
}

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


function getColour(key:string):string{
    let a = colours[key];
    if(!a){
        a = `hsl(${Math.floor(Math.random() * 360)}, 50%, 80%)`;
        colours[key]=a;
    }
    return a;
}