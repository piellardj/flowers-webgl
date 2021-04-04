import { IPoint } from "./interfaces";
import { Plotter } from "./plotter";

interface IPetal {
    center: IPoint;
    width: number;
    height: number;
    orientation: number;
}

interface IFloatingPetal extends IPetal {
    petalArea: number;
    rotationSpeed: number;
    color: string;
}

class PetalsManager {
    private petals: IFloatingPetal[];

    public constructor() {
        this.petals = [];
    }

    public update(dt: number): void {
        for (const petal of this.petals) {
            petal.center.y -= 0.05 * petal.petalArea * dt;
            petal.orientation += petal.rotationSpeed * dt;
        }

        // remove out of screen petals
        this.petals = this.petals.filter((candidate: IFloatingPetal) => {
            return candidate.center.y + Math.max(candidate.width, candidate.height) > -20;
        });
    }

    public draw(plotter: Plotter): void {
        for (const petal of this.petals) {
            plotter.drawEllipsis(petal.center, 0.5 * petal.width, 0.5 * petal.height, petal.orientation, petal.color);
        }
    }

    public registerFreePetal(petal: IPetal, color: string): void {
        const coloredPetal = petal as IFloatingPetal;
        coloredPetal.color = color;
        coloredPetal.petalArea = coloredPetal.width * coloredPetal.height;
        coloredPetal.rotationSpeed = Math.random() - 0.5;
        this.petals.push(coloredPetal);
    }
}

export {
    IPetal,
    PetalsManager,
};
