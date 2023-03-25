import { checkTileBounds, drawLine } from "./util";

export const runListeners = (
    previewCanvas,
    mouse,
    selectedColor,
    selectedTool,
    imageWidth,
    imageHeight,
    updatePixels,
    setPreviewState
) => {
    let stride = previewCanvas.width / imageWidth;

    const baseMouseMove = (e) => {
        const bounding = previewCanvas.getBoundingClientRect();
        mouse.x = e.clientX - bounding.left;
        mouse.y = e.clientY - bounding.top;
        setPreviewState((curr) => {
            let cursorRow = Math.floor(mouse.y / stride);
            let cursorCol = Math.floor(mouse.x / stride);
            if (cursorRow === curr.cursorRow && cursorCol === curr.cursorCol) {
                // no change
                return curr;
            } else {
                return { ...curr, cursorRow, cursorCol };
            }
        });
    };
    const baseMouseDown = (e) => {
        mouse.down = true;
    };
    const baseMouseUp = () => {
        mouse.down = false;
    };

    let handleMouseMove, handleMouseDown, handleMouseUp;

    const addCoreListeners = () => {
        window.addEventListener("mousemove", handleMouseMove);
        previewCanvas.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
    };
    const removeCoreListeners = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        previewCanvas.removeEventListener("mousedown", handleMouseDown);
        window.removeEventListener("mouseup", handleMouseUp);
    };
    if (selectedTool.name === "line") {
        let lineStart = null,
            linePixels = null;

        const updatePreviewedLine = () => {
            // get line pixels
            linePixels = drawLine(
                imageWidth,
                imageHeight,
                Math.floor(lineStart.y / stride),
                Math.floor(lineStart.x / stride),
                Math.floor(mouse.y / stride),
                Math.floor(mouse.x / stride),
                selectedColor
            );

            // set preview state so it displays
            setPreviewState((curr) => ({
                ...curr,
                previewPixels: linePixels,
            }));
        };

        handleMouseMove = (e) => {
            console.log("Mouse linestart", lineStart);
            baseMouseMove(e);
            if (lineStart !== null) {
                updatePreviewedLine();
            }
        };
        handleMouseDown = (e) => {
            baseMouseDown(e);
            if (lineStart === null) {
                lineStart = { x: mouse.x, y: mouse.y };
                updatePreviewedLine();
            } else if (lineStart !== null) {
                // place the line
                lineStart = null;
                updatePixels(linePixels);
                setPreviewState((curr) => ({ ...curr, previewPixels: [] }));
            }
        };
        handleMouseUp = (e) => {
            baseMouseUp(e);
        };

        addCoreListeners();
        return () => {
            removeCoreListeners();
        };
    } else if (selectedTool.name === "brush") {
        const placeColor = () => {
            let stride = previewCanvas.width / imageWidth;
            let cursorRow = Math.floor(mouse.y / stride);
            let cursorCol = Math.floor(mouse.x / stride);
            if (
                !checkTileBounds(cursorRow, cursorCol, imageWidth, imageHeight)
            ) {
                return;
            }
            updatePixels([
                {
                    row: cursorRow,
                    col: cursorCol,
                    color: selectedColor,
                },
            ]);
        };

        handleMouseMove = (e) => {
            baseMouseMove(e);
            if (mouse.down) {
                placeColor();
            }
        };
        handleMouseDown = (e) => {
            baseMouseDown(e);
            placeColor();
        };
        handleMouseUp = (e) => {
            baseMouseUp(e);
        };

        addCoreListeners();
        return () => {
            removeCoreListeners();
        };
    }
};
