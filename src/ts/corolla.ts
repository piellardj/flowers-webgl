import { IEllipse, IPoint, IVector } from "./interfaces";
import { Parameters } from "./parameters";
import { Plotter } from "./plotting/plotter";

interface IFloatingPetal extends IEllipse {
    center: IPoint;
    petalArea: number;
    rotationSpeed: number;
}

function randomInRange(from: number, to: number): number {
    return from + (to - from) * Math.random();
}

function randomColor(): string {
    const random = randomInRange(0, 3);
    const randomChannel = Math.floor(0.5 * 255 * (random % 1));

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

function windNoise(): IVector {
    return {
        x: Parameters.wind * randomInRange(-5000, 5000),
        y: randomInRange(-500, 500),
    };
}

const PETALS_DROP_RATE = 0.1;

class Corolla {
    public readonly position: IPoint; // readonly because attachedPetals reference it

    private readonly color: string;
    private readonly attachedPetals: IEllipse[];
    private readonly floatingPetals: IFloatingPetal[];
    private readonly outline: IPoint[];

    public noisePeriod: number;
    public noiseTime: number;
    public lastNoise: IVector;
    public nextNoise: IVector;

    public constructor() {
        this.position = { x: 0, y: 0 };
        this.color = `rgba(${randomColor()}, 0.2)`;
        this.attachedPetals = this.computePetals(10);
        this.floatingPetals = [];
        this.outline = Corolla.computeOutline(40, 20);

        this.noisePeriod = randomInRange(1, 2);
        this.noiseTime = this.noisePeriod + 1;
        this.lastNoise = windNoise();
        this.nextNoise = windNoise();
    }

    public update(dt: number): void {
        if (this.attachedPetals.length > 0 && Math.random() < PETALS_DROP_RATE * dt) {
            const newFreePetal = this.attachedPetals.pop();
            this.registerFloatingPetal(newFreePetal);
        }

        for (const detachedPetal of this.floatingPetals) {
            detachedPetal.center.y -= 0.05 * detachedPetal.petalArea * dt;
            detachedPetal.orientation += detachedPetal.rotationSpeed * dt;
        }
        this.trimFloatingPetals();

        this.noiseTime += dt;
        if (this.noiseTime > this.noisePeriod) {
            this.lastNoise = this.nextNoise;
            this.nextNoise = windNoise();
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
            x: noiseX * Math.min(1, this.attachedPetals.length / 16),
            y: DOWNWARD_FORCE - UPWARD_FORCE[Math.min(UPWARD_FORCE.length - 1, this.attachedPetals.length)] + noiseY,
        };
    }

    public isDead(lowestAllowed: number): boolean {
        return this.attachedPetals.length <= 0 && this.floatingPetals.length <= 0 && this.position.y > lowestAllowed + 50;
    }

    private drawPetals(plotter: Plotter): void {
        const allPetals = this.attachedPetals.concat(this.floatingPetals);
        plotter.drawEllipsis(allPetals, this.color);
    }

    private drawOutline(plotter: Plotter): void {
        plotter.drawPolygon(this.outline, this.position, "black", plotter.backgroundColor);
    }

    private trimFloatingPetals(): void {
        for (let iP = this.floatingPetals.length - 1; iP >= 0; iP--) {
            const highestPoint = this.floatingPetals[iP].center.y + 0.5 * Math.max(this.floatingPetals[iP].width, this.floatingPetals[iP].height);
            if (highestPoint < 0) {
                this.floatingPetals.splice(iP, 1);
                iP--;
            }
        }
    }

    private registerFloatingPetal(petal: IEllipse): void {
        const floatingPetal = petal as IFloatingPetal;
        floatingPetal.center = { x: this.position.x, y: this.position.y };
        floatingPetal.petalArea = floatingPetal.width * floatingPetal.height;
        floatingPetal.rotationSpeed = randomInRange(-1.5, 1.5);
        this.floatingPetals.push(floatingPetal);
    }

    private computePetals(nbPetals: number): IEllipse[] {
        const result: IEllipse[] = [];

        for (let i = 0; i < nbPetals; i++) {
            const width = randomInRange(50, 70);
            const proportions = randomInRange(0.3, 0.7);
            const height = proportions * width;
            const orientation = randomInRange(0, 2 * Math.PI);

            result.push({
                width,
                height,
                orientation,
                center: this.position,
            });
        }

        return result;
    }

    private static computeOutline(outlineNbPoints: number, outlineRadius: number): IPoint[] {
        const result: IPoint[] = [];

        for (let i = 0; i < outlineNbPoints; i++) {
            const angle = 2 * Math.PI * i / (outlineNbPoints - 1);
            const radius = outlineRadius * randomInRange(1, 1.3);
            result.push({
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle),
            });
        }

        return result;
    }
}

export { Corolla };

