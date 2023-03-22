import { Brush, ShowChart } from "@mui/icons-material";
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
                            selectedColor={selectedColor}
                            selectedTool={selectedTool}
                        />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={3}>
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
