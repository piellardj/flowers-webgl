import { Plotter } from "./plotter";

import "../page-interface-generated";


abstract class PlotterCanvas extends Plotter {
    protected readonly canvas: HTMLCanvasElement;
    protected readonly cssPixel: number;

    public _width: number;
    public _height: number;

    public constructor() {
        super();

        this.canvas = Page.Canvas.getCanvas();
        this.cssPixel = window.devicePixelRatio ?? 1;
        this.adjustToCanvas();
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

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }
}

export {
    PlotterCanvas,
};

