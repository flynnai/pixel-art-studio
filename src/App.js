import { Grid } from "@mui/material";
import { useState } from "react";
import styles from "./App.module.scss";
import PixelCanvas from "./PixelCanvas";
import { hexToColor } from "./util";

const IMAGE_WIDTH = 16;
const IMAGE_HEIGHT = 16;

const initialPalette = [
    0xff0000ff, 0x00ff00ff, 0x0000ffff, 0x00ffffff, 0xffff00ff, 0x000000ff,
    0x000000ff, 0x000000ff, 0x000000ff, 0x000000ff, 0x000000ff, 0x000000ff,
];

function App() {
    const [imageState, setImageState] = useState(
        new Array(IMAGE_HEIGHT)
            .fill(0)
            .map((_) => new Array(IMAGE_WIDTH).fill(0x00ff0000))
    );

    const [palette, setPalette] = useState(initialPalette);
    const [selectedColor, setSelectedColor] = useState(0x000000ff);

    return (
        <Grid
            container
            height="100vh"
            className={styles.main}
            flexDirection="row"
            wrap="nowrap"
        >
            <Grid item xs={2}>
                <Grid container direction="column">
                    <Grid item xs={12}>
                        <Grid container direction="row" wrap="nowrap">
                            <Grid item xs={6}>
                                item 1
                            </Grid>
                            <Grid item xs={6}>
                                item 2
                            </Grid>
                        </Grid>
                        <Grid container direction="row" wrap="nowrap">
                            <Grid item xs={6}>
                                item 3
                            </Grid>
                            <Grid item xs={6}>
                                item 4
                            </Grid>
                        </Grid>
                        <Grid container direction="row" wrap="nowrap">
                            <Grid item xs={6}>
                                item 5
                            </Grid>
                            <Grid item xs={6}>
                                item 6
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={8}>
                <PixelCanvas
                    imageState={imageState}
                    setImageState={setImageState}
                    selectedColor={selectedColor}
                />
            </Grid>
            <Grid item xs={2}>
                <Grid container direction="column">
                    <Grid item xs={8}>
                        asdf
                    </Grid>
                    <Grid item xs={4}>
                        <Grid container direction="row">
                            {palette.map((color) => (
                                <Grid
                                    item
                                    xs={3}
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
