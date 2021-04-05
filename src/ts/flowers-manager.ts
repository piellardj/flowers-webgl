import { Flower } from "./flower";
import { ForceField } from "./force-field";
import { IPoint } from "./interfaces";
import { Noise } from "./noise";
import { Parameters } from "./parameters";
import { Line, Plotter } from "./plotting/plotter";

class FlowersManager {
    private readonly flowers: Flower[];

    public constructor() {
        this.flowers = [];
    }

    public reset(): void {
        this.flowers.length = 0;
    }

    public manage(domainWidth: number, domainHeight: number): void {
        const idealNumberOfFlowers = Math.round(domainWidth * Parameters.flowersDensity);

        // create new flowers if needed
        while (this.flowers.length < idealNumberOfFlowers) {
            const newFlower = FlowersManager.createFlower(domainWidth, domainHeight)
            this.flowers.push(newFlower);
        }

        // handle old flowers
        for (let iF = this.flowers.length - 1; iF >= 0; iF--) {
            if (this.flowers[iF].isDead(domainHeight)) {
                if (this.flowers.length > idealNumberOfFlowers) {
                    // we have too many flowers already, kill old ones
                    this.flowers.splice(iF, 1);
                    iF--;
                } else {
                    // we must maintain this flowers count, recycle old ones
                    this.flowers[iF] = FlowersManager.createFlower(domainWidth, domainHeight);
                }
            }
        }
    }

    public update(dt: number, forceField: ForceField): void {
        for (const flower of this.flowers) {
            flower.update(dt, forceField);
        }
    }

    public draw(plotter: Plotter): void {
        const stems: Line[] = [];

        for (const flower of this.flowers) {
            stems.push(flower.getDrawableStem());
        }

        plotter.drawLines(stems, Parameters.linesColor);
        for (const flower of this.flowers) {
            flower.drawCorolla(plotter);
        }
    }

    private static createFlower(domainWidth: number, domainHeight: number): Flower {
        const attachPoint: IPoint = {
            x: domainWidth * Math.random(),
            y: domainHeight,
        };

        const flowerLength = Noise.randomInRange(0.2, 0.8) * domainHeight;
        return new Flower(attachPoint, flowerLength);
    }
}

export { FlowersManager };
