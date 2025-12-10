import { createTheme, MantineColorsTuple, MantineTheme } from "@mantine/core";

const sageGreen: MantineColorsTuple = [
    "#f1f5f3",
    "#e0e8e4",
    "#c2d1c9",
    "#a2b9ac",
    "#86a493",
    "#749783",
    "#6b917b",
    "#597c68",
    "#4e6e5c",
    "#415f4e",
];

const warmBeige: MantineColorsTuple = [
    "#fbf9f5",
    "#f4f1ea",
    "#e9e2d3",
    "#ded2ba",
    "#d4c5a5",
    "#cebc97",
    "#cbb890",
    "#b3a17b",
    "#9f8e6b",
    "#8b7b58",
];

const mutedGold: MantineColorsTuple = [
    "#fbf8eb",
    "#f3eed9",
    "#e6dbb2",
    "#dac788",
    "#cfb664",
    "#c8ab4d",
    "#c5a641",
    "#ae9032",
    "#9b802a",
    "#876e20",
];

export const theme = createTheme({
    colors: {
        "sage-green": sageGreen,
        "warm-beige": warmBeige,
        "muted-gold": mutedGold,
    },
    primaryColor: "sage-green",
    fontFamily: "var(--font-noto-sans-kr), sans-serif",
    headings: {
        fontFamily: "var(--font-noto-serif-kr), serif",
        sizes: {
            h1: { fontSize: "2.5rem", fontWeight: "700" },
            h2: { fontSize: "2rem", fontWeight: "600" },
            h3: { fontSize: "1.5rem", fontWeight: "600" },
        },
    },
    components: {
        Button: {
            defaultProps: {
                radius: "md",
                variant: "filled",
            },
            styles: {
                root: {
                    transition: "all 0.2s ease",
                },
            },
        },
        Card: {
            defaultProps: {
                radius: "md",
                shadow: "sm",
                withBorder: true,
            },
            styles: (theme: MantineTheme) => ({
                root: {
                    backgroundColor: theme.white,
                    borderColor: theme.colors["warm-beige"][2],
                },
            }),
        },
        Paper: {
            defaultProps: {
                radius: "md",
            },
        },
    },
});
