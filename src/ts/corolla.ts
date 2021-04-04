import { timeStamp } from "node:console";
import { IPoint, IVector } from "./interfaces";
import { PetalsManager } from "./petals-manager";
import { Plotter } from "./plotter";

interface IPetal {
    center: IPoint;
    width: number;
    height: number;
    orientation: number;
}

function randomColor(): string {
    const random = Math.random() * 3;
    const randomChannel = Math.floor(255 * (random % 1));

    if (random < 1) {
        return `255, 0, ${255 - randomChannel}`;
    } else if (random < 2) {
        return `255, ${randomChannel}, 0`;
    } else if (random < 3) {
        return `${255 - randomChannel}, 255, 0`;
    } else if (random < 4) {
        return `0, 255, ${randomChannel}`;
    } else if (random < 5) {
        return `0, ${255 - randomChannel}, 255`;
    } else {
        return `${randomChannel}, 0, 255`;
    }
}

function noise(): IVector {
    return {
        x: 5000 * (Math.random() - 0.5),
        y: 100 * (Math.random() - 0.5),
    };
}

const PETALS_DROP_RATE = 0.1;

class Corolla {
    private readonly color: string;
    private readonly petals: IPetal[];
    private readonly outline: IPoint[];

    public readonly position: IPoint;

    public noisePeriod: number;
    public noiseTime: number;
    public lastNoise: IVector;
    public nextNoise: IVector;

    public constructor() {
        this.color = `rgba(${randomColor()}, 0.2)`;
        this.petals = Corolla.computePetals(8);
        this.outline = Corolla.computeOutline(40, 20);
        this.position = { x: 0, y: 0 };

        this.noisePeriod = 1 + Math.random();
        this.noiseTime = this.noisePeriod + 1;
        this.lastNoise = noise();
        this.nextNoise = noise();
    }

    public update(dt: number, petalsManager: PetalsManager): void {
        if (this.petals.length > 0 && Math.random() < PETALS_DROP_RATE * dt) {
            const newFreePetal = this.petals.pop();
            newFreePetal.center.x = this.position.x;
            newFreePetal.center.y = this.position.y;
            petalsManager.registerFreePetal(newFreePetal, this.color);
        }

        this.noiseTime += dt;
        if (this.noiseTime > this.noisePeriod) {
            this.lastNoise = this.nextNoise;
            this.nextNoise = noise();
            this.noiseTime = this.noiseTime % this.noisePeriod;
        }
    }

    public draw(plotter: Plotter): void {
        this.drawOutline(plotter);
        this.drawPetals(plotter);
    }

    public getAcceleration(): IVector {
        const DOWNWARD_FORCE = 10000;
        const UPWARD_FORCE = [7000, 10000, 11000, 12000];

        const r = this.noiseTime / this.noisePeriod;
        const noiseX = this.lastNoise.x * (1 - r) + this.nextNoise.x * r;
        const noiseY = this.lastNoise.y * (1 - r) + this.nextNoise.y * r;
        return {
            x: noiseX * Math.min(1, this.petals.length / 16),
            y: DOWNWARD_FORCE - UPWARD_FORCE[Math.min(UPWARD_FORCE.length - 1, this.petals.length)] + noiseY,
        };
    }

    public isDead(lowestAllowed: number): boolean {
        return this.petals.length <= 0 && this.position.y > lowestAllowed + 50;
    }

    private drawPetals(plotter: Plotter): void {
        for (const petal of this.petals) {
            const center = {
                x: this.position.x + petal.center.x,
                y: this.position.y + petal.center.y,
            };

            plotter.drawEllipsis(center, 0.5 * petal.width, 0.5 * petal.height, petal.orientation, this.color);
        }
    }

    private drawOutline(plotter: Plotter): void {
        const points: IPoint[] = [];
        for (const outlinePoint of this.outline) {
            points.push({
                x: this.position.x + outlinePoint.x,
                y: this.position.y + outlinePoint.y,
            })
        }

        plotter.drawLine(points, true);
    }

    private static computePetals(nbPetals: number): IPetal[] {
        const result: IPetal[] = [];

        for (let i = 0; i < nbPetals; i++) {
            const proportions = 0.3 + 0.4 * Math.random();
            const radiusX = 20 + 20 * Math.random();
            const radiusY = proportions * radiusX;
            const orientation = 2 * Math.PI * Math.random();
            const distanceToCenter = 0;// (0.2 + 0.3 * Math.random()) * radiusX;
            const centerX = distanceToCenter * Math.cos(orientation);
            const centerY = distanceToCenter * Math.sin(orientation);

            result.push({
                center: { x: centerX, y: centerY },
                width: 2 * radiusX,
                height: 2 * radiusY,
                orientation,
            });
        }

        return result;
    }

    private static computeOutline(outlineNbPoints: number, outlineRadius: number): IPoint[] {
        const result: IPoint[] = [];

        for (let i = 0; i < outlineNbPoints; i++) {
            const angle = 2 * Math.PI * i / (outlineNbPoints - 1);
            const radius = outlineRadius * (1 + 0.3 * Math.random());
            result.push({
                x: radius * Math.cos(angle),// + 5 * Math.random(),
                y: radius * Math.sin(angle),// + 5 * Math.random(),
            });
        }

        return result;
    }
}

export { Corolla };
