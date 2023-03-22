import React, { useRef, useEffect, useState, useCallback } from "react";
import styles from "./PixelCanvas.module.scss";
import { runListeners } from "./toolbarListeners";
import { checkTileBounds, hexToColor, invertHexColor } from "./util";

// assumes `imageState` is a 2D, rectangular array of hex digits, at least size 1 in width and height
const PixelCanvas = React.memo(
    ({ imageState, setImageState, selectedColor, selectedTool }) => {
        const canvasRef = useRef(null);
        const previewCanvasRef = useRef(null);
        const mouseRef = useRef({ x: 0, y: 0, down: false });

        const imageWidth = imageState[0].length;
        const imageHeight = imageState.length;

        // color and array of {row, col, color} triplets
        const [previewState, setPreviewState] = useState({
            previewPixels: null,
            cursorRow: 0,
            cursorCol: 0,
        });

        useEffect(() => {
            // capture mouse movements, store in ref to avoid rerender
            const mouse = mouseRef.current;
            const previewCanvas = previewCanvasRef.current;

            if (previewCanvas) {
                return runListeners(
                    previewCanvas,
                    mouse,
                    selectedColor,
                    selectedTool,
                    imageWidth,
                    imageHeight,
                    setImageState,
                    setPreviewState
                );
            }
        }, [
            imageState,
            selectedColor,
            selectedTool,
            imageWidth,
            imageHeight,
            setImageState,
        ]);

        const paintCanvas = useCallback(
            (canvas, ctx, imageState) => {
                console.log("We're painting the damn canvas.");

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
                        ctx.fillRect(
                            col * stride,
                            row * stride,
                            stride,
                            stride
                        );
                    }
                }
            },
            [imageWidth, imageHeight]
        );

        useEffect(() => {
            // repaint image canvas ONLY when needed
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext("2d");
                paintCanvas(canvas, ctx, imageState);
            }
        }, [imageState, paintCanvas]);

        const paintPreviewCanvas = useCallback(
            (canvas, ctx, previewState) => {
                console.log("We're painting the damn preview.");

                // note: maybe Math.round() would be better here, for avoiding lines between shapes
                const stride = canvas.width / imageWidth;

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // display previewed line or shape
                if (previewState.previewPixels) {
                    for (const {
                        row,
                        col,
                        color,
                    } of previewState.previewPixels) {
                        ctx.fillStyle = hexToColor(color);
                        ctx.fillRect(
                            col * stride,
                            row * stride,
                            stride,
                            stride
                        );
                    }
                }

                // color in cursor
                const { cursorRow, cursorCol } = previewState;
                if (
                    checkTileBounds(
                        cursorRow,
                        cursorCol,
                        imageWidth,
                        imageHeight
                    )
                ) {
                    ctx.strokeStyle = hexToColor(
                        invertHexColor(imageState[cursorRow][cursorCol])
                    );
                } else {
                    ctx.strokeStyle = "black";
                }

                ctx.lineWidth = 2;
                ctx.strokeRect(
                    cursorCol * stride,
                    cursorRow * stride,
                    stride,
                    stride
                );
            },
            [imageState, imageWidth, imageHeight]
        );

        useEffect(() => {
            // repaint image canvas ONLY when needed
            const previewCanvas = previewCanvasRef.current;
            if (previewCanvas) {
                const ctx = previewCanvas.getContext("2d");
                paintPreviewCanvas(previewCanvas, ctx, previewState);
            }
        }, [previewState, paintPreviewCanvas]);

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
            <div className={styles.main}>
                <canvas ref={canvasRef} width="640" height="640"></canvas>
                <canvas
                    ref={previewCanvasRef}
                    width="640"
                    height="640"
                    id={styles.previewCanvas}
                ></canvas>
                {/* <button onClick={downloadPNG}>download</button> */}
            </div>
        );
    }
);

export default PixelCanvas;
