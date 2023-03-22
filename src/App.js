import { Brush, Download, ShowChart } from "@mui/icons-material";
import { Grid, TextField } from "@mui/material";
import { useState } from "react";
import styles from "./App.module.scss";
import PixelCanvas from "./PixelCanvas";
import { downloadPNG, hexToColor, joinClasses } from "./util";

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
                <Grid container justifyContent="flex-end">
                    <Grid item xs="auto" className={styles.toolbar}>
                        <Grid container direction="row">
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
                            setImageState={setImageState}
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
