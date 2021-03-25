import { Plotter } from "./plotter";

import "./page-interface-generated";

function main() {
    const plotter = new Plotter();

    function mainLoop() {
        plotter.adjustToCanvas();
        plotter.initialize();
        requestAnimationFrame(mainLoop);
    }

    requestAnimationFrame(mainLoop);
}

main();
