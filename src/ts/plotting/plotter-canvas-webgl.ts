import { IEllipse, IPoint } from "../interfaces";
import { Line } from "./plotter";
import { PlotterCanvas } from "./plotter-canvas-base";

import { gl, initGL } from "../gl-utils/gl-canvas";
import { Shader } from "../gl-utils/shader";
import * as ShaderManager from "../gl-utils/shader-manager";
import { VBO } from "../gl-utils/vbo";

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
    private stemsShader: Shader;
    private readonly stemsVBOId: WebGLBuffer;

    public constructor() {
        super();

        if (!initGL()) {
            throw new Error("Failed to initialize WebGL.");
        }

        this.stemsVBOId = gl.createBuffer();

        ShaderManager.buildShader({
            vertexFilename: "stems.vert",
            fragmentFilename: "stems.frag",
            injected: {},
        }, (builtShader: Shader | null) => {
            if (builtShader === null) {
                const errorMessage = `Failed to load or build the stems shader.`;
                Page.Demopage.setErrorMessage(`shader-stems`, errorMessage);
                throw new Error(errorMessage);
            }
            this.stemsShader = builtShader;
        });
    }

    public initialize(backgroundColor: string): void {
        const rgb = parseRGB(backgroundColor);

        gl.viewport(0, 0, this.width * this.cssPixel, this.height * this.cssPixel);
        gl.clearColor(rgb.r, rgb.g, rgb.b, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    // tslint:disable-next-line no-empty
    public finalize(): void { }

    public drawLines(lines: Line[], color: string): void {
        if (this.stemsShader && lines.length > 0) {
            let totalNbLines = 0;
            for (const line of lines) {
                if (line.length >= 2) {
                    totalNbLines += line.length - 1;
                }
            }

            let i = 0;
            const buffer = new Float32Array(2 * 2 * totalNbLines);
            for (const line of lines) {
                if (line.length >= 2) {
                    buffer[i++] = line[0].x;
                    buffer[i++] = line[0].y;

                    for (let iP = 1; iP < line.length - 1; iP++) {
                        buffer[i++] = line[iP].x;
                        buffer[i++] = line[iP].y;
                        buffer[i++] = line[iP].x;
                        buffer[i++] = line[iP].y;
                    }

                    buffer[i++] = line[line.length - 1].x;
                    buffer[i++] = line[line.length - 1].y;
                }
            }

            const rgb = parseRGB(color);

            this.stemsShader.u["uScreenSize"].value = [this.width, this.height];
            this.stemsShader.u["uColor"].value = [rgb.r, rgb.g, rgb.b, 1];

            this.stemsShader.use();
            this.stemsShader.bindUniforms();

            gl.enableVertexAttribArray(this.stemsShader.a["aVertex"].loc);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.stemsVBOId);
            gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.DYNAMIC_DRAW);
            gl.vertexAttribPointer(this.stemsShader.a["aVertex"].loc, 2, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, 2 * totalNbLines);
        }
    }

    public drawPolygon(polygon: Line, offset: IPoint, strokeColor: string, fillColor: string): void {
    }

    public drawEllipsis(ellipsis: IEllipse[], color: string): void {
    }
}

export {
    PlotterCanvasWebGL,
};
