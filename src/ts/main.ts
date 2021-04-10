import { FlowersManager } from "./flowers-manager";
import { ForceField } from "./force-field";
import { downloadTextFile } from "./helpers";
import { Parameters } from "./parameters";
import { Plotter } from "./plotting/plotter";
import { PlotterCanvas2D } from "./plotting/plotter-canvas-2d";
import { PlotterCanvas } from "./plotting/plotter-canvas-base";
import { PlotterSvg } from "./plotting/plotter-svg";

import "./page-interface-generated";
import { PlotterCanvasWebGL } from "./plotting/plotter-canvas-webgl";

function plot(flowersManager: FlowersManager, plotter: Plotter): void {
    plotter.initialize(Parameters.backgroundColor, Parameters.linesColor, Parameters.petalsOpacity);
    flowersManager.draw(plotter);
    plotter.finalize();
}

function main() {
    const plotter: PlotterCanvas = Parameters.useCanvas2D ? new PlotterCanvas2D() : new PlotterCanvasWebGL();
    const flowersManager = new FlowersManager();

    Parameters.addResetObserver(() => { flowersManager.reset(); });
    Parameters.addDownloadObserver(() => { exportAsSvg(flowersManager, plotter.width, plotter.height); });

    const maxDt = 1 / 60;
    let lastUpdate = performance.now();
    function mainLoop() {
        const now = performance.now();
        const dt = Parameters.speed * Math.min(maxDt, 0.001 * (now - lastUpdate));
        lastUpdate = now;

        plotter.adjustToCanvas();

        flowersManager.manage(plotter.width, plotter.height);

        const forceField = new ForceField(Parameters.mousePositionInPixels, 500);
        flowersManager.update(dt, forceField);

        plot(flowersManager, plotter);

        requestAnimationFrame(mainLoop);
    }

    requestAnimationFrame(mainLoop);
}

function exportAsSvg(flowersManager: FlowersManager, width: number, height: number): void {
    const plotter = new PlotterSvg(width, height);
    plot(flowersManager, plotter);

    const svgText = plotter.toString();
    downloadTextFile("flowers.svg", svgText);
}

main();
