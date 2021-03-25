import "./page-interface-generated";

class Plotter {
    private readonly canvas: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;
    private readonly cssPixel: number;

    public constructor() {
        this.canvas = Page.Canvas.getCanvas();
        this.context = this.canvas.getContext("2d", { alpha: false });
        this.cssPixel = window.devicePixelRatio ?? 1;
    }

    public adjustToCanvas(): void {
        const actualWidth = Math.floor(this.cssPixel * this.canvas.clientWidth);
        const actualHeight = Math.floor(this.cssPixel * this.canvas.clientHeight);

        if (this.canvas.width !== actualWidth || this.canvas.height !== actualHeight) {
            this.canvas.width = actualWidth;
            this.canvas.height = actualHeight;
        }
    }

    public initialize(): void {
        this.context.fillStyle = "red";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

export { Plotter };
