import { Arr } from "./arr";

export type Path = [number, number][];

type Option = {
    xy: [number, number],
    dist: number,
    estCost: number,
    parent?: [number, number]
}

export function solve<T>(arr: Arr<T>, isSolid: (T) => boolean, [sx, sy]: [number, number], [tx, ty]: [number, number], placeholder: T, attemptLimt: number = 999999): Path | null {
    // todo we could scan the options Arr for the lowest maybe
    let list: Option[] = [{
        xy: [sx, sy],
        dist: 0,
        estCost: calcCostEst([sx, sy], [tx, ty])
    }];

    const options = new Arr<Option | null>(arr.width, arr.height, null);
    options.setSafe(sx, sy, list[0]);

    let found = false;
    let cur: Option | undefined;

    function evaluate(x: number, y: number, parent: [number, number], curDist: number) {
        const val = arr.getSafe(x, y, placeholder);
        if (val != placeholder) {
            if (!isSolid(val)) {
                let opt = options.getSafe(x, y, null);
                if (opt) {
                    if (opt.dist > curDist + 1) {
                        opt.dist = curDist + 1;
                        opt.parent = parent;
                    }
                } else {
                    const opt: Option = {
                        xy: [x, y],
                        dist: curDist + 1,
                        estCost: calcCostEst([x, y], [tx, ty]),
                        parent: parent
                    }
                    list.push(opt);
                    options.setSafe(x, y, opt);
                }
            }
        }
    }

    while ((cur = list.shift()) != null) {
        if (cur.estCost == 0) {
            // cost == 0 we found it
            found = true;
            continue;
        }
        if(cur.estCost > attemptLimt){
            // our best option is too far away, give up
            //return null;
            // TODO this doesn't work
        }

        // neighbours
        evaluate(cur.xy[0] - 1, cur.xy[1], cur.xy, cur.dist);
        evaluate(cur.xy[0] + 1, cur.xy[1], cur.xy, cur.dist);
        evaluate(cur.xy[0], cur.xy[1] - 1, cur.xy, cur.dist);
        evaluate(cur.xy[0], cur.xy[1] + 1, cur.xy, cur.dist);

        // generally almost-sorted
        list.sort((a, b) => a.estCost - b.estCost);
    }


    // unwind the path
    let pathCur = options.getSafe(tx, ty, null);
    if (found && pathCur) {
        // cur is the end
        const path: Path = [];
        path.push(pathCur.xy);
        while (pathCur && pathCur.parent) {
            path.push(pathCur.parent);
            pathCur = options.getSafe(pathCur.parent[0], pathCur.parent[1], null);
        }
        return path;
    }
    return null;
}



function calcCostEst([sx, sy]: [number, number], [tx, ty]: [number, number]): number {
    // since its a square grid and there's no diagonals
    return Math.abs(sx - tx) + Math.abs(sy - ty);
}