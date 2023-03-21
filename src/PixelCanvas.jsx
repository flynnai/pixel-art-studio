import { useRef, useEffect } from "react";
import styles from "./PixelCanvas.module.scss";

const hexToColor = (hex) => "#" + hex.toString(16).padStart(8, "0");
// const hexToColor = (hex) => "rgba"+ hex.toString(16).padStart(8, "0");

const paintCanvas = (canvas, ctx, imageState) => {
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
            console.log("Here's the color:", hexToColor(imageState[row][col]));
            ctx.fillRect(col * stride, row * stride, stride, stride);
        }
    }
};

// assumes `imageState` is a 2D, rectangular array of hex digits, at least size 1 in width and height
function PixelCanvas({ imageState }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            console.log("Canvas exists, painting");
            const ctx = canvas.getContext("2d");
            paintCanvas(canvas, ctx, imageState);
        }
    }, [imageState, canvasRef.current]);

    return <canvas ref={canvasRef} width="640" height="640"></canvas>;
}

export default PixelCanvas;
