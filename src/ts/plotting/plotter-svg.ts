import { Line, Plotter } from "./plotter";
import { IEllipse, IPoint } from "../interfaces";
import { Color } from "./color";

import "../page-interface-generated";

function radianToDegree(radian: number) {
    return 180 * radian / Math.PI;
}

class PlotterSvg extends Plotter {
    private readonly stringParts: string[];
    private readonly width: number;
    private readonly height: number;

    public constructor(width: number, height: number) {
        super();
        this.stringParts = [];
        this.width = width;
        this.height = height;
    }

    protected initializeInternal(): void {
        this.stringParts.push(`<?xml version="1.0" encoding="UTF-8" standalone="no"?>`);
        this.stringParts.push(`<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${this.width} ${this.height}">`);

        this.stringParts.push(`\t<rect fill="${this.fillColor.toStringRGB()}" stroke="none" x="0" y="0" width="${this.width}" height="${this.height}"/>`);
        this.stringParts.push(`\t<g fill="${this.fillColor.toStringRGB()}" stroke="${this.lineColor.toStringRGB()}" stroke-width="1">`);
    }

    public finalize(): void {
        this.stringParts.push("\t</g>");
        this.stringParts.push("</svg>");
    }

    public toString(): string {
        return this.stringParts.join("\n");
    }

    public drawLines(lines: Line[]): void {
        if (lines.length >= 1) {
            this.stringParts.push(`\t\t<g fill="none">`);

            for (const line of lines) {
                if (line.length >= 2) {
                    this.stringParts.push(`\t\t\t<path d="${PlotterSvg.computePath(line)}"/>`);
                }
            }

            this.stringParts.push(`\t\t</g>`);
        }
    }

    public drawPolygon(polygon: Line, offset: IPoint): void {
        if (polygon.length >= 2) {
            const transform = `translate(${offset.x.toFixed(1)} ${offset.y.toFixed(1)})`;
            this.stringParts.push(`\t\t<path d="${PlotterSvg.computePath(polygon)}Z" transform="${transform}"/>`);
        }
    }

    public drawEllipses(ellipses: IEllipse[], color: Color): void {
        if (ellipses.length >= 1) {
            this.stringParts.push(`\t\t<g stroke="none" fill="${color.toStringRGBA(this.ellipseOpacity)}">`);
            for (const ellipse of ellipses) {
                const transform = `translate(${ellipse.center.x.toFixed(1)} ${ellipse.center.y.toFixed(1)}) rotate(${radianToDegree(ellipse.orientation).toFixed(1)})`;
                this.stringParts.push(`\t\t\t<ellipse cx="0" cy="0" rx="${(0.5 * ellipse.width).toFixed(1)}" ry="${(0.5 * ellipse.height).toFixed(1)}" transform="${transform}"/>`);
            }
            this.stringParts.push(`\t\t</g>`);
        }
    }

    private static computePath(line: Line): string {
        const start = `M${line[0].x.toFixed(1)},${line[0].y.toFixed(1)}L`;

        const pathParts: string[] = [];
        for (let iP = 1; iP < line.length; iP++) {
            pathParts.push(`${line[iP].x.toFixed(1)},${line[iP].y.toFixed(1)}`);
        }

        return start + pathParts.join(" ");
    }
}

export { PlotterSvg };

