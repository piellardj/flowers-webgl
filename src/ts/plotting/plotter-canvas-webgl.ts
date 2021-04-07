import { IEllipse, IPoint } from "../interfaces";
import { Line } from "./plotter";
import { PlotterCanvas } from "./plotter-canvas-base";
import { gl, initGL } from "../gl-utils/gl-canvas";

import "../page-interface-generated";


class PlotterCanvasWebGL extends PlotterCanvas {
    private readonly context: CanvasRenderingContext2D;

    public constructor() {
        super();

        if (!initGL()) {
            throw new Error("Failed to initialize WebGL.");
        }
    }

    public initialize(backgroundColor: string): void {
        const redHex = backgroundColor.substring(1, 3);
        const greenHex = backgroundColor.substring(3, 5);
        const blueHex = backgroundColor.substring(5, 7);

        const r = parseInt(redHex, 16);
        const g = parseInt(greenHex, 16);
        const b = parseInt(blueHex, 16);

        gl.clearColor(r / 255, g / 255, b / 255, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    // tslint:disable-next-line no-empty
    public finalize(): void { }

    public drawLines(lines: Line[], color: string): void {
    }

    public drawPolygon(polygon: Line, offset: IPoint, strokeColor: string, fillColor: string): void {
    }

    public drawEllipsis(ellipsis: IEllipse[], color: string): void {
    }
}

export {
    PlotterCanvasWebGL,
};
