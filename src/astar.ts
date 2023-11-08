import { Arr } from "./arr";

export type Path = [number, number][];

type Option = {
    xy: [number, number],
    dist: number,
    estCost: number,
    parent?: [number, number]
}

export function solve<T>(arr: Arr<T>, isSolid: (t:T) => boolean, [sx, sy]: [number, number], [tx, ty]: [number, number], placeholder: T, attemptLimit: number = 999999): Path | undefined {
    // todo we could scan the options Arr for the lowest maybe
    const wh: [number, number] = [arr.getWidth(), arr.getHeight()]
    let list: Option[] = [{
        xy: [sx, sy],
        dist: 0,
        estCost: calcCostEst([sx, sy], [tx, ty], wh)
    }];

    const options = new Arr<Option | null>(arr.getWidth(), arr.getHeight(), null);
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
                        estCost: calcCostEst([x, y], [tx, ty], wh),
                        parent: parent
                    }
                    list.push(opt);
                    options.setSafe(x, y, opt);
                }
            }
        }
    }

    while (!found && (cur = list.shift()) != null) {
        if (cur.xy[0] == tx && cur.xy[1] == ty) {
            // cost == 0 we found it
            found = true;
        }
        if (cur.dist + cur.estCost > attemptLimit * attemptLimit * 0.5) {
            // our best option is too far away, give up
            return;
        }

        // neighbours
        evaluate((cur.xy[0] - 1 + arr.getWidth()) % arr.getWidth(), cur.xy[1], cur.xy, cur.dist);
        evaluate((cur.xy[0] + 1) % arr.getWidth(), cur.xy[1], cur.xy, cur.dist);
        evaluate(cur.xy[0], (cur.xy[1] - 1 + arr.getHeight()) % arr.getHeight(), cur.xy, cur.dist);
        evaluate(cur.xy[0], (cur.xy[1] + 1) % arr.getHeight(), cur.xy, cur.dist);

        // generally almost-sorted
        list.sort((a, b) => (a.dist + a.estCost) - (b.dist + b.estCost));
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
    return;
}



function calcCostEst([sx, sy]: [number, number], [tx, ty]: [number, number], [w, h]: [number, number]): number {
    // Wrapping euclidean distance
    const dx = Math.abs(sx - tx) < w / 2 ? (sx - tx) : w - Math.abs(sx - tx);
    const dy = Math.abs(sy - ty) < h / 2 ? (sy - ty) : h - Math.abs(sy - ty);
    return dx * dx + dy * dy;
}