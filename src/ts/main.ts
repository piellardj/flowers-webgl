import { Flower } from "./flower";
import { IPoint } from "./interfaces";
import { PetalsManager } from "./petals-manager";
import { Plotter } from "./plotter";

import "./page-interface-generated";

function createFlower(canvasWidth: number, canvasHeight: number): Flower {
    const attachPoint: IPoint = {
        x: canvasWidth * Math.random(),
        y: canvasHeight,
    };

    const MIN_HEIGHT = 200;
    const flowerLength = MIN_HEIGHT + 0.75 * Math.max(canvasHeight - MIN_HEIGHT, 0) * Math.random();
    return new Flower(attachPoint, flowerLength);
}

const FLOWERS_DENSITY = 0.06;

function main() {
    const plotter = new Plotter();
    const flowers: Flower[] = [];
    const petalsManager = new PetalsManager();

    const maxDt = 1 / 60;
    let lastUpdate = performance.now();
    function mainLoop() {
        const now = performance.now();
        const dt = 0.5 * Math.min(maxDt, 0.001 * (now - lastUpdate));
        lastUpdate = now;

        plotter.adjustToCanvas();

        // CREATION / RECYCLING
        const idealNumberOfFlowers = Math.round(plotter.width * FLOWERS_DENSITY);
        while (flowers.length < idealNumberOfFlowers) {
            flowers.push(createFlower(plotter.width, plotter.height));
        }
        for (let iF = flowers.length - 1; iF >= 0; iF--) {
            if (flowers[iF].isDead(plotter.height)) {
                if (flowers.length > idealNumberOfFlowers) { // kill it
                    flowers.splice(iF, 1);
                    iF--;
                } else { // recycle it
                    flowers[iF] = createFlower(plotter.width, plotter.height);
                }
            }
        }

        // UPDATE
        for (const flower of flowers) {
            flower.update(dt, petalsManager);
        }
        petalsManager.update(dt);

        // DISPLAY
        plotter.initialize();
        petalsManager.draw(plotter);
        for (const flower of flowers) {
            flower.drawStem(plotter);
        }
        for (const flower of flowers) {
            flower.drawCorolla(plotter);
        }

        requestAnimationFrame(mainLoop);
    }

    requestAnimationFrame(mainLoop);
}

main();
