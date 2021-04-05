import { IEllipse, IPoint } from "../interfaces";

import "../page-interface-generated";

type Line = IPoint[];

abstract class Plotter {
    public backgroundColor: string = "#DCEEFF";

    public abstract initialize(): void;

    public abstract drawLines(lines: Line[], color: string): void;

    public abstract drawPolygon(polygon: Line, offset: IPoint, strokeColor: string, fillColor: string): void;

    public abstract drawEllipsis(ellipsis: IEllipse[], color: string): void;
}

export {
    Line,
    Plotter,
};
