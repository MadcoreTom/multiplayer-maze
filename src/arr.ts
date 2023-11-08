export class Arr<T>{
    private data: T[] = [];
    public constructor(private  width: number, private  height: number, defaultVal: T) {
        for (let i = 0; i < width * height; i++) {
            this.data.push(defaultVal);
        }
    }
    public inBounds(x: number, y: number): boolean {
        return !(x < 0 || x >= this.width || y < 0 || y >= this.height);
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

    public serialise(map:(arg:T)=>string, separator:string = ","):string{
        let result = this.width + separator + this.height + separator;
        result += this.data.map(map).join(separator);
        return result;
    }

    public getHeight():number{
        return this.height;
    }
    public getWidth():number{
        return this.width;
    }

    public deserialise(input:string,parse:(arg:string)=>T, separator:string = ","){
        const parts = input.split(separator);
        const width = parseInt(parts[0]);
        const height = parseInt(parts[1]);
        parts.shift();
        parts.shift();
        const len = width*height;
        if(parts.length == len){
            this.width = width;
            this.height = height;
            this.data = parts.map(parse);
            console.log("Done")
        } else {
            console.log(parts.length , "!=", len)
        }
    }
}