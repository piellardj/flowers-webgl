import { IEllipse, IPoint } from "../interfaces";
import { Line } from "./plotter";
import { PlotterCanvas } from "./plotter-canvas-base";

import "../page-interface-generated";

function ellipsePolyfill(this: CanvasRenderingContext2D, centerX: number, centerY: number, radiusX: number, radiusY: number) {
    this.arc(centerX, centerY, Math.max(radiusX, radiusY), 0, 2 * Math.PI);
}

class PlotterCanvas2D extends PlotterCanvas {
    private readonly context: CanvasRenderingContext2D;

    public constructor() {
        super();
        this.context = this.canvas.getContext("2d", { alpha: false });
    }

    public initialize(backgroundColor: string): void {
        this.context.fillStyle = backgroundColor;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // tslint:disable-next-line no-empty
    public finalize(): void { }

    public drawLines(lines: Line[], color: string): void {
        if (lines.length >= 1) {
            this.context.strokeStyle = color;
            this.context.lineWidth = 1; // do not adapt with cssPixel for performance reasons on mobile devices

            this.context.beginPath();

            for (const line of lines) {
                if (line.length >= 2) {
                    this.context.moveTo(line[0].x * this.cssPixel, line[0].y * this.cssPixel);
                    for (let iP = 1; iP < line.length; iP++) {
                        this.context.lineTo(line[iP].x * this.cssPixel, line[iP].y * this.cssPixel);
                    }
                }
            }

            this.context.stroke();
            this.context.closePath();
        }
    }

    public drawPolygon(polygon: Line, offset: IPoint, strokeColor: string, fillColor: string): void {
        if (polygon.length >= 2) {
            this.context.strokeStyle = strokeColor;
            this.context.fillStyle = fillColor;
            this.context.lineWidth = 1; // do not adapt with cssPixel for performance reasons on mobile devices

            this.context.beginPath();

            this.context.moveTo((polygon[0].x + offset.x) * this.cssPixel, (polygon[0].y + offset.y) * this.cssPixel);

            for (let iP = 1; iP < polygon.length; iP++) {
                this.context.lineTo((polygon[iP].x + offset.x) * this.cssPixel, (polygon[iP].y + offset.y) * this.cssPixel);
            }

            this.context.closePath();
            this.context.fill();
            this.context.stroke();
        }
    }

    public drawEllipsis(ellipsis: IEllipse[], color: string): void {
        this.context.fillStyle = color;

        if (typeof this.context.ellipse !== "function") {
            this.context.ellipse = ellipsePolyfill;
        }

        for (const ellipse of ellipsis) {
            this.context.beginPath();
            this.context.ellipse(ellipse.center.x * this.cssPixel, ellipse.center.y * this.cssPixel, 0.5 * ellipse.width * this.cssPixel, 0.5 * ellipse.height * this.cssPixel, ellipse.orientation, 0, 2 * Math.PI);
            this.context.fill();
            this.context.closePath();
        }
    }
}

export {
    PlotterCanvas2D,
};
