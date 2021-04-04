import { IPoint } from "./interfaces";

import "./page-interface-generated";

class Plotter {
    private readonly canvas: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;
    private readonly cssPixel: number;

    private _width: number;
    private _height: number;

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

        this._width = this.canvas.clientWidth;
        this._height = this.canvas.clientHeight;
    }

    public initialize(): void {
        this.context.fillStyle = "#DCEEFF";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public drawLine(points: IPoint[], closed: boolean = false): void {
        if (points.length < 2) {
            return;
        }

        this.context.strokeStyle = "black";
        this.context.fillStyle = "#DCEEFF";
        this.context.lineWidth = 1 * this.cssPixel;
        this.context.beginPath();
        this.context.moveTo(points[0].x * this.cssPixel, points[0].y * this.cssPixel);
        for (const point of points) {
            this.context.lineTo(point.x * this.cssPixel, point.y * this.cssPixel);
        }

        if (closed) {
            this.context.fill();
            this.context.closePath();
            this.context.stroke();
        } else {
            this.context.stroke();
            this.context.closePath();
        }
    }

    public drawEllipsis(center: IPoint, radiusX: number, radiusY: number, orientation: number, color: string): void {
        this.context.fillStyle = color;
        this.context.beginPath();
        this.context.ellipse(center.x * this.cssPixel, center.y * this.cssPixel, radiusX * this.cssPixel, radiusY * this.cssPixel, orientation, 0, 2 * Math.PI);
        this.context.fill();
        this.context.closePath();
    }

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }
}

export { Plotter };
