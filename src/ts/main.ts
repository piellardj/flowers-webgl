import "./page-interface-generated";

function main() {
    function mainLoop() {
        requestAnimationFrame(mainLoop);
    }

    requestAnimationFrame(mainLoop);
}

main();
