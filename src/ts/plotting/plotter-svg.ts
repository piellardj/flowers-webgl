import { Line, Plotter } from "./plotter";
import { IEllipse, IPoint } from "../interfaces";

import "../page-interface-generated";

function radianToDegree(radian: number) {
    return 180 * radian / Math.PI;
}

class PlotterSvg implements Plotter {
    private readonly stringParts: string[];
    private readonly width: number;
    private readonly height: number;

    public constructor(width: number, height: number) {
        this.stringParts = [];
        this.width = width;
        this.height = height;
    }

    public initialize(backgroundColor: string): void {
        this.stringParts.push(`<?xml version="1.0" encoding="UTF-8" standalone="no"?>`);
        this.stringParts.push(`<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${this.width} ${this.height}">`);

        this.stringParts.push(`\t<rect fill="${backgroundColor}" stroke="none" x="0" y="0" width="${this.width}" height="${this.height}"/>`);
    }

    public finalize(): void {
        this.stringParts.push("</svg>");
    }

    public toString(): string {
        return this.stringParts.join("\n");
    }

    public drawLines(lines: Line[], color: string): void {
        if (lines.length >= 1) {
            this.stringParts.push(`\t<g stroke="${color}" stroke-width="1" fill="none">`);

            for (const line of lines) {
                if (line.length >= 2) {
                    this.stringParts.push(`\t\t<path d="${this.computePath(line)}"/>`);
                }
            }

            this.stringParts.push(`\t</g>`);
        }
    }

    public drawPolygon(polygon: Line, offset: IPoint, strokeColor: string, fillColor: string): void {
        if (polygon.length >= 2) {
            const transform = `translate(${offset.x.toFixed(1)} ${offset.y.toFixed(1)})`;
            this.stringParts.push(`\t<path d="${this.computePath(polygon)}Z" stroke="${strokeColor}" stroke-width="1" fill="${fillColor}" transform="${transform}"/>`);
        }
    }

    public drawEllipsis(ellipsis: IEllipse[], color: string): void {
        if (ellipsis.length >= 1) {
            this.stringParts.push(`\t<g stroke="none" fill="${color}">`);
            for (const ellipse of ellipsis) {
                const transform = `translate(${ellipse.center.x.toFixed(1)} ${ellipse.center.y.toFixed(1)}) rotate(${radianToDegree(ellipse.orientation).toFixed(1)})`;
                this.stringParts.push(`\t\t<ellipse cx="0" cy="0" rx="${(0.5 * ellipse.width).toFixed(1)}" ry="${(0.5 * ellipse.height).toFixed(1)}" transform="${transform}"/>`);
            }
            this.stringParts.push(`\t</g>`);
        }
    }

    private computePath(line: Line): string {
        const start = `M${line[0].x.toFixed(1)},${line[0].y.toFixed(1)}L`;

        const pathParts: string[] = [];
        for (let iP = 1; iP < line.length; iP++) {
            pathParts.push(`${line[iP].x.toFixed(1)},${line[iP].y.toFixed(1)}`);
        }

        return start + pathParts.join(" ");
    }
}

export { PlotterSvg };

