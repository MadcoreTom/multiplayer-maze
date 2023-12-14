import { pickRandomWeighted } from "./util";

export enum GameModifierType { MAP, PAINT, QUOTA }

export type GameModifierNames = "CAT_MAP" | "EMPTY_MAP" | "HUGE_MAP" | "REGULAR_MAP" | "NO_REPAINT" | "RANDOM_PAINT" | "PAINT_OVER" | "QUOTA_5" | "STARTING_QUOTA"

export const MODIFIERS: { [K in GameModifierNames]?: GameModifier } = {
    "CAT_MAP": { type: [GameModifierType.MAP], weight: 2 },
    "EMPTY_MAP": { type: [GameModifierType.MAP], weight: 1 },
    "HUGE_MAP": { type: [GameModifierType.MAP], weight: 3 },
    "REGULAR_MAP": { type: [GameModifierType.MAP], weight: 10 },
    // PAINT
    "NO_REPAINT": { type: [GameModifierType.PAINT], weight: 5 },
    "RANDOM_PAINT": { type: [GameModifierType.PAINT], weight: 2 },
    "PAINT_OVER": { type: [GameModifierType.PAINT], weight: 10 },
    // QUOTA
    "QUOTA_5": { type: [GameModifierType.QUOTA], weight: 5 }, // not implemented
    "STARTING_QUOTA": { type: [GameModifierType.QUOTA], weight: 5 }, // not implemented
}

export type GameModifier = {
    type: GameModifierType[] // will not be chosen alongside other modifiers of the same type
    weight: number
}

export function pickModifierName(count: number): GameModifierNames[] {
    // add the name to each modifier
    let options = Object.entries(MODIFIERS).map(e => { return { name: e[0] as GameModifierNames, ...e[1] } });
    const modifiers: GameModifierNames[] = [];

    for (let i = count; i > 0 && options.length > 0; i--) {
        // pick a random one and add it
        const cur = pickRandomWeighted(options);
        modifiers.push(cur.name);

        // remove those of the same type
        options = options.filter(o => o.type != cur.type);
    }

    return modifiers;
}