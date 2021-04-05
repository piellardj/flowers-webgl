import { IPoint } from "./interfaces";

import "./page-interface-generated";

/* === IDs ============================================================ */
const controlId = {
    FLOWERS_RANGE: "flowers-range-id",
    WIND_RANGE: "wind-range-id",
    SPEED_RANGE: "speed-range-id",
    DAMPENING_RANGE: "dampening-range-id",
    RESET_BUTTON: "reset-button-id",
    BACKGROUND_COLORPICKER: "background-color-id",
    LINES_COLORPICKER: "lines-color-id",
    DOWNLOAD_BUTTON: "download-button-id",
};

/* === OBSERVERS ====================================================== */
type Observer = () => unknown;

const resetObservers: Observer[] = [];
Page.Button.addObserver(controlId.RESET_BUTTON, () => {
    for (const observer of resetObservers) {
        observer();
    }
});

const downloadObservers: Observer[] = [];
Page.Button.addObserver(controlId.DOWNLOAD_BUTTON, () => {
    for (const observer of downloadObservers) {
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

    public static get flowersDensity(): number {
        return Page.Range.getValue(controlId.FLOWERS_RANGE) * 0.25;
    }

    public static get wind(): number {
        return Page.Range.getValue(controlId.WIND_RANGE);
    }

    public static get speed(): number {
        return Page.Range.getValue(controlId.SPEED_RANGE);
    }

    public static get dampening(): number {
        return 1 - 0.01 * Page.Range.getValue(controlId.DAMPENING_RANGE);
    }

    public static addResetObserver(observer: Observer): void {
        resetObservers.push(observer);
    }

    public static get backgroundColor(): string {
        return Page.ColorPicker.getValueHex(controlId.BACKGROUND_COLORPICKER);
    }

    public static get linesColor(): string {
        return Page.ColorPicker.getValueHex(controlId.LINES_COLORPICKER);
    }

    public static addDownloadObserver(observer: Observer): void {
        downloadObservers.push(observer);
    }
    private constructor() { }
}

export {
    Parameters,
};
