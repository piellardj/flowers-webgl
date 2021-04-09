import { IPoint } from "./interfaces";

import "./page-interface-generated";
import { Color } from "./plotting/color";

/* === IDs ============================================================ */
const controlId = {
    FLOWERS_RANGE: "flowers-range-id",
    WIND_RANGE: "wind-range-id",
    SPEED_RANGE: "speed-range-id",
    DAMPENING_RANGE: "dampening-range-id",
    FLEE_MOUSE_CHECKBOX: "flee-mouse-checkbox-id",
    RESET_BUTTON: "reset-button-id",
    BACKGROUND_COLORPICKER: "background-color-id",
    LINES_COLORPICKER: "lines-color-id",
    SINGLE_PETAL_COLOR_CHECKBOX: "single-petal-color-checkbox-id",
    PETAL_COLORPICKER: "petal-color-id",
    DOWNLOAD_BUTTON: "download-button-id",
};

/* === OBSERVERS ====================================================== */
type Observer = () => unknown;
function callObservers(observers: Observer[]) {
    for (const observer of observers) {
        observer();
    }
}

const resetObservers: Observer[] = [];
const downloadObservers: Observer[] = [];

function getColor(id: string): Color {
    const rgb = Page.ColorPicker.getValue(id);
    return new Color(rgb.r, rgb.g, rgb.b);
}

let backgroundColor: Color = getColor(controlId.BACKGROUND_COLORPICKER);
Page.ColorPicker.addObserver(controlId.BACKGROUND_COLORPICKER, () => { backgroundColor = getColor(controlId.BACKGROUND_COLORPICKER); });

let linesColor: Color = getColor(controlId.LINES_COLORPICKER);
Page.ColorPicker.addObserver(controlId.LINES_COLORPICKER, () => { linesColor = getColor(controlId.LINES_COLORPICKER); });

let petalsColor: Color = getColor(controlId.PETAL_COLORPICKER);
Page.ColorPicker.addObserver(controlId.PETAL_COLORPICKER, () => { petalsColor = getColor(controlId.PETAL_COLORPICKER); });

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

    public static get fleeMouse(): boolean {
        return Page.Checkbox.isChecked(controlId.FLEE_MOUSE_CHECKBOX);
    }

    public static addResetObserver(observer: Observer): void {
        resetObservers.push(observer);
    }

    public static get backgroundColor(): Color {
        return backgroundColor;
    }

    public static get linesColor(): Color {
        return linesColor;
    }

    public static get singlePetalColor(): boolean {
        return Page.Checkbox.isChecked(controlId.SINGLE_PETAL_COLOR_CHECKBOX);
    }

    public static get petalColor(): Color {
        return petalsColor;
    }

    public static addDownloadObserver(observer: Observer): void {
        downloadObservers.push(observer);
    }

    private constructor() { }
}

function updatePetalColorsVisibility(): void {
    const visible = Page.Checkbox.isChecked(controlId.SINGLE_PETAL_COLOR_CHECKBOX);
    Page.Controls.setVisibility(controlId.PETAL_COLORPICKER, visible);
}
Page.Checkbox.addObserver(controlId.SINGLE_PETAL_COLOR_CHECKBOX, updatePetalColorsVisibility);
updatePetalColorsVisibility();

Page.Button.addObserver(controlId.RESET_BUTTON, () => {
    callObservers(resetObservers);
});

Page.Button.addObserver(controlId.DOWNLOAD_BUTTON, () => {
    callObservers(downloadObservers);
});

export {
    Parameters,
};
