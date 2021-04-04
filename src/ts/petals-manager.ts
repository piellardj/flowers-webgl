import { IPoint } from "./interfaces";
import { Plotter } from "./plotter";

interface IPetal {
    center: IPoint;
    width: number;
    height: number;
    orientation: number;
}

interface IColoredPetal extends IPetal {
    color: string;
}

class PetalsManager {
    private petals: IColoredPetal[];

    public constructor() {
        this.petals = [];
    }

    public update(dt: number): void {
        for (const petal of this.petals) {
        }

        // remove out of screen petals
        this.petals = this.petals.filter((candidate: IColoredPetal) => {
            return candidate.center.y + Math.max(candidate.width, candidate.height) > -20;
        });
        console.log(this.petals.length);
    }

    public draw(plotter: Plotter): void {
        for (const petal of this.petals) {
            plotter.drawEllipsis(petal.center, 0.5 * petal.width, 0.5 * petal.height, petal.orientation, petal.color);
        }
    }

    public registerFreePetal(petal: IPetal, color: string): void {
        const coloredPetal = petal as IColoredPetal;
        coloredPetal.color = color;
        this.petals.push(coloredPetal);
    }
}

export {
    IPetal,
    PetalsManager,
};
