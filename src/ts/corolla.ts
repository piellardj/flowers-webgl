import { ForceField } from "./force-field";
import { IEllipse, IPoint, IVector } from "./interfaces";
import { Noise } from "./noise";
import { Parameters } from "./parameters";
import { Color } from "./plotting/color";
import { Plotter } from "./plotting/plotter";


interface IPetal extends IEllipse {
    petalArea: number;
    rotationSpeed: number;
}

function randomColor(): Color {
    const random = Noise.randomInRange(0, 3);
    const randomChannel = Math.floor(0.5 * 255 * (random % 1));

    if (random < 1) {
        return new Color(255, 0, 255 - randomChannel);
    } else if (random < 2) {
        return new Color(255, randomChannel, 0);
    } else if (random < 3) {
        return new Color(255 - randomChannel, 255, 0);
    } else if (random < 4) {
        return new Color(0, 255, randomChannel);
    } else if (random < 5) {
        return new Color(0, 255 - randomChannel, 255);
    } else {
        return new Color(randomChannel, 0, 255);
    }
}

const PETALS_DROP_RATE = 0.1;

class Corolla {
    public readonly position: IPoint; // readonly because attachedPetals reference it

    private readonly color: Color;
    private readonly initialPetalsCount: number;
    private readonly attachedPetals: IPetal[];
    private readonly floatingPetals: IPetal[];
    private readonly outline: IPoint[];

    private readonly noise: Noise;

    private readonly maxLiftingForce: number;

    private wind: IVector;

    public constructor() {
        this.position = { x: 0, y: 0 };
        this.color = randomColor();
        this.initialPetalsCount = Parameters.petalsCount;
        this.attachedPetals = this.computePetals(this.initialPetalsCount);
        this.floatingPetals = [];
        this.outline = Corolla.computeOutline(40, 20);

        this.noise = new Noise(Noise.randomInRange(1, 2));
        this.maxLiftingForce = Noise.randomInRange(5000, 8000);
    }

    public update(dt: number): void {
        if (this.attachedPetals.length > 0 && Math.random() < PETALS_DROP_RATE * dt) {
            const detachedPetal = this.attachedPetals.pop();
            detachedPetal.center = { x: this.position.x, y: this.position.y };
            detachedPetal.rotationSpeed = Noise.randomInRange(-1.5, 1.5);
            this.floatingPetals.push(detachedPetal);
        }

        for (const detachedPetal of this.floatingPetals) {
            detachedPetal.center.y -= 0.05 * detachedPetal.petalArea * dt;
            detachedPetal.orientation += detachedPetal.rotationSpeed * dt;
        }
        this.trimFloatingPetals();

        this.wind = this.noise.compute(dt);
        this.wind.x = Parameters.wind * 10000 * (this.wind.x - 0.5);
        this.wind.y = 1000 * (this.wind.y - 0.5);
    }

    public draw(plotter: Plotter): void {
        this.drawOutline(plotter);
        this.drawPetals(plotter);
    }

    public getAcceleration(forceField: ForceField): IVector {
        const strength = Math.pow(this.attachedPetals.length / this.initialPetalsCount, 0.25);

        const acceleration: IVector = { x: 0, y: 0 };
        acceleration.x += this.wind.x * strength;
        acceleration.y += this.wind.y;

        const GRAVITY = 3000;
        acceleration.y += GRAVITY - this.maxLiftingForce * strength;

        const fieldForce = forceField.computeForce(this.position);
        acceleration.x += strength * 2000 * fieldForce.x;
        acceleration.y += strength * 2000 * fieldForce.y;

        return acceleration;
    }

    public isDead(lowestAllowed: number): boolean {
        return this.attachedPetals.length <= 0 && this.floatingPetals.length <= 0 && this.position.y > lowestAllowed + 50;
    }

    private drawPetals(plotter: Plotter): void {
        const allPetals = this.attachedPetals.concat(this.floatingPetals);
        const color = Parameters.singlePetalColor ? Parameters.petalColor : this.color;
        plotter.drawEllipses(allPetals, color);
    }

    private drawOutline(plotter: Plotter): void {
        plotter.drawPolygon(this.outline, this.position);
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

    private computePetals(nbPetals: number): IPetal[] {
        const result: IPetal[] = [];

        for (let i = 0; i < nbPetals; i++) {
            const width = Noise.randomInRange(50, 70);
            const proportions = Noise.randomInRange(0.3, 0.7);
            const height = proportions * width;
            const orientation = Noise.randomInRange(0, 2 * Math.PI);

            result.push({
                width,
                height,
                orientation,
                center: this.position,
                petalArea: width * height,
                rotationSpeed: 0,
            });
        }

        return result;
    }

    private static computeOutline(outlineNbPoints: number, outlineRadius: number): IPoint[] {
        const result: IPoint[] = [];

        for (let i = 0; i < outlineNbPoints; i++) {
            const angle = 2 * Math.PI * i / (outlineNbPoints - 1);
            const radius = outlineRadius * Noise.randomInRange(1, 1.3);
            result.push({
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle),
            });
        }

        return result;
    }
}

export { Corolla };

