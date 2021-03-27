import { Plotter } from "./plotter";

import "./page-interface-generated";
import { Rope } from "./rope";

function main() {
    const plotter = new Plotter();
    const rope = new Rope(20, 10);

    let lastUpdate = performance.now();
    function mainLoop() {
        const now = performance.now();
        const dt = 0.001 * (now - lastUpdate);
        lastUpdate = now;

        rope.update(dt);
        plotter.adjustToCanvas();
        plotter.initialize();
        rope.draw(plotter);
        requestAnimationFrame(mainLoop);
    }

    requestAnimationFrame(mainLoop);
}

main();
