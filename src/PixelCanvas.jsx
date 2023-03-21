import { useRef, useEffect } from "react";
import styles from "./PixelCanvas.module.scss";
import { hexToColor } from "./util";

// const hexToColor = (hex) => "rgba"+ hex.toString(16).padStart(8, "0");

// take inverse of color, weighted-average with black according to alpha
const invertHexColor = (hex) => {
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

const checkTileBounds = (row, col, width, height) => {
    return !(col < 0 || col >= width || row < 0 || row >= height);
};

const paintCanvas = (canvas, ctx, imageState, mouse) => {
    const imageHeight = imageState.length;
    const imageWidth = imageState[0].length;

    // note: maybe Math.round() would be better here, for avoiding lines between shapes
    const stride = canvas.width / imageWidth;

    // fill in transparent, alternating squares
    let altScale = 0.5;
    let altStride = stride * altScale;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < imageHeight / altScale; row++) {
        for (let col = 0; col < imageWidth / altScale; col++) {
            if ((row + col) % 2) {
                ctx.fillStyle = "#ddd";
                ctx.fillRect(
                    col * altStride,
                    row * altStride,
                    altStride,
                    altStride
                );
            }
        }
    }

    // color in our image
    for (let row = 0; row < imageHeight; row++) {
        for (let col = 0; col < imageWidth; col++) {
            ctx.fillStyle = hexToColor(imageState[row][col]);
            ctx.fillRect(col * stride, row * stride, stride, stride);
        }
    }

    // color in cursor
    let cursorRow = Math.floor(mouse.y / stride);
    let cursorCol = Math.floor(mouse.x / stride);
    if (checkTileBounds(cursorRow, cursorCol, imageWidth, imageHeight)) {
        ctx.strokeStyle = hexToColor(
            invertHexColor(imageState[cursorRow][cursorCol])
        );
    } else {
        ctx.strokeStyle = "black";
    }

    ctx.lineWidth = 2;
    ctx.strokeRect(cursorCol * stride, cursorRow * stride, stride, stride);
};

// assumes `imageState` is a 2D, rectangular array of hex digits, at least size 1 in width and height
function PixelCanvas({ imageState, setImageState, selectedColor }) {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0, down: false });

    useEffect(() => {
        const imageWidth = imageState[0].length;
        const imageHeight = imageState.length;
        // capture mouse movements, store in ref to avoid rerender
        const mouse = mouseRef.current;
        const canvas = canvasRef.current;
        if (canvas) {
            const placeColor = () => {
                let stride = canvas.width / imageWidth;
                let cursorRow = Math.floor(mouse.y / stride);
                let cursorCol = Math.floor(mouse.x / stride);
                console.log(imageWidth, imageHeight);
                if (
                    !checkTileBounds(
                        cursorRow,
                        cursorCol,
                        imageWidth,
                        imageHeight
                    )
                ) {
                    return;
                }
                setImageState(
                    imageState.map((pixelRow, rowNum) =>
                        rowNum !== cursorRow
                            ? pixelRow
                            : pixelRow.map((pixelCol, colNum) =>
                                  colNum !== cursorCol
                                      ? pixelCol
                                      : selectedColor
                              )
                    )
                );
            };
            const handleMouseMove = (e) => {
                const bounding = canvas.getBoundingClientRect();
                mouse.x = e.clientX - bounding.left;
                mouse.y = e.clientY - bounding.top;
                if (mouse.down) {
                    placeColor();
                }
            };
            const handleMouseDown = (e) => {
                placeColor();
                mouse.down = true;
            };
            const handleMouseUp = () => {
                mouse.down = false;
            };

            window.addEventListener("mousemove", handleMouseMove);
            canvas.addEventListener("mousedown", handleMouseDown);
            window.addEventListener("mouseup", handleMouseUp);
            return () => {
                window.removeEventListener("mousemove", handleMouseMove);
                canvas.removeEventListener("mousedown", handleMouseDown);
                window.removeEventListener("mouseup", handleMouseUp);
            };
        }
    }, [canvasRef.current, imageState, selectedColor]);

    useEffect(() => {
        // continuously repaint canvas
        const canvas = canvasRef.current;
        if (canvas) {
            let request = null;

            const animate = () => {
                const ctx = canvas.getContext("2d");
                paintCanvas(canvas, ctx, imageState, mouseRef.current);
                request = requestAnimationFrame(animate);
            };
            request = requestAnimationFrame(animate);

            return () => {
                cancelAnimationFrame(request);
            };
        }
    }, [imageState, canvasRef.current]);

    function downloadPNG() {
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
        a.download = "my-image.png";
        a.click();
    }

    return (
        <>
            <canvas ref={canvasRef} width="640" height="640"></canvas>
            <button onClick={downloadPNG}>download</button>
        </>
    );
}

export default PixelCanvas;
