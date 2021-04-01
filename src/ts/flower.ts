import { IPoint } from "./interfaces";
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

class Flower {
    public readonly color: string;
    public readonly petals: IPetal[];

    public constructor() {
        this.color = `rgba(${randomColor()}, 0.1)`;
        this.petals = [];
        for (let i = 0; i < 16; i++) {
            const proportions = 0.3 + 0.4 * Math.random();
            const radiusX = 40 + 30 * Math.random();
            const radiusY = proportions * radiusX;
            const orientation = 2 * Math.PI * Math.random();
            const distanceToCenter = (0.2 + 0.3 * Math.random()) * radiusX;
            const centerX = distanceToCenter * Math.cos(orientation);
            const centerY = distanceToCenter * Math.sin(orientation);

            this.petals.push({
                center: { x: centerX, y: centerY },
                width: 2 * radiusX,
                height: 2 * radiusY,
                orientation,
            });
        }
    }

    public draw(plotter: Plotter, position: IPoint, angle: number): void {
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);

        for (const petal of this.petals) {
            const center = {
                x: position.x + (cosAngle * petal.center.x - sinAngle * petal.center.y),
                y: position.y + (sinAngle * petal.center.x + cosAngle * petal.center.y),
            };

            plotter.drawEllipsis(center, 0.5 * petal.width, 0.5 * petal.height, petal.orientation + angle, this.color);
        }
    }

}

export { Flower };
