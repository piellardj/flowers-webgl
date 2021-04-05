import { IEllipse, IPoint, IVector } from "./interfaces";
import { Plotter } from "./plotter";

interface IFloatingPetal extends IEllipse {
    center: IPoint;
    petalArea: number;
    rotationSpeed: number;
}

function randomColor(): string {
    const random = Math.random() * 3;
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

function noise(): IVector {
    return {
        x: 5000 * (Math.random() - 0.5),
        y: 100 * (Math.random() - 0.5),
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
        this.attachedPetals = this.computePetals(8);
        this.floatingPetals = [];
        this.outline = Corolla.computeOutline(40, 20);

        this.noisePeriod = 1 + Math.random();
        this.noiseTime = this.noisePeriod + 1;
        this.lastNoise = noise();
        this.nextNoise = noise();
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
            x: noiseX * Math.min(1, this.attachedPetals.length / 16),
            y: DOWNWARD_FORCE - UPWARD_FORCE[Math.min(UPWARD_FORCE.length - 1, this.attachedPetals.length)] + noiseY,
        };
    }

    public isDead(lowestAllowed: number): boolean {
        return this.attachedPetals.length <= 0 && this.position.y > lowestAllowed + 50;
    }

    private drawPetals(plotter: Plotter): void {
        const allPetals = this.attachedPetals.concat(this.floatingPetals);
        plotter.drawEllipsis(allPetals, this.color);
    }

    private drawOutline(plotter: Plotter): void {
        plotter.drawPolygon(this.outline, this.position, "black", plotter.backgroundColor);
    }

    private registerFloatingPetal(petal: IEllipse): void {
        const floatingPetal = petal as IFloatingPetal;
        floatingPetal.center = { x: this.position.x, y: this.position.y };
        floatingPetal.petalArea = floatingPetal.width * floatingPetal.height;
        floatingPetal.rotationSpeed = 2 * (Math.random() - 0.5);
        this.floatingPetals.push(floatingPetal);
    }

    private computePetals(nbPetals: number): IEllipse[] {
        const result: IEllipse[] = [];

        for (let i = 0; i < nbPetals; i++) {
            const proportions = 0.3 + 0.4 * Math.random();
            const radiusX = 20 + 20 * Math.random();
            const radiusY = proportions * radiusX;
            const orientation = 2 * Math.PI * Math.random();

            result.push({
                width: 2 * radiusX,
                height: 2 * radiusY,
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

