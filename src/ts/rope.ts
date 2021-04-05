import { IPoint, IVector } from "./interfaces";
import { Line, Plotter } from "./plotting/plotter";

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

const DAMPENING = 0.999;
const NB_ITERATIONS = 8;

class Rope {
    private readonly nodes: IRopeNode[];
    private readonly segmentLength: number;
    private readonly totalLength: number;

    public constructor(startingPoint: IPoint, segmentLength: number, nbNodes: number) {
        this.segmentLength = segmentLength;
        this.totalLength = segmentLength * nbNodes;

        this.nodes = [];
        this.nodes.push(createRopeNode(startingPoint.x, startingPoint.y));
        for (let iN = 0; iN < nbNodes; iN++) {
            const angle = 2 * Math.PI * Math.random();
            this.nodes.push(createRopeNode(
                this.nodes[this.nodes.length - 1].pos.x + segmentLength * Math.cos(angle),
                this.nodes[this.nodes.length - 1].pos.y + Math.abs(segmentLength * Math.sin(angle))
            ));
        }
    }

    public getDrawableLine(minSegmentLength: number): Line {
        return this.computeSmoothLine(this.totalLength / minSegmentLength);
    }

    public update(dt: number, origin: IPoint, endAcceleration: IVector): void {
        this.applyForces(endAcceleration);
        this.applyVerlet(dt);

        for (let i = 0; i < NB_ITERATIONS; i++) {
            this.applyConstraints(origin);
        }
    }

    public get endPosition(): IPoint {
        return this.nodes[this.nodes.length - 1].pos;
    }

    public get highestPoint(): number {
        let highest = 1000000;
        for (const node of this.nodes) {
            if (node.pos.y < highest) {
                highest = node.pos.y;
            }
        }
        return highest;
    }

    private applyForces(endAcceleration: IVector): void {
        for (let iN = 1; iN < this.nodes.length; iN++) {
            this.nodes[iN].acc.x = 0;
            this.nodes[iN].acc.y = 0;
        }

        this.nodes[this.nodes.length - 1].acc.x += endAcceleration.x;
        this.nodes[this.nodes.length - 1].acc.y += endAcceleration.y;
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

    private computeSmoothLine(minimumPoints: number): IPoint[] {
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
