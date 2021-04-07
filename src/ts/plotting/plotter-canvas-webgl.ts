import { IEllipse, IPoint } from "../interfaces";
import { Line } from "./plotter";
import { PlotterCanvas } from "./plotter-canvas-base";
import { gl, initGL } from "../gl-utils/gl-canvas";

import "../page-interface-generated";


interface IRGB {
    r: number; // in [0, 1]
    g: number; // in [0, 1]
    b: number; // in [0, 1]
}

function parseRGB(hexaColor: string): IRGB {
    const redHex = hexaColor.substring(1, 3);
    const greenHex = hexaColor.substring(3, 5);
    const blueHex = hexaColor.substring(5, 7);

    return {
        r: parseInt(redHex, 16) / 255,
        g: parseInt(greenHex, 16) / 255,
        b: parseInt(blueHex, 16) / 255,
    };
}

class PlotterCanvasWebGL extends PlotterCanvas {
    private readonly context: CanvasRenderingContext2D;

    public constructor() {
        super();

        if (!initGL()) {
            throw new Error("Failed to initialize WebGL.");
        }
    }

    public initialize(backgroundColor: string): void {
        const rgb = parseRGB(backgroundColor);

        gl.viewport(0, 0, this.width, this.height);
        gl.clearColor(rgb.r, rgb.g, rgb.b, 1);
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
