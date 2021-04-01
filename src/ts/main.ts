import { Parameters } from "./parameters";
import { Plotter } from "./plotter";
import { Rope } from "./rope";
import { IPoint } from "./interfaces";

import "./page-interface-generated";

interface IFlower {
    rope: Rope;
    attachPoint: IPoint;
}

function main() {
    const plotter = new Plotter();

    // const rope = new Rope(40, 10);
    const flowers: IFlower[] = [];
    for (let i = 0; i < 16; i++) {
        flowers.push({
            rope: new Rope(10 + 40 * Math.random(), 20),
            attachPoint: {
                x: 800 * Math.random(),
                y: 800,
            },
        });
    }

    const maxDt = 1 / 60;
    let lastUpdate = performance.now();
    function mainLoop() {
        const now = performance.now();
        const dt = Math.min(maxDt, 0.001 * (now - lastUpdate));
        lastUpdate = now;

        // rope.update(dt, Parameters.mousePositionInPixels);
        for (const flower of flowers) {
            flower.rope.update(dt, flower.attachPoint);
        }

        plotter.adjustToCanvas();
        plotter.initialize();

        // rope.draw(plotter, 3);
        for (const flower of flowers) {
            flower.rope.draw(plotter, 3);
        }

        requestAnimationFrame(mainLoop);
    }

    requestAnimationFrame(mainLoop);
}

main();
