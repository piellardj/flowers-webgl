import { IPoint, IVector } from "./interfaces";
import { Plotter } from "./plotter";

interface IRopeNode {
    pos: IPoint;
    previousPos: IPoint;
    acc: IVector;
}

function createRopeNode(x: number, y: number): IRopeNode {
    return {
        pos: { x, y },
        previousPos: { x, y },
        acc: { x: 0, y: 0 },
    };
}

const GRAVITY = 1000;
const DAMPENING = 0.99;
const NB_ITERATIONS = 10;

class Rope {
    private static readonly dqsdq;
    private readonly nodes: IRopeNode[];
    private readonly segmentLength: number;

    public constructor(length: number, nbNodes: number) {
        this.segmentLength = length;

        this.nodes = [];

        this.nodes.push(createRopeNode(200, 200));

        for (let iN = 0; iN < nbNodes; iN++) {
            const angle = 2 * Math.PI * Math.random();
            this.nodes.push(createRopeNode(
                this.nodes[this.nodes.length - 1].pos.x + length * Math.cos(angle),
                this.nodes[this.nodes.length - 1].pos.y + length * Math.sin(angle)
            ));
        }
    }

    public draw(plotter: Plotter): void {
        const points: IPoint[] = [];
        for (const node of this.nodes) {
            points.push(node.pos);
        }
        plotter.drawLine(points);
    }

    public update(dt: number): void {
        this.applyForces();
        this.applyVerlet(dt);

        for (let i = 0; i < NB_ITERATIONS; i++) {
            this.applyConstraints();
        }
    }

    private applyForces(): void {
        for (let iN = 1; iN < this.nodes.length; iN++) {
            this.nodes[iN].acc.y = GRAVITY;
        }
    }

    private applyVerlet(dt: number): void {
        for (const node of this.nodes) {
            // CURRENT_VELOCITY = (CURRENT_POSITION - PREVIOUS_POSITION) / DT
            // NEW_VELOCITY = DAMPENING * CURRENT_VELOCITY + CURRENT_ACCELERATION * DT
            // NEW_POSITION = CURRENT_POSITION + NEW_VELOCITY * DT

            const newPosX = node.pos.x + DAMPENING * (node.pos.x - node.previousPos.x) + dt * dt * node.acc.x;
            const newPosY = node.pos.y + DAMPENING * (node.pos.y - node.previousPos.y) + dt * dt * node.acc.y;

            node.previousPos.x = node.pos.x;
            node.previousPos.y = node.pos.y;
            node.pos.x = newPosX;
            node.pos.y = newPosY;
        }
    }

    private applyConstraints(): void {
        const EPSILON = 0.000001;
        this.nodes[0].pos.x = 200;
        this.nodes[0].pos.y = 200;

        for (let iN = 1; iN < this.nodes.length; iN++) {
            const dX = this.nodes[iN].pos.x - this.nodes[iN - 1].pos.x;
            const dY = this.nodes[iN].pos.y - this.nodes[iN - 1].pos.y;
            const distanceToPrevious = Math.sqrt(dX * dX + dY * dY);
            const correction = 0.5 * (1 - this.segmentLength / (distanceToPrevious + EPSILON));
            const correctionX = dX * correction;
            const correctionY = dY * correction;

            this.nodes[iN].pos.x -= correctionX;
            this.nodes[iN].pos.y -= correctionY;
            this.nodes[iN - 1].pos.x += correctionX;
            this.nodes[iN - 1].pos.y += correctionY;
        }
    }
}

export { Rope };
