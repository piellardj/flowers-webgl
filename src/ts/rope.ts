import { Flower } from "./flower";
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

function computeAngle(p1: IPoint, p2: IPoint): number {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

const GRAVITY = 1000;
const DAMPENING = 0.99;
const NB_ITERATIONS = 20;

class Rope {
    private readonly nodes: IRopeNode[];
    private readonly segmentLength: number;
    private readonly totalLength: number;

    private readonly flower: Flower;

    private t: number;

    public constructor(segmentLength: number, nbNodes: number) {
        this.segmentLength = segmentLength;
        this.totalLength = segmentLength * nbNodes;
        this.t = 0;

        this.flower = new Flower();

        this.nodes = [];

        this.nodes.push(createRopeNode(200, 200));

        for (let iN = 0; iN < nbNodes; iN++) {
            const angle = 2 * Math.PI * Math.random();
            this.nodes.push(createRopeNode(
                this.nodes[this.nodes.length - 1].pos.x + segmentLength * Math.cos(angle),
                this.nodes[this.nodes.length - 1].pos.y + segmentLength * Math.sin(angle)
            ));
        }
    }

    public draw(plotter: Plotter, minSegmentLength: number): void {
        if (this.nodes.length >= 2) {
            const points = this.computeLine(this.totalLength / minSegmentLength);
            plotter.drawLine(points);
        }

        const flowerAngle = 0;computeAngle(this.nodes[this.nodes.length - 2].pos, this.nodes[this.nodes.length - 1].pos);
        this.flower.draw(plotter, this.nodes[this.nodes.length - 1].pos, flowerAngle);
    }

    public update(dt: number, origin: IPoint = { x: 200, y: 200 }): void {
        this.t += dt;

        this.applyForces();
        this.applyVerlet(dt);

        for (let i = 0; i < NB_ITERATIONS; i++) {
            this.applyConstraints(origin);
        }
    }

    private applyForces(): void {
        for (let iN = 1; iN < this.nodes.length; iN++) {
            this.nodes[iN].acc.y = -0.002 * GRAVITY;
        }

        if (this.t > 1) {
            const angle = Math.random() * 2 * Math.PI;
            const intensity = GRAVITY;
            this.nodes[this.nodes.length - 1].acc.x = (Math.cos(angle) + 0) * intensity;
            this.nodes[this.nodes.length - 1].acc.y = (Math.sin(angle) - 0) * intensity;
            this.t = this.t % 1;
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

    private applyConstraints(origin: IPoint): void {
        const EPSILON = 0.000001;
        this.nodes[0].pos.x = origin.x;
        this.nodes[0].pos.y = origin.y;

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

    private computeLine(minimumPoints: number): IPoint[] {
        let points: IPoint[] = [];
        for (const node of this.nodes) {
            points.push(node.pos);
        }

        while (points.length < minimumPoints) {
            points = Rope.subdivideLine(points, 0.333);
        }
        return points;
    }

    // Chaikin
    private static subdivideLine(sourcePoints: IPoint[], ratio: number): IPoint[] {
        const newPoints: IPoint[] = [];
        newPoints.push(sourcePoints[0]);

        for (let iP = 0; iP < sourcePoints.length - 1; iP++) {
            newPoints.push({
                x: sourcePoints[iP].x * (1 - ratio) + sourcePoints[iP + 1].x * ratio,
                y: sourcePoints[iP].y * (1 - ratio) + sourcePoints[iP + 1].y * ratio,
            });
            newPoints.push({
                x: sourcePoints[iP].x * ratio + sourcePoints[iP + 1].x * (1 - ratio),
                y: sourcePoints[iP].y * ratio + sourcePoints[iP + 1].y * (1 - ratio),
            });
        }

        newPoints.push(sourcePoints[sourcePoints.length - 1]);
        return newPoints;
    }
}

export { Rope };
