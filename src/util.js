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
const drawLine = (imageState, prevX, prevY, mouseX, mouseY, stride) => {
    const imageWidth = imageState[0].length;
    const imageHeight = imageState.length;

    // normalize prev coords, mouse coords to one tile
    prevX = (Math.floor(prevX / stride) + 0.5) * stride;
    prevY = (Math.floor(prevY / stride) + 0.5) * stride;

    mouseX = (Math.floor(mouseX / stride) + 0.5) * stride;
    mouseY = (Math.floor(mouseY / stride) + 0.5) * stride;

    // set up start, end coords
    let end = {
        row: Math.floor(mouseY / stride),
        col: Math.floor(mouseX / stride),
    };
    let start = {
        row: Math.floor(prevY / stride),
        col: Math.floor(prevX / stride),
    };
    let curr = {
        row: start.row,
        col: start.col,
    };

    const theta = Math.atan2(mouseY - prevY, mouseX - prevX);
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

        if (curr.row === end.row && curr.col === end.col) {
            break;
        }

        if (direction === "horizontal") {
            curr.row = Math.floor(prevY / stride + i * slope);
            curr.col = start.col + i;
        } else {
            // direction is `vertical`
            curr.row = start.row + i;
            curr.col = Math.floor(prevX / stride - i * slope);
        }

        if (!checkTileBounds(curr.row, curr.col, imageWidth, imageHeight)) {
            break;
        }

        i += increment;
    }

    return outputLine;
};

// const lineCoords = drawLine(
//     imageState,
//     canvas.width / 2,
//     canvas.height / 2,
//     mouse.x,
//     mouse.y,
//     stride
// );
