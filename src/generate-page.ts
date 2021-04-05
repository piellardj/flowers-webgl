import * as fs from "fs";
import * as path from "path";
import { Demopage } from "webpage-templates";

const data = {
    title: "TITLE",
    description: "DESCRIPTION",
    introduction: [
        "INTRODUCTION"
    ],
    githubProjectName: "flowers",
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
            title: "Simulation",
            controls: [
                {
                    type: Demopage.supportedControls.Range,
                    title: "Flowers",
                    id: "flowers-range-id",
                    min: 0,
                    max: 1,
                    value: 0.3,
                    step: 0.05
                },
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
                    type: Demopage.supportedControls.Range,
                    title: "Flee mouse",
                    id: "flee-mouse-range-id",
                    min: 0,
                    max: 1,
                    value: 0.6,
                    step: 0.05
                },
                {
                    type: Demopage.supportedControls.Button,
                    id: "reset-button-id",
                    label: "Reset"
                }
            ]
        },
        {
            title: "Output",
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
                },
                {
                    type: Demopage.supportedControls.Button,
                    id: "download-button-id",
                    label: "Download"
                }
            ]
        }
    ],
};

const DEST_DIR = path.resolve(__dirname, "..", "docs");
const minified = true;

const buildResult = Demopage.build(data, DEST_DIR, {
    debug: !minified,
});

// disable linting on this file because it is generated
buildResult.pageScriptDeclaration = "/* tslint:disable */\n" + buildResult.pageScriptDeclaration;

const SCRIPT_DECLARATION_FILEPATH = path.resolve(__dirname, ".", "ts", "page-interface-generated.ts");
fs.writeFileSync(SCRIPT_DECLARATION_FILEPATH, buildResult.pageScriptDeclaration);
