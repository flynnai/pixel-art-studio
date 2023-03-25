import { Brush, Download, Redo, ShowChart, Undo } from "@mui/icons-material";
import { Grid, TextField } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import styles from "./App.module.scss";
import PixelCanvas from "./PixelCanvas";
import {
    addUndoAction,
    canRedo,
    canUndo,
    downloadPNG,
    hexToColor,
    joinClasses,
    redo,
    undo,
} from "./util";

const IMAGE_WIDTH = 16;
const IMAGE_HEIGHT = 16;

const initialPalette = [
    0xff0000ff, 0x00ff00ff, 0x0000ffff, 0x00ffffff, 0xffff00ff, 0x000000ff,
    0x000000ff, 0x000000ff, 0x000000ff, 0x000000ff, 0x000000ff, 0x000000ff,
];

const tools = {
    brush: {
        icon: <Brush fontSize="large" />,
    },
    line: { icon: <ShowChart fontSize="large" /> },
};

function App() {
    const [imageState, setImageState] = useState(
        new Array(IMAGE_HEIGHT)
            .fill(0)
            .map((_) => new Array(IMAGE_WIDTH).fill(0x00ff0000))
    );

    const [palette, setPalette] = useState(initialPalette);
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    const [selectedTool, setSelectedTool] = useState({
        name: "brush",
        size: 1,
    });
    const [downloadFilename, setDownloadFilename] = useState("your-creation");

    // ok to have this as a ref, since whenever we update it, we update state
    const undoListRef = useRef({
        index: 0, // 1 past the last undo-able action
        functorStack: [],
    });

    const updatePixels = React.useCallback((updateList) => {
        setImageState((currImageState) => {
            // find changed pixels
            let prevPixels = [];
            for (const { row, col, color } of updateList) {
                if (currImageState[row][col] !== color) {
                    prevPixels.push({
                        row,
                        col,
                        color: currImageState[row][col],
                    });
                }
            }
            if (!prevPixels.length) {
                // no change, return original value to avoid rerender
                return currImageState;
            }

            // helper function
            const getModifiedImageState = (_updateList, currImageState) => {
                return currImageState.map((pixelRow, row) =>
                    !_updateList.some((update) => update.row === row)
                        ? pixelRow
                        : pixelRow.map((pixel, col) => {
                              const find = _updateList.find(
                                  (update) =>
                                      update.row === row && update.col === col
                              );
                              return find ? find.color : pixel;
                          })
                );
            };

            // create undo and redo actions for this change
            const undoAction = () => {
                console.log("Undoing with these pixels:", prevPixels);
                setImageState((curr) =>
                    getModifiedImageState(prevPixels, curr)
                );
            };
            const redoAction = () => {
                console.log("Redoing with these pixels:", updateList);
                setImageState((curr) =>
                    getModifiedImageState(updateList, curr)
                );
            };

            const undoList = undoListRef.current;
            addUndoAction(undoList, undoAction, redoAction);

            const update = getModifiedImageState(updateList, currImageState);
            console.log("UPDATING", update);
            return update;
        });
    }, []);

    useEffect(() => {
        const keyDownHandler = (e) => {
            if (e.key === "z" && e.metaKey) {
                if (!e.shiftKey) {
                    // undo
                    undo(undoListRef.current);
                } else {
                    // redo
                    redo(undoListRef.current);
                }
            }
        };
        window.addEventListener("keydown", keyDownHandler);
        return () => {
            window.removeEventListener("keydown", keyDownHandler);
        };
    }, []);

    console.log("undo stack", undoListRef.current);

    return (
        <Grid
            container
            height="100vh"
            className={styles.main}
            flexDirection="row"
            wrap="nowrap"
            alignItems="center"
        >
            <Grid item xs={3} className={styles.leftSide}>
                <Grid
                    container
                    direction="column"
                    wrap="nowrap"
                    alignItems="flex-end"
                >
                    <Grid item xs="auto" className={styles.toolbar}>
                        <Grid
                            container
                            direction="row"
                            className={styles.toolbarGroup}
                        >
                            <Grid
                                item
                                className={styles.tool}
                                onClick={() => undo(undoListRef.current)}
                            >
                                <Grid
                                    container
                                    justifyContent="center"
                                    alignItems="center"
                                    style={{ height: "100%" }}
                                    className={joinClasses(
                                        styles.clickable,
                                        !canUndo(undoListRef.current) &&
                                            styles.disabled
                                    )}
                                >
                                    <Grid item>
                                        <Undo />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid
                                item
                                className={styles.tool}
                                onClick={() => redo(undoListRef.current)}
                            >
                                <Grid
                                    container
                                    justifyContent="center"
                                    alignItems="center"
                                    style={{ height: "100%" }}
                                    className={joinClasses(
                                        styles.clickable,
                                        !canRedo(undoListRef.current) &&
                                            styles.disabled
                                    )}
                                >
                                    <Grid item>
                                        <Redo />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid
                            container
                            direction="row"
                            className={styles.toolbarGroup}
                        >
                            {Object.entries(tools).map(([key, value]) => (
                                <Grid
                                    item
                                    xs={6}
                                    key={key}
                                    className={styles.tool}
                                    onClick={() =>
                                        setSelectedTool({
                                            name: key,
                                        })
                                    }
                                >
                                    <Grid
                                        container
                                        justifyContent="center"
                                        alignItems="center"
                                        style={{ height: "100%" }}
                                        className={joinClasses(
                                            styles.clickable,
                                            selectedTool.name === key &&
                                                styles.selected
                                        )}
                                    >
                                        <Grid item>{value.icon}</Grid>
                                    </Grid>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={6}>
                <Grid container justifyContent="center" alignItems="center">
                    <Grid item xs="auto">
                        <PixelCanvas
                            imageState={imageState}
                            updatePixels={updatePixels}
                            selectedColor={palette[selectedColorIndex]}
                            selectedTool={selectedTool}
                        />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={3} className={styles.rightSide}>
                <Grid container direction="column" alignItems="flex-start">
                    <Grid item xs={12}>
                        <Grid
                            container
                            direction="column"
                            className={styles.topPanel}
                        >
                            <Grid item xs={12}>
                                <Grid
                                    container
                                    direction="row"
                                    wrap="nowrap"
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <Grid item xs>
                                        <Grid
                                            container
                                            wrap="nowrap"
                                            alignItems="center"
                                        >
                                            <input
                                                type="text"
                                                value={downloadFilename}
                                                onChange={(e) =>
                                                    setDownloadFilename(
                                                        e.target.value
                                                    )
                                                }
                                                className={styles.filenameInput}
                                            />
                                            .png
                                        </Grid>
                                    </Grid>
                                    <Grid
                                        item
                                        xs="auto"
                                        className={styles.downloadButton}
                                        onClick={() =>
                                            downloadPNG(
                                                imageState,
                                                downloadFilename + ".png"
                                            )
                                        }
                                    >
                                        <Grid container>
                                            <strong>Download</strong>
                                            &nbsp;
                                            <Download />
                                        </Grid>
                                    </Grid>
                                </Grid>
                                {/* <h2>Edit Image Dimensions</h2>
                                <Grid container direction="row" wrap="nowrap">
                                    <Grid item xs={6}>
                                        Dimensions:
                                    </Grid>
                                    <Grid item xs={6}>
                                        16 x 16
                                    </Grid>
                                </Grid> */}
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid
                            container
                            direction="row"
                            className={styles.palette}
                        >
                            {palette.map((color, index) => (
                                <Grid
                                    item
                                    xs={3}
                                    key={index}
                                    className={joinClasses(
                                        styles.paletteItem,
                                        index === selectedColorIndex &&
                                            styles.selected
                                    )}
                                    onClick={() => setSelectedColorIndex(index)}
                                >
                                    <div
                                        style={{
                                            backgroundColor: hexToColor(color),
                                        }}
                                        className={styles.color}
                                    >
                                        &nbsp;
                                    </div>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
}

export default App;
