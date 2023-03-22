import React, { useRef, useEffect, useState } from "react";
import styles from "./PixelCanvas.module.scss";
import { checkTileBounds, hexToColor, invertHexColor } from "./util";

// assumes `imageState` is a 2D, rectangular array of hex digits, at least size 1 in width and height
const PixelCanvas = React.memo(
    ({ imageState, setImageState, selectedColor, selectedTool }) => {
        const canvasRef = useRef(null);
        const previewCanvasRef = useRef(null);
        const mouseRef = useRef({ x: 0, y: 0, down: false });

        // color and array of coord pairs
        const [previewState, setPreviewState] = useState({
            color: null,
            coordPairs: null,
            cursorRow: 0,
            cursorCol: 0,
        });

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
                                  (update) =>
                                      update.row === row && update.col === col
                              );
                              return find ? find.color : pixel;
                          })
                );
            };
        };

        useEffect(() => {
            const imageWidth = imageState[0].length;
            const imageHeight = imageState.length;
            // capture mouse movements, store in ref to avoid rerender
            const mouse = mouseRef.current;
            const canvas = canvasRef.current;
            let stride = canvas.width / imageWidth;

            if (canvas) {
                const baseMouseMove = (e) => {
                    const bounding = canvas.getBoundingClientRect();
                    mouse.x = e.clientX - bounding.left;
                    mouse.y = e.clientY - bounding.top;
                    setPreviewState((curr) => {
                        let cursorRow = Math.floor(mouse.x / stride);
                        let cursorCol = Math.floor(mouse.y / stride);
                        if (
                            cursorRow === curr.cursorRow &&
                            cursorCol === curr.cursorCol
                        ) {
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
                    canvas.addEventListener("mousedown", handleMouseDown);
                    window.addEventListener("mouseup", handleMouseUp);
                };
                const removeCoreListeners = () => {
                    window.removeEventListener("mousemove", handleMouseMove);
                    canvas.removeEventListener("mousedown", handleMouseDown);
                    window.removeEventListener("mouseup", handleMouseUp);
                };

                if (selectedTool.name === "line") {
                } else if (selectedTool.name === "brush") {
                    const placeColor = () => {
                        let stride = canvas.width / imageWidth;
                        let cursorRow = Math.floor(mouse.y / stride);
                        let cursorCol = Math.floor(mouse.x / stride);
                        console.log("Trying to place a color.");
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
                            maybeUpdateImageState([
                                {
                                    row: cursorRow,
                                    col: cursorCol,
                                    color: selectedColor,
                                },
                                {
                                    row: cursorRow + 1,
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
            }
        }, [canvasRef.current, imageState, selectedColor, selectedTool]);

        const paintCanvas = (canvas, ctx, imageState) => {
            console.log("We're painting the damn canvas.");
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
        };

        useEffect(() => {
            // repaint image canvas ONLY when needed
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext("2d");
                paintCanvas(canvas, ctx, imageState, previewState);
            }
        }, [canvasRef.current, imageState]);

        const paintPreviewCanvas = (canvas, ctx, previewState, mouse) => {
            console.log("We're painting the damn preview.");
            const imageHeight = imageState.length;
            const imageWidth = imageState[0].length;

            // note: maybe Math.round() would be better here, for avoiding lines between shapes
            const stride = canvas.width / imageWidth;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // display previewed line or shape
            if (previewState.coordPairs) {
                for (const { row, col } of previewState.coordPairs) {
                    ctx.fillStyle = hexToColor(previewState.color);
                    ctx.fillRect(col * stride, row * stride, stride, stride);
                }
            }

            // color in cursor
            let cursorRow = Math.floor(mouse.y / stride);
            let cursorCol = Math.floor(mouse.x / stride);
            if (
                checkTileBounds(cursorRow, cursorCol, imageWidth, imageHeight)
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
        };

        useEffect(() => {
            // repaint image canvas ONLY when needed
            const previewCanvas = previewCanvasRef.current;
            if (previewCanvas) {
                const ctx = previewCanvas.getContext("2d");
                paintPreviewCanvas(
                    previewCanvas,
                    ctx,
                    previewState,
                    mouseRef.current
                );
            }
        }, [previewCanvasRef.current, previewState]);

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
                <button onClick={downloadPNG}>download</button>
            </div>
        );
    }
);

export default PixelCanvas;
