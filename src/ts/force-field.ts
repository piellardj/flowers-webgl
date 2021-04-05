import { IPoint, IVector } from "./interfaces";
import { Parameters } from "./parameters";

class ForceField {
    private readonly fleeMouseFactor: number;

    public constructor(private readonly mousePosition: IPoint, private readonly maxInfluenceDistance: number) {
        this.fleeMouseFactor = Parameters.fleeMouseFactor;
    }

    public computeForce(location: IPoint): IVector {
        const fromMouseX = location.x - this.mousePosition.x;
        const fromMouseY = location.y - this.mousePosition.y;
        const distanceToMouse = Math.sqrt(fromMouseX * fromMouseX + fromMouseY * fromMouseY);

        if (distanceToMouse > this.maxInfluenceDistance) {
            return { x: 0, y: 0 };
        }

        const mouseInfluence = this.fleeMouseFactor * (0.5 + Math.cos(Math.PI * distanceToMouse / this.maxInfluenceDistance));
        return {
            x: mouseInfluence * mouseInfluence * fromMouseX / distanceToMouse,
            y: mouseInfluence * mouseInfluence * fromMouseY / distanceToMouse,
        };
    }
}

export { ForceField };
