import { Flower } from "./flower";
import { IPoint } from "./interfaces";
import { Plotter } from "./plotter";

import "./page-interface-generated";
import { PetalsManager } from "./petals-manager";

function main() {
    const plotter = new Plotter();

    const flowers: Flower[] = [];
    for (let i = 0; i < 16; i++) {
        const attachPoint: IPoint = {
            x: 800 * Math.random(),
            y: 800,
        };
        const flowerLength = 400 * (1 + (Math.random() - 0.5));
        flowers.push(new Flower(attachPoint, flowerLength));
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
