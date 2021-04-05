interface IPoint {
    x: number;
    y: number;
}

interface IVector {
    x: number;
    y: number;
}

interface IEllipse {
    width: number;
    height: number;
    orientation: number;
    center: IPoint;
}

export {
    IEllipse,
    IPoint,
    IVector
};
