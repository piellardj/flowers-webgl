import { Corolla } from "./corolla";
import { IPoint } from "./interfaces";
import { PetalsManager } from "./petals-manager";
import { Plotter } from "./plotter";
import { Rope } from "./rope";

class Flower {
    public static maxSegmentLength: number = 20;

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

    public update(dt: number, petalsManager: PetalsManager): void {
        this.corolla.update(dt, petalsManager);
        const corollaAcceleration = this.corolla.getAcceleration();
        this.stem.update(dt, this.attachPoint, corollaAcceleration);
        this.attachCorolla();
    }

    public draw(plotter: Plotter): void {
        this.drawStem(plotter);
        this.drawCorolla(plotter);
    }

    public drawStem(plotter: Plotter): void {
        this.stem.draw(plotter, 5);
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
