import { Flower } from "./flower";
import { IPoint } from "./interfaces";
import { Plotter } from "./plotter";

import "./page-interface-generated";
import { PetalsManager } from "./petals-manager";

const FLOOR_LEVEL = 954;

function createFlower(): Flower {
    const canvasSize = Page.Canvas.getSize();

    const attachPoint: IPoint = {
        x: canvasSize[0] * Math.random(),
        y: canvasSize[1],
    };

    const MIN_HEIGHT = 200;
    const flowerLength = MIN_HEIGHT + 0.75 * Math.max(canvasSize[1] - MIN_HEIGHT, 0) * Math.random();
    return new Flower(attachPoint, flowerLength);
}

function main() {
    const plotter = new Plotter();

    const flowers: Flower[] = [];
    for (let i = 0; i < 64; i++) {
        const newFlower = createFlower();
        flowers.push(newFlower);
    }

    const petalsManager = new PetalsManager();

    const maxDt = 1 / 60;
    let lastUpdate = performance.now();
    function mainLoop() {
        const now = performance.now();
        const dt = 0.5 * Math.min(maxDt, 0.001 * (now - lastUpdate));
        lastUpdate = now;

        for (const flower of flowers) {
            flower.update(dt, petalsManager);
        }
        petalsManager.update(dt);

        const canvasSize = Page.Canvas.getSize();

        for (let iF = 0; iF < flowers.length; iF++) {
            if (flowers[iF].isDead(canvasSize[1])) {
                flowers[iF] = createFlower();
            }
        }

        plotter.adjustToCanvas();
        plotter.initialize();
        petalsManager.draw(plotter);
        for (const flower of flowers) {
            flower.draw(plotter);
        }

        requestAnimationFrame(mainLoop);
    }

    requestAnimationFrame(mainLoop);
}

main();
