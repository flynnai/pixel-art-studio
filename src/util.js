export const hexToColor = (hex) => "#" + hex.toString(16).padStart(8, "0");
export const joinClasses = (...args) => args.filter(Boolean).join(" ");

// take inverse of color, weighted-average with black according to alpha
export const invertHexColor = (hex) => {
    let r = 0xff - ((hex >> (6 * 4)) & 0xff);
    let g = 0xff - ((hex >> (4 * 4)) & 0xff);
    let b = 0xff - ((hex >> (2 * 4)) & 0xff);
    let alpha = hex & 0x000000ff;

    r = r * alpha + 0x00 * (0xff - alpha);
    g = g * alpha + 0x00 * (0xff - alpha);
    b = b * alpha + 0x00 * (0xff - alpha);

    r /= 0xff;
    g /= 0xff;
    b /= 0xff;
    return (
        ((r << (6 * 4)) | (g << (4 * 4)) | (b << (2 * 4)) | 0x000000ff) >>> 0
    );
};

export const checkTileBounds = (row, col, width, height) => {
    return !(col < 0 || col >= width || row < 0 || row >= height);
};

export // returns array of {row, col} pairs corresponding to line
const drawLine = (
    imageWidth,
    imageHeight,
    prevRow,
    prevCol,
    mouseRow,
    mouseCol,
    color
) => {
    let curr = {
        row: prevRow,
        col: prevCol,
        color,
    };

    // find slopes, and which 2 octants we're in
    const theta = Math.atan2(mouseRow - prevRow, mouseCol - prevCol);
    let direction, increment, slope;
    if (
        Math.abs(theta) <= Math.PI / 4 ||
        theta >= (Math.PI * 3) / 4 ||
        theta <= (Math.PI * -3) / 4
    ) {
        direction = "horizontal";
        slope = Math.tan(theta);
        increment = Math.abs(theta) <= Math.PI / 4 ? 1 : -1;
    } else {
        direction = "vertical";
        slope = Math.tan(theta + Math.PI / 2);
        increment = theta > 0 ? 1 : -1;
    }

    let i = 0;
    const outputLine = [];
    while (true) {
        outputLine.push({ ...curr });

        if (curr.row === mouseRow && curr.col === mouseCol) {
            break;
        }

        if (direction === "horizontal") {
            curr.row = Math.floor(prevRow + 0.5 + i * slope);
            curr.col = prevCol + i;
        } else {
            // direction is `vertical`
            curr.row = prevRow + i;
            curr.col = Math.floor(prevCol + 0.5 - i * slope);
        }

        if (!checkTileBounds(curr.row, curr.col, imageWidth, imageHeight)) {
            break;
        }

        i += increment;
    }

    return outputLine;
};

export const downloadPNG = (imageState, filename) => {
    // create small canvas, draw all pixels
    const tempCanvas = document.createElement("CANVAS");
    tempCanvas.width = imageState[0].length;
    tempCanvas.height = imageState.length;
    const ctx = tempCanvas.getContext("2d");
    for (let row = 0; row < tempCanvas.height; row++) {
        for (let col = 0; col < tempCanvas.width; col++) {
            ctx.fillStyle = hexToColor(imageState[row][col]);
            ctx.fillRect(col, row, 1, 1);
        }
    }

    // create link to data URL, click it
    let dataURL = tempCanvas.toDataURL("image/png");
    let a = document.createElement("a");
    a.href = dataURL;
    a.download = filename;
    a.click();
};

export const addUndoAction = (undoList, undoAction, redoAction) => {
    const { index, functorStack } = undoList;
    if (index !== functorStack.length) {
        // remove remaining functors (can no longer redo)
        functorStack.splice(index);
    }
    functorStack.push({ undo: undoAction, redo: redoAction });
    undoList.index++;
};

export const canUndo = (undoList) => {
    return undoList.index > 0;
};

export const canRedo = (undoList) => {
    return undoList.index < undoList.functorStack.length;
};

// returns whether undo was successful (history ran out or not)
export const undo = (undoList) => {
    if (!canUndo(undoList)) {
        return false;
    }
    undoList.functorStack[--undoList.index].undo();
    return true;
};

// returns whether redo was successful (not enough items or not)
export const redo = (undoList) => {
    if (!canRedo(undoList)) {
        return false;
    }
    undoList.functorStack[undoList.index++].redo();
    return true;
};
