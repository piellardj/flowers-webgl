import { Flower } from "./flower";
import { IPoint } from "./interfaces";
import { Plotter } from "./plotter";

import "./page-interface-generated";
import { PetalsManager } from "./petals-manager";

const FLOOR_LEVEL = 800;

function createFlower(): Flower {
    const attachPoint: IPoint = {
        x: 800 * Math.random(),
        y: FLOOR_LEVEL,
    };
    const flowerLength = 400 * (1 + (Math.random() - 0.5));
    return new Flower(attachPoint, flowerLength);
}

function main() {
    const plotter = new Plotter();

    const flowers: Flower[] = [];
    for (let i = 0; i < 16; i++) {
        const newFlower = createFlower();
        flowers.push(newFlower);
    }

    const petalsManager = new PetalsManager();

    const maxDt = 1 / 60;
    let lastUpdate = performance.now();
    function mainLoop() {
        const now = performance.now();
        const dt = Math.min(maxDt, 0.001 * (now - lastUpdate));
        lastUpdate = now;

        for (const flower of flowers) {
            flower.update(dt, petalsManager);
        }
        petalsManager.update(dt);

        for (let iF = 0; iF < flowers.length; iF++) {
            if (flowers[iF].isDead(FLOOR_LEVEL)) {
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
