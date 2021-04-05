import { FlowersManager } from "./flowers-manager";
import { Parameters } from "./parameters";
import { PlotterCanvas2D } from "./plotting/plotter-canvas-2d";

import "./page-interface-generated";

function main() {
    const plotter = new PlotterCanvas2D();
    const flowersManager = new FlowersManager();

    Parameters.addResetObserver(() => flowersManager.reset());

    const maxDt = 1 / 60;
    let lastUpdate = performance.now();
    function mainLoop() {
        const now = performance.now();
        const dt = 0.5 * Math.min(maxDt, 0.001 * (now - lastUpdate));
        lastUpdate = now;

        plotter.adjustToCanvas();

        flowersManager.manage(plotter.width, plotter.height);
        flowersManager.update(dt);

        plotter.initialize();
        flowersManager.draw(plotter);

        requestAnimationFrame(mainLoop);
    }

    requestAnimationFrame(mainLoop);
}

main();
