export function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function pickRandomWeighted<T extends { weight: number }>(arr: T[]): T {
    const total = arr.reduce((aggregator, item) => item.weight + aggregator, 0);
    const r = Math.random() * total;
    let sum = 0;
    let i = 0;
    for (; sum < r; i++) {
        sum += arr[i].weight;
    }
    return arr[i - 1];
}