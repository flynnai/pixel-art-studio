import { checkTileBounds, drawLine } from "./util";

// given array of {row, col, color}, update state if necessary
const maybeUpdateImageState = (updateList) => {
    return (currImageState) => {
        // check for changes
        let somethingChanged = false;
        for (const { row, col, color } of updateList) {
            if (currImageState[row][col] !== color) {
                somethingChanged = true;
                break;
            }
        }
        if (!somethingChanged) {
            return currImageState;
        }

        return currImageState.map((pixelRow, row) =>
            !updateList.some((update) => update.row === row)
                ? pixelRow
                : pixelRow.map((pixel, col) => {
                      const find = updateList.find(
                          (update) => update.row === row && update.col === col
                      );
                      return find ? find.color : pixel;
                  })
        );
    };
};

export const runListeners = (
    previewCanvas,
    mouse,
    selectedColor,
    selectedTool,
    imageWidth,
    imageHeight,
    setImageState,
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
        handleMouseMove = (e) => {
            console.log("Mouse linestart", lineStart);
            baseMouseMove(e);
            if (lineStart !== null) {
                // update previewed line
                linePixels = drawLine(
                    imageWidth,
                    imageHeight,
                    Math.floor(lineStart.y / stride),
                    Math.floor(lineStart.x / stride),
                    Math.floor(mouse.y / stride),
                    Math.floor(mouse.x / stride),
                    selectedColor
                );

                setPreviewState((curr) => ({
                    ...curr,
                    previewPixels: linePixels,
                }));
            }
        };
        handleMouseDown = (e) => {
            baseMouseDown(e);
            if (lineStart === null) {
                lineStart = { x: mouse.x, y: mouse.y };
                linePixels = drawLine(
                    imageWidth,
                    imageHeight,
                    Math.floor(lineStart.y / stride),
                    Math.floor(lineStart.x / stride),
                    Math.floor(mouse.y / stride),
                    Math.floor(mouse.x / stride),
                    selectedColor
                );
            }
        };
        handleMouseUp = (e) => {
            baseMouseUp(e);
            if (lineStart !== null) {
                // place the line
                lineStart = null;
                setImageState(maybeUpdateImageState(linePixels));
                setPreviewState((curr) => ({ ...curr, previewPixels: [] }));
            }
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
            setImageState(
                maybeUpdateImageState([
                    {
                        row: cursorRow,
                        col: cursorCol,
                        color: selectedColor,
                    },
                ])
            );
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
