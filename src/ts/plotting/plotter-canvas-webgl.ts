import { IEllipse, IPoint } from "../interfaces";
import { Line } from "./plotter";
import { PlotterCanvas } from "./plotter-canvas-base";

import { gl, initGL } from "../gl-utils/gl-canvas";
import { Shader } from "../gl-utils/shader";
import * as ShaderManager from "../gl-utils/shader-manager";

import "../page-interface-generated";


interface IRGB {
    r: number; // in [0, 1]
    g: number; // in [0, 1]
    b: number; // in [0, 1]
}

interface IEllipseBatch {
    ellipseList: IEllipse[];
    color: IRGB;
    // depth: number;
}

interface IPolygon {
    outline: IPoint[];
    center: IPoint;
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

    private petalsShader: Shader;
    private readonly petalsVBOId: WebGLBuffer;

    private corollaShader: Shader;
    private readonly corollaVBOId: WebGLBuffer;
    private readonly corollaIndexVBOId: WebGLBuffer;

    private ellipseBatches: IEllipseBatch[];
    private polygonsBatch: IPolygon[];

    public constructor() {
        super();

        if (!initGL()) {
            throw new Error("Failed to initialize WebGL.");
        }
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        this.stemsVBOId = gl.createBuffer();
        this.petalsVBOId = gl.createBuffer();
        this.corollaVBOId = gl.createBuffer();
        this.corollaIndexVBOId = gl.createBuffer();

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

        ShaderManager.buildShader({
            vertexFilename: "petals.vert",
            fragmentFilename: "petals.frag",
            injected: {},
        }, (builtShader: Shader | null) => {
            if (builtShader === null) {
                const errorMessage = `Failed to load or build the petals shader.`;
                Page.Demopage.setErrorMessage(`shader-petals`, errorMessage);
                throw new Error(errorMessage);
            }
            this.petalsShader = builtShader;
        });

        ShaderManager.buildShader({
            vertexFilename: "corolla.vert",
            fragmentFilename: "corolla.frag",
            injected: {},
        }, (builtShader: Shader | null) => {
            if (builtShader === null) {
                const errorMessage = `Failed to load or build the corolla shader.`;
                Page.Demopage.setErrorMessage(`shader-corolla`, errorMessage);
                throw new Error(errorMessage);
            }
            this.corollaShader = builtShader;
        });
    }

    public initialize(backgroundColor: string): void {
        const rgb = parseRGB(backgroundColor);

        gl.viewport(0, 0, this.width * this.cssPixel, this.height * this.cssPixel);
        gl.clearColor(rgb.r, rgb.g, rgb.b, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.ellipseBatches = [];
        this.polygonsBatch = [];
    }

    // tslint:disable-next-line no-empty
    public finalize(): void {
        this.drawPolygonsBatch();
        this.polygonsBatch = [];

        // this.drawEllipseBatches();
        this.ellipseBatches = [];
    }

    public drawLines(lines: Line[], color: string): void {
        if (this.stemsShader && lines.length > 0) {
            let totalNbLines = 0;
            for (const line of lines) {
                if (line.length >= 2) {
                    totalNbLines += line.length - 1;
                }
            }

            const buffer = new Float32Array(2 * 2 * totalNbLines);
            let i = 0;
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

            gl.bindBuffer(gl.ARRAY_BUFFER, this.stemsVBOId);
            gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.DYNAMIC_DRAW);
            const aVertexLoc = this.stemsShader.a["aVertex"].loc;
            gl.enableVertexAttribArray(aVertexLoc);
            gl.vertexAttribPointer(aVertexLoc, 2, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, 2 * totalNbLines);
        }
    }

    public drawPolygon(polygon: Line, offset: IPoint, strokeColor: string, fillColor: string): void {
        const line: IPoint[] = [];
        for (const point of polygon) {
            line.push({
                x: point.x + offset.x,
                y: point.y + offset.y,
            });
        }

        this.polygonsBatch.push({
            outline: line,
            center: offset,
        })
    }

    public drawEllipsis(ellipsis: IEllipse[], color: string): void {
        const substring = color.substring(5, color.length - 1);
        const channelsAsString = substring.split(", ");
        const colorRgb: IRGB = {
            r: +channelsAsString[0] / 255,
            g: +channelsAsString[1] / 255,
            b: +channelsAsString[2] / 255,
        };

        this.ellipseBatches.push({
            ellipseList: ellipsis,
            color: colorRgb,
        });
    }

    private drawPolygonsBatch(): void {
        if (this.corollaShader && this.polygonsBatch.length > 0) {
            let totalNbVertices = 0;
            let totalNbTriangles = 0;
            let totalNbLines = 0;
            for (const polygon of this.polygonsBatch) {
                totalNbVertices += 1 + polygon.outline.length;
                totalNbTriangles += polygon.outline.length;
                totalNbLines += polygon.outline.length;
            }

            let iVertice = 0;
            let iPolygon = 0;
            const verticesBuffer = new Float32Array(4 * totalNbVertices);
            for (const polygon of this.polygonsBatch) {
                const polygonDepth = 1 - iPolygon / this.polygonsBatch.length;
                verticesBuffer[iVertice++] = polygon.center.x;
                verticesBuffer[iVertice++] = polygon.center.y;
                verticesBuffer[iVertice++] = polygonDepth;
                verticesBuffer[iVertice++] = 0; // padding for alignment

                for (const outlinePoint of polygon.outline) {
                    verticesBuffer[iVertice++] = outlinePoint.x;
                    verticesBuffer[iVertice++] = outlinePoint.y;
                    verticesBuffer[iVertice++] = polygonDepth;
                    verticesBuffer[iVertice++] = 0; // padding for alignment
                }

                iPolygon++;
            }

            let iIndex = 0;
            let iVerticeIndex = 0;
            const indicesBuffer = new Uint16Array(2 * totalNbLines + 3 * totalNbTriangles);
            for (const polygon of this.polygonsBatch) {
                const indexOfPolygonCenter = iVerticeIndex;

                for (let iPoint = 0; iPoint < polygon.outline.length - 1; iPoint++) {
                    indicesBuffer[iIndex++] = indexOfPolygonCenter;
                    indicesBuffer[iIndex++] = indexOfPolygonCenter + iPoint + 1;
                    indicesBuffer[iIndex++] = indexOfPolygonCenter + iPoint + 2;
                }
                indicesBuffer[iIndex++] = indexOfPolygonCenter;
                indicesBuffer[iIndex++] = indexOfPolygonCenter + polygon.outline.length;
                indicesBuffer[iIndex++] = indexOfPolygonCenter + 1;

                iVerticeIndex += polygon.outline.length + 1;
            }

            iVerticeIndex = 0;
            for (const polygon of this.polygonsBatch) {
                for (let iPoint = 0; iPoint < polygon.outline.length - 1; iPoint++) {
                    indicesBuffer[iIndex++] = iVerticeIndex + iPoint + 1;
                    indicesBuffer[iIndex++] = iVerticeIndex + iPoint + 2;
                }
                indicesBuffer[iIndex++] = iVerticeIndex + polygon.outline.length;
                indicesBuffer[iIndex++] = iVerticeIndex + 1;

                iVerticeIndex += polygon.outline.length + 1;
            }

            this.corollaShader.u["uScreenSize"].value = [this.width, this.height];

            this.corollaShader.use();
            this.corollaShader.u["uColor"].value = [1, 0, 0, 1];
            this.corollaShader.bindUniforms();

            gl.bindBuffer(gl.ARRAY_BUFFER, this.corollaVBOId);
            gl.bufferData(gl.ARRAY_BUFFER, verticesBuffer, gl.DYNAMIC_DRAW);
            const aDataLoc = this.corollaShader.a["aData"].loc;
            gl.enableVertexAttribArray(aDataLoc);
            gl.vertexAttribPointer(aDataLoc, 4, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.corollaIndexVBOId);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer, gl.DYNAMIC_DRAW);

            gl.depthMask(true);
            gl.drawElements(gl.TRIANGLES, 3 * totalNbTriangles, gl.UNSIGNED_SHORT, 0);
            gl.depthMask(false);

            this.corollaShader.u["uColor"].value = [0, 0, 0, 1];
            this.corollaShader.bindUniforms();
            const UNSIGNED_SHORT_SIZE_IN_BYTES = 2;
            gl.drawElements(gl.LINES, 2 * totalNbLines, gl.UNSIGNED_SHORT, 3 * totalNbTriangles * UNSIGNED_SHORT_SIZE_IN_BYTES);
        }
    }

    private drawEllipseBatches(): void {
        if (this.petalsShader && this.ellipseBatches.length > 0) {
            let totalNbPoints = 0;
            for (const ellipseBatch of this.ellipseBatches) {
                totalNbPoints += ellipseBatch.ellipseList.length;
            }

            let i = 0;
            const buffer = new Float32Array(8 * totalNbPoints);
            for (const ellipseBatch of this.ellipseBatches) {
                for (const ellipse of ellipseBatch.ellipseList) {
                    buffer[i++] = ellipse.center.x;
                    buffer[i++] = ellipse.center.y;
                    buffer[i++] = Math.max(ellipse.width, ellipse.height);
                    buffer[i++] = Math.min(ellipse.width, ellipse.height) / Math.max(ellipse.width, ellipse.height);

                    buffer[i++] = ellipseBatch.color.r;
                    buffer[i++] = ellipseBatch.color.g;
                    buffer[i++] = ellipseBatch.color.b;
                    buffer[i++] = ellipse.orientation;
                }
            }

            this.petalsShader.u["uScreenSize"].value = [this.width, this.height];
            this.petalsShader.u["uPetalAlpha"].value = 0.2;

            this.petalsShader.use();
            this.petalsShader.bindUniforms();

            // gl.depthMask(false); // don't write to depth buffer

            const BYTES_PER_FLOAT = 4;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.petalsVBOId);
            gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.DYNAMIC_DRAW);
            const aData1Loc = this.petalsShader.a["aData1"].loc;
            gl.enableVertexAttribArray(aData1Loc);
            gl.vertexAttribPointer(aData1Loc, 4, gl.FLOAT, false, 2 * 4 * BYTES_PER_FLOAT, 0);
            const aData2Loc = this.petalsShader.a["aData2"].loc;
            gl.enableVertexAttribArray(aData2Loc);
            gl.vertexAttribPointer(aData2Loc, 4, gl.FLOAT, false, 2 * 4 * BYTES_PER_FLOAT, 4 * BYTES_PER_FLOAT);
            gl.drawArrays(gl.POINTS, 0, totalNbPoints);

            this.ellipseBatches = [];
        }
    }
}

export {
    PlotterCanvasWebGL,
};
