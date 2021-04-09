import { IEllipse, IPoint } from "../interfaces";
import { Line } from "./plotter";
import { PlotterCanvas } from "./plotter-canvas-base";

import { gl, initGL } from "../gl-utils/gl-canvas";
import { Shader } from "../gl-utils/shader";
import * as ShaderManager from "../gl-utils/shader-manager";

import "../page-interface-generated";
import { Color } from "./color";


enum EBatchType {
    LINES,
    POLYGONS,
    ELLIPSES,
}

interface IBatch {
    type: EBatchType;
    batchId: number;
}

interface ILinesBatch extends IBatch {
    type: EBatchType.LINES;
    lines: Line[];
    nbSegments: number;
}

interface IEllipsesBatch extends IBatch {
    type: EBatchType.ELLIPSES;
    ellipsesList: IEllipse[];
    color: Color;
}

interface IPolygonsBatch extends IBatch {
    outline: IPoint[];
    center: IPoint;
}

class PlotterCanvasWebGL extends PlotterCanvas {
    private linesShader: Shader;
    private readonly linesVBOId: WebGLBuffer;

    private ellipsesShader: Shader;
    private readonly ellipsesVBOId: WebGLBuffer;

    private polygonsShader: Shader;
    private readonly corollaVBOId: WebGLBuffer;
    private readonly corollaIndexVBOId: WebGLBuffer;

    private batches: IBatch[];

    public constructor() {
        super();

        if (!initGL()) {
            throw new Error("Failed to initialize WebGL.");
        }
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clearDepth(1);

        this.linesVBOId = gl.createBuffer();
        this.ellipsesVBOId = gl.createBuffer();
        this.corollaVBOId = gl.createBuffer();
        this.corollaIndexVBOId = gl.createBuffer();

        ShaderManager.buildShader({
            vertexFilename: "lines.vert",
            fragmentFilename: "lines.frag",
            injected: {},
        }, (builtShader: Shader | null) => {
            if (builtShader === null) {
                const errorMessage = `Failed to load or build the lines shader.`;
                Page.Demopage.setErrorMessage(`shader-lines`, errorMessage);
                throw new Error(errorMessage);
            }
            this.linesShader = builtShader;
        });

        ShaderManager.buildShader({
            vertexFilename: "ellipses.vert",
            fragmentFilename: "ellipses.frag",
            injected: {},
        }, (builtShader: Shader | null) => {
            if (builtShader === null) {
                const errorMessage = `Failed to load or build the ellipses shader.`;
                Page.Demopage.setErrorMessage(`shader-ellipses`, errorMessage);
                throw new Error(errorMessage);
            }
            this.ellipsesShader = builtShader;
        });

        ShaderManager.buildShader({
            vertexFilename: "polygons.vert",
            fragmentFilename: "polygons.frag",
            injected: {},
        }, (builtShader: Shader | null) => {
            if (builtShader === null) {
                const errorMessage = `Failed to load or build the polygons shader.`;
                Page.Demopage.setErrorMessage(`shader-polygons`, errorMessage);
                throw new Error(errorMessage);
            }
            this.polygonsShader = builtShader;
        });
    }

    public initializeInternal(): void {
        gl.viewport(0, 0, this.width * this.cssPixel, this.height * this.cssPixel);
        gl.clearColor(this.fillColor.rNormalized, this.fillColor.gNormalized, this.fillColor.bNormalized, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // tslint:disable-line no-bitwise

        this.batches = [];
    }

    // tslint:disable-next-line no-empty
    public finalize(): void {
        const linesBatch: ILinesBatch[] = [];
        const polygonsBatch: IPolygonsBatch[] = [];
        const ellipsesBatch: IEllipsesBatch[] = [];

        for (const batch of this.batches) {
            if (batch.type === EBatchType.LINES) {
                linesBatch.push(batch as ILinesBatch);
            } else if (batch.type === EBatchType.POLYGONS) {
                polygonsBatch.push(batch as IPolygonsBatch);
            } else if (batch.type === EBatchType.ELLIPSES) {
                ellipsesBatch.push(batch as IEllipsesBatch);
            }
        }

        if (linesBatch.length > 0) {
            this.drawLinesBatches(linesBatch);
        }

        gl.depthMask(true); // write to depth buffer
        if (polygonsBatch.length > 0) {
            this.drawPolygonsBatches(polygonsBatch);
        }

        gl.depthMask(false); // don't write to depth buffer because ellipses are not opaque
        if (ellipsesBatch.length > 0) {
            this.drawEllipseBatches(ellipsesBatch);
        }
        this.batches = [];
    }

    public drawLines(lines: Line[]): void {
        const nonTrivalLines: Line[] = [];

        let nbSegments = 0;
        for (const line of lines) {
            if (line.length >= 2) {
                nbSegments += line.length - 1;
                nonTrivalLines.push(line);
            }
        }

        if (nonTrivalLines.length > 0) {
            const linesBatch: ILinesBatch = {
                type: EBatchType.LINES,
                lines: nonTrivalLines,
                nbSegments,
                batchId: this.batches.length,
            };

            this.batches.push(linesBatch);
        }
    }

    public drawPolygon(polygon: Line, offset: IPoint): void {
        if (polygon.length > 0) {
            const outline: IPoint[] = [];
            for (const point of polygon) {
                outline.push({
                    x: point.x + offset.x,
                    y: point.y + offset.y,
                });
            }

            const polygonBatch: IPolygonsBatch = {
                type: EBatchType.POLYGONS,
                outline,
                center: offset,
                batchId: this.batches.length,
            };
            this.batches.push(polygonBatch);
        }
    }

    public drawEllipses(ellipses: IEllipse[], color: Color): void {
        if (ellipses.length > 0) {
            const ellipsesBatch: IEllipsesBatch = {
                type: EBatchType.ELLIPSES,
                ellipsesList: ellipses,
                color,
                batchId: this.batches.length,
            };
            this.batches.push(ellipsesBatch);
        }
    }

    private drawLinesBatches(batches: ILinesBatch[]) {
        if (this.linesShader) {
            let totalNbSegments = 0;
            for (const batch of batches) {
                totalNbSegments += batch.nbSegments;
            }

            const buffer = new Float32Array(2 * 2 * totalNbSegments);
            {
                let i = 0;
                for (const batch of batches) {
                    for (const line of batch.lines) {
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
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, this.linesVBOId);
            gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.DYNAMIC_DRAW);

            this.linesShader.u["uScreenSize"].value = [this.width, this.height];
            this.linesShader.u["uColor"].value = [this.lineColor.rNormalized, this.lineColor.gNormalized, this.lineColor.bNormalized, 1];

            this.linesShader.use();
            const aVertexLoc = this.linesShader.a["aVertex"].loc;
            gl.enableVertexAttribArray(aVertexLoc);

            const FLOAT_SIZE_IN_BYTES = 4;
            let batchStartIndex = 0;
            for (const batch of batches) {
                this.linesShader.u["uDepth"].value = this.computeBatchDepth(batch);
                this.linesShader.bindUniforms();
                gl.vertexAttribPointer(aVertexLoc, 2, gl.FLOAT, false, 0, 2 * batchStartIndex * FLOAT_SIZE_IN_BYTES);
                const nbVertices = 2 * batch.nbSegments;
                gl.drawArrays(gl.LINES, 0, nbVertices);
                batchStartIndex += nbVertices;
            }
        }
    }

    private drawPolygonsBatches(batches: IPolygonsBatch[]): void {
        if (this.polygonsShader) {
            let totalNbVertices = 0;
            let totalNbTriangles = 0;
            let totalNbLines = 0;
            for (const polygon of batches) {
                totalNbVertices += 1 + polygon.outline.length;
                totalNbTriangles += polygon.outline.length;
                totalNbLines += polygon.outline.length;
            }

            const verticesBuffer = new Float32Array(4 * totalNbVertices);
            {
                let iVertice = 0;
                for (const polygon of batches) {
                    const polygonDepth = this.computeBatchDepth(polygon);
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
                }
            }

            const indicesBuffer = new Uint16Array(2 * totalNbLines + 3 * totalNbTriangles);
            {
                let iIndex = 0;
                let iVerticeIndex = 0;
                for (const polygon of batches) {
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
                for (const polygon of batches) {
                    for (let iPoint = 0; iPoint < polygon.outline.length - 1; iPoint++) {
                        indicesBuffer[iIndex++] = iVerticeIndex + iPoint + 1;
                        indicesBuffer[iIndex++] = iVerticeIndex + iPoint + 2;
                    }
                    indicesBuffer[iIndex++] = iVerticeIndex + polygon.outline.length;
                    indicesBuffer[iIndex++] = iVerticeIndex + 1;

                    iVerticeIndex += polygon.outline.length + 1;
                }
            }

            this.polygonsShader.u["uScreenSize"].value = [this.width, this.height];

            this.polygonsShader.use();

            gl.bindBuffer(gl.ARRAY_BUFFER, this.corollaVBOId);
            gl.bufferData(gl.ARRAY_BUFFER, verticesBuffer, gl.DYNAMIC_DRAW);
            const aDataLoc = this.polygonsShader.a["aData"].loc;
            gl.enableVertexAttribArray(aDataLoc);
            gl.vertexAttribPointer(aDataLoc, 4, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.corollaIndexVBOId);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer, gl.DYNAMIC_DRAW);

            this.polygonsShader.u["uColor"].value = [this.fillColor.rNormalized, this.fillColor.gNormalized, this.fillColor.bNormalized, 1];
            this.polygonsShader.bindUniforms();
            gl.drawElements(gl.TRIANGLES, 3 * totalNbTriangles, gl.UNSIGNED_SHORT, 0);

            this.polygonsShader.u["uColor"].value = [this.lineColor.rNormalized, this.lineColor.gNormalized, this.lineColor.bNormalized, 2];
            this.polygonsShader.bindUniforms();
            const UNSIGNED_SHORT_SIZE_IN_BYTES = 2;
            gl.drawElements(gl.LINES, 2 * totalNbLines, gl.UNSIGNED_SHORT, 3 * totalNbTriangles * UNSIGNED_SHORT_SIZE_IN_BYTES);
        }
    }

    private drawEllipseBatches(batches: IEllipsesBatch[]): void {
        if (this.ellipsesShader) {
            let totalNbPoints = 0;
            for (const ellipseBatch of batches) {
                totalNbPoints += ellipseBatch.ellipsesList.length;
            }

            const buffer = new Float32Array(8 * totalNbPoints);
            {
                let i = 0;
                for (const ellipseBatch of batches) {
                    const batchDepth = this.computeBatchDepth(ellipseBatch);

                    for (const ellipse of ellipseBatch.ellipsesList) {
                        const widestSide = Math.ceil(Math.max(1, ellipse.width, ellipse.height)); // integer
                        const proportions = Math.min(ellipse.width, ellipse.height) / widestSide; // in [0, 1]
                        const encodedDimensions = Math.ceil(widestSide * this.cssPixel) + proportions;

                        buffer[i++] = ellipse.center.x;
                        buffer[i++] = ellipse.center.y;
                        buffer[i++] = encodedDimensions;
                        buffer[i++] = batchDepth;

                        buffer[i++] = ellipseBatch.color.rNormalized;
                        buffer[i++] = ellipseBatch.color.gNormalized;
                        buffer[i++] = ellipseBatch.color.bNormalized;
                        buffer[i++] = ellipse.orientation;
                    }
                }
            }

            this.ellipsesShader.u["uScreenSize"].value = [this.width, this.height];
            this.ellipsesShader.u["uPetalAlpha"].value = 0.2;

            this.ellipsesShader.use();
            this.ellipsesShader.bindUniforms();

            // gl.depthMask(false); // don't write to depth buffer

            const BYTES_PER_FLOAT = 4;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.ellipsesVBOId);
            gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.DYNAMIC_DRAW);
            const aData1Loc = this.ellipsesShader.a["aData1"].loc;
            gl.enableVertexAttribArray(aData1Loc);
            gl.vertexAttribPointer(aData1Loc, 4, gl.FLOAT, false, 2 * 4 * BYTES_PER_FLOAT, 0);
            const aData2Loc = this.ellipsesShader.a["aData2"].loc;
            gl.enableVertexAttribArray(aData2Loc);
            gl.vertexAttribPointer(aData2Loc, 4, gl.FLOAT, false, 2 * 4 * BYTES_PER_FLOAT, 4 * BYTES_PER_FLOAT);
            gl.drawArrays(gl.POINTS, 0, totalNbPoints);
        }
    }

    private computeBatchDepth(batch: IBatch): number {
        return 1.9 * (0.5 - (batch.batchId / this.batches.length));
    }
}

export {
    PlotterCanvasWebGL,
};
