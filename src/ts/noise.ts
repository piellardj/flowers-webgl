import { IVector } from "./interfaces";

class Noise {
    private readonly period: number;
    private time: number;

    public last: IVector;
    public next: IVector;

    public constructor(period: number) {
        this.period = period;
        this.time = 0;
        this.last = { x: 0, y: 0 };
        this.next = { x: 0, y: 0 };

        this.last = Noise.randomVector();
        this.next = Noise.randomVector();
    }

    public compute(dt: number): IVector {
        this.time += dt;
        if (this.time > this.period) {
            this.last = this.next;
            this.next = Noise.randomVector();
            this.time = this.time % this.period;
        }

        const r = this.time / this.period;
        return {
            x: this.last.x * (1 - r) + this.next.x * r,
            y: this.last.y * (1 - r) + this.next.y * r,
        };
    }

    public static randomInRange(from: number, to: number): number {
        return from + (to - from) * Math.random();
    }

    private static randomVector(): IVector {
        return { x: Math.random(), y: Math.random() };
    }
}

export { Noise };
