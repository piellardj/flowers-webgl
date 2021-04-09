class Color {
    public readonly r: number; // integer in [0,255]
    public readonly g: number; // integer in [0,255]
    public readonly b: number; // integer in [0,255]

    public readonly rNormalized: number; // in [0,1]
    public readonly gNormalized: number; // in [0,1]
    public readonly bNormalized: number; // in [0,1]

    public constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;

        this.rNormalized = r /255;
        this.gNormalized = g /255;
        this.bNormalized = b /255;
    }

    public toStringRGB(): string {
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }

    /**
     * @param alpha in [0, 1]
     */
    public toStringRGBA(alpha: number): string {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`;
    }
}

export { Color };
