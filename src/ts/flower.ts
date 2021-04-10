import { Corolla } from "./corolla";
import { ForceField } from "./force-field";
import { IPoint } from "./interfaces";
import { Parameters } from "./parameters";
import { Line, Plotter } from "./plotting/plotter";
import { Rope } from "./rope";


class Flower {
    public static readonly maxSegmentLength: number = 20;

    private readonly attachPoint: IPoint;
    private readonly stem: Rope;
    private readonly corolla: Corolla;

    public constructor(attachPoint: IPoint, length: number) {
        this.attachPoint = attachPoint;

        const nbNodes = Math.max(length / Flower.maxSegmentLength);
        this.stem = new Rope(attachPoint, length / nbNodes, nbNodes);

        this.corolla = new Corolla();
        this.attachCorolla();
    }

    public update(dt: number, forceField: ForceField): void {
        this.corolla.update(dt);
        const corollaAcceleration = this.corolla.getAcceleration(forceField);
        this.stem.dampening = Parameters.dampening;
        this.stem.update(dt, this.attachPoint, corollaAcceleration);
        this.attachCorolla();
    }

    public getDrawableStem(): Line {
        return this.stem.getDrawableLine(5);
    }

    public drawCorolla(plotter: Plotter): void {
        this.corolla.draw(plotter);
    }

    public isDead(lowestAllowed: number): boolean {
        return this.corolla.isDead(lowestAllowed) && this.stem.highestPoint >= lowestAllowed;
    }

    private attachCorolla(): void {
        this.corolla.position.x = this.stem.endPosition.x;
        this.corolla.position.y = this.stem.endPosition.y;
    }
}

export { Flower };

