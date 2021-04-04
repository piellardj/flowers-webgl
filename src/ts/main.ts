import { FlowersManager } from "./flowers-manager";
import { PetalsManager } from "./petals-manager";
import { Plotter } from "./plotter";

import "./page-interface-generated";

function main() {
    const plotter = new Plotter();
    const flowersManager = new FlowersManager();
    const petalsManager = new PetalsManager();

    const maxDt = 1 / 60;
    let lastUpdate = performance.now();
    function mainLoop() {
        const now = performance.now();
        const dt = 0.5 * Math.min(maxDt, 0.001 * (now - lastUpdate));
        lastUpdate = now;

        plotter.adjustToCanvas();

        flowersManager.manage(plotter.width, plotter.height);

        flowersManager.update(dt, petalsManager);
        petalsManager.update(dt);

        plotter.initialize();
        petalsManager.draw(plotter);
        flowersManager.draw(plotter);

        requestAnimationFrame(mainLoop);
    }

    requestAnimationFrame(mainLoop);
}

main();
