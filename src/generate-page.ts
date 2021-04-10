import * as fs from "fs";
import * as fse from "fs-extra";
import * as path from "path";
import { Demopage } from "webpage-templates";

const data = {
    title: "Flowers",
    description: "Simple project painting flowers in a naive style using rope physics and Verlet integration",
    introduction: [
        "This project paints a flower field in a naive style. Over time, each flower loses its petals to the wind and eventually dies, only to be replaced by a new one.",
        "The stems are modelized as weightless ropes and animated with Verlet integration."
    ],
    githubProjectName: "flowers-webgl",
    additionalLinks: [],
    scriptFiles: [
        "script/main.min.js"
    ],
    indicators: [
    ],
    canvas: {
        width: 512,
        height: 512,
        enableFullscreen: true
    },
    controlsSections: [
        {
            title: "Flowers",
            controls: [
                {
                    type: Demopage.supportedControls.Range,
                    title: "Density",
                    id: "flowers-range-id",
                    min: 0,
                    max: 1,
                    value: 0.3,
                    step: 0.05
                },
                {
                    type: Demopage.supportedControls.Range,
                    title: "Flying petals",
                    id: "petals-droprate-range-id",
                    min: 0,
                    max: 1,
                    value: 0.2,
                    step: 0.05
                },
                {
                    type: Demopage.supportedControls.Range,
                    title: "Petals count",
                    id: "petals-count-range-id",
                    min: 0,
                    max: 50,
                    value: 10,
                    step: 1
                },
            ]
        },
        {
            title: "Simulation",
            controls: [
                {
                    type: Demopage.supportedControls.Range,
                    title: "Wind",
                    id: "wind-range-id",
                    min: 0,
                    max: 1,
                    value: 0.5,
                    step: 0.05
                },
                {
                    type: Demopage.supportedControls.Range,
                    title: "Speed",
                    id: "speed-range-id",
                    min: 0,
                    max: 1,
                    value: 0.5,
                    step: 0.05
                },
                {
                    type: Demopage.supportedControls.Range,
                    title: "Dampening",
                    id: "dampening-range-id",
                    min: 0,
                    max: 1,
                    value: 0.7,
                    step: 0.05
                },
                {
                    type: Demopage.supportedControls.Checkbox,
                    title: "Avoid mouse",
                    id: "flee-mouse-checkbox-id",
                    checked: false
                },
                {
                    type: Demopage.supportedControls.Button,
                    id: "reset-button-id",
                    label: "Reset"
                }
            ]
        },
        {
            title: "Appearance",
            controls: [
                {
                    type: Demopage.supportedControls.ColorPicker,
                    title: "Background",
                    id: "background-color-id",
                    defaultValueHex: "#DCEEFF"
                },
                {
                    type: Demopage.supportedControls.ColorPicker,
                    title: "Lines",
                    id: "lines-color-id",
                    defaultValueHex: "#000000"
                },
                {
                    type: Demopage.supportedControls.Range,
                    title: "Petals opacity",
                    id: "petals-opacity-range-id",
                    min: 0.05,
                    max: 1,
                    value: 0.2,
                    step: 0.05
                },
                {
                    type: Demopage.supportedControls.Checkbox,
                    title: "Single color",
                    id: "single-petal-color-checkbox-id",
                    checked: false
                },
                {
                    type: Demopage.supportedControls.ColorPicker,
                    title: "Petal color",
                    id: "petal-color-id",
                    defaultValueHex: "#FF0000"
                }
            ]
        },
        {
            title: "Output",
            controls: [
                {
                    type: Demopage.supportedControls.Button,
                    id: "download-button-id",
                    label: "Download"
                }
            ]
        }
    ],
};

const SRC_DIR = path.resolve(__dirname);
const DEST_DIR = path.resolve(__dirname, "..", "docs");
const minified = true;

const buildResult = Demopage.build(data, DEST_DIR, {
    debug: !minified,
});

// disable linting on this file because it is generated
buildResult.pageScriptDeclaration = "/* tslint:disable */\n" + buildResult.pageScriptDeclaration;

const SCRIPT_DECLARATION_FILEPATH = path.resolve(__dirname, ".", "ts", "page-interface-generated.ts");
fs.writeFileSync(SCRIPT_DECLARATION_FILEPATH, buildResult.pageScriptDeclaration);

fse.copySync(path.join(SRC_DIR, "shaders"), path.join(DEST_DIR, "shaders"));
