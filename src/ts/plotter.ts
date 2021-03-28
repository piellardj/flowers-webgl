import { IPoint } from "./interfaces";
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
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public drawLine(points: IPoint[]): void {
        if (points.length < 2) {
            return;
        }

        this.context.strokeStyle = "#00FF00";
        this.context.lineWidth = 2 * this.cssPixel;
        this.context.beginPath();
        this.context.moveTo(points[0].x * this.cssPixel, points[0].y * this.cssPixel);
        for (const point of points) {
            this.context.lineTo(point.x * this.cssPixel, point.y * this.cssPixel);
        }
        this.context.stroke();
        this.context.closePath();
    }
}

export { Plotter };
