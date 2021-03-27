import { IPoint } from "./interfaces";

import "./page-interface-generated";

/* === IDs ============================================================ */
const controlId = {
};

/* === OBSERVERS ====================================================== */

/* === INTERFACE ====================================================== */
class Parameters {
    public static get mousePositionInPixels(): IPoint {
        const mousePosition = Page.Canvas.getMousePosition();
        if (mousePosition.length === 2) {
            const canvasSize = Page.Canvas.getSize();
            return {
                x: canvasSize[0] * mousePosition[0],
                y: canvasSize[1] * mousePosition[1],
            };
        } else {
             // handles a bug where mousePosition is empty when the page is initializing
            return { x: 0, y: 0 };
        }
    }

    private constructor() { }
}

export {
    Parameters,
};
