import { pickRandomWeighted } from "./util";

export enum GameModifierType {
    MAP,
    PAINT,
    QUOTA
}


export type GameModifier = {
    name: string,
    type: GameModifierType[] // wil not be chosen alongside other modifiers of the same type
    weight: number
}

export const MODIFIERS: GameModifier[] = [
    // MAP
    { name: "CAT_MAP", type: [GameModifierType.MAP], weight: 2 },
    { name: "EMPTY_MAP", type: [GameModifierType.MAP], weight: 1 },
    { name: "HUGE_MAP", type: [GameModifierType.MAP], weight: 3 },
    { name: "REGULAR_MAP", type: [GameModifierType.MAP], weight: 10 },
    // PAINT
    { name: "NO_REPAINT", type: [GameModifierType.PAINT], weight: 5 },
    { name: "RANDOM_PAINT", type: [GameModifierType.PAINT], weight: 2 },
    { name: "PAINT_OVER", type: [GameModifierType.PAINT], weight: 10 },
    // QUOTA
    { name: "QUOTA_5", type: [GameModifierType.QUOTA], weight: 5 },
    { name: "STARTING_QUOTA", type: [GameModifierType.QUOTA], weight: 5 },
]

export function pickModifiers(count: number): GameModifier[] {
    let options = [...MODIFIERS];
    const modifiers: GameModifier[] = [];

    for (let i = count; i > 0 && options.length > 0; i--) {
        // pick a random one and add it
        const cur = pickRandomWeighted(options);
        modifiers.push(cur);

        // remove those of the same type
        options = options.filter(o => o.type != cur.type);
    }

    return modifiers;
}