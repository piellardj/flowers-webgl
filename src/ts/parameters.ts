import { IPoint } from "./interfaces";

import "./page-interface-generated";

/* === IDs ============================================================ */
const controlId = {
    RESET_BUTTON: "reset-button-id",
};

/* === OBSERVERS ====================================================== */
type Observer = () => unknown;

const resetObservers: Observer[] = [];
Page.Button.addObserver(controlId.RESET_BUTTON, () => {
    for (const observer of resetObservers) {
        observer();
    }
});

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

    public static addResetObserver(observer: Observer): void {
        resetObservers.push(observer);
    }

    private constructor() { }
}

export {
    Parameters,
};
