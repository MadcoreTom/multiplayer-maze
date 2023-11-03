export class Arr<T>{
    private data: T[] = [];
    public constructor(public readonly width: number, public readonly height: number, defaultVal: T) {
        for (let i = 0; i < width * height; i++) {
            this.data.push(defaultVal);
        }
    }

    public getSafe(x: number, y: number, defaultVal: T): T {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return defaultVal;
        }
        return this.data[this.idx(x, y)];
    }
    public setSafe(x: number, y: number, val: T) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return;
        }
        this.data[this.idx(x, y)] = val;
    }

    public init(generate: (x: number, y: number) => T) {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                this.data[this.idx(x, y)] = generate(x, y);
            }
        }
    }

    public map(generate: (x: number, y: number, cur: T) => T) {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                this.data[this.idx(x, y)] = generate(x, y, this.data[this.idx(x, y)]);
            }
        }
    }
    public forEach(generate: (x: number, y: number, cur: T) => void) {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                generate(x, y, this.data[this.idx(x, y)]);
            }
        }
    }

    private idx(x: number, y: number): number {
        return x * this.height + y;
    }
}