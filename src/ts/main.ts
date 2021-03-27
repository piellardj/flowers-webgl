import { Parameters } from "./parameters";
import { Plotter } from "./plotter";
import { Rope } from "./rope";

import "./page-interface-generated";

function main() {
    const plotter = new Plotter();
    const rope = new Rope(20, 10);

    let lastUpdate = performance.now();
    function mainLoop() {
        const now = performance.now();
        const dt = 0.001 * (now - lastUpdate);
        lastUpdate = now;
        rope.update(dt, Parameters.mousePositionInPixels);

        plotter.adjustToCanvas();
        plotter.initialize();
        rope.draw(plotter);
        requestAnimationFrame(mainLoop);
    }

    requestAnimationFrame(mainLoop);
}

main();
