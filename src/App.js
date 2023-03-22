import { Grid } from "@mui/material";
import { useState } from "react";
import styles from "./App.module.scss";
import PixelCanvas from "./PixelCanvas";
import { hexToColor, joinClasses } from "./util";

const IMAGE_WIDTH = 16;
const IMAGE_HEIGHT = 16;

const initialPalette = [
    0xff0000ff, 0x00ff00ff, 0x0000ffff, 0x00ffffff, 0xffff00ff, 0x000000ff,
    0x000000ff, 0x000000ff, 0x000000ff, 0x000000ff, 0x000000ff, 0x000000ff,
];

const tools = {
    brush: {},
    line: {},
};

function App() {
    const [imageState, setImageState] = useState(
        new Array(IMAGE_HEIGHT)
            .fill(0)
            .map((_) => new Array(IMAGE_WIDTH).fill(0x00ff0000))
    );

    const [palette, setPalette] = useState(initialPalette);
    const [selectedColor, setSelectedColor] = useState(0x000000ff);
    const [selectedTool, setSelectedTool] = useState({
        name: "brush",
        size: 1,
    });

    return (
        <Grid
            container
            height="100vh"
            className={styles.main}
            flexDirection="row"
            wrap="nowrap"
        >
            <Grid item xs={2} className={styles.leftSide}>
                <Grid container direction="column" alignItems="center">
                    <Grid item xs={12} className={styles.toolbar}>
                        <Grid container direction="row">
                            {Object.entries(tools).map(([key, value]) => (
                                <Grid
                                    item
                                    xs={6}
                                    key={key}
                                    className={joinClasses(
                                        styles.tool,
                                        selectedTool.name === key &&
                                            styles.selected
                                    )}
                                    onClick={() =>
                                        setSelectedTool({
                                            name: key,
                                        })
                                    }
                                >
                                    {key}
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={8}>
                <PixelCanvas
                    imageState={imageState}
                    setImageState={setImageState}
                    selectedColor={selectedColor}
                    selectedTool={selectedTool}
                />
            </Grid>
            <Grid item xs={2}>
                <Grid container direction="column">
                    <Grid item xs={8}>
                        asdf
                    </Grid>
                    <Grid item xs={4}>
                        <Grid container direction="row">
                            {palette.map((color, index) => (
                                <Grid
                                    item
                                    xs={3}
                                    key={index}
                                    className={styles.paletteItem}
                                    style={{
                                        backgroundColor: hexToColor(color),
                                    }}
                                    onClick={() => setSelectedColor(color)}
                                >
                                    &nbsp;
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
