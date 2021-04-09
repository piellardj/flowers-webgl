import { IEllipse, IPoint } from "../interfaces";
import { Color } from "./color";

import "../page-interface-generated";

type Line = IPoint[];

abstract class Plotter {
    protected fillColor: Color;
    protected lineColor: Color;
    protected ellipseOpacity: number; // in [0,1]

    public initialize(fillColor: Color, lineColor: Color, ellipseOpacity: number): void {
        this.fillColor = fillColor;
        this.lineColor = lineColor;
        this.ellipseOpacity = ellipseOpacity;
        this.initializeInternal();
    }

    protected abstract initializeInternal(): void;

    public abstract finalize(): void;

    public abstract drawLines(lines: Line[]): void;

    public abstract drawPolygon(polygon: Line, offset: IPoint): void;

    public abstract drawEllipses(ellipses: IEllipse[], color: Color): void;
}

export {
    Line,
    Plotter,
};
