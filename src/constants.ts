export const gameStateTitles = {
    panel: 'Place your panels!',
    doodle: 'Doodle your edits!',
    present: "Let't see those comics!",
} as const;

export const panelPieces = [
    { url: './assets/panel/panel1.webp' },
    { url: './assets/panel/panel2.webp' },
    { url: './assets/panel/panel3.webp' },
    { url: './assets/panel/panel4.webp' },
    { url: './assets/panel/cloud1.webp' },
    { url: './assets/panel/cloud2.webp' },
    { url: './assets/panel/sliced.webp' },
    { url: './assets/bubble/bubble1.webp' },
    { url: './assets/bubble/bubble2.webp' },
    { url: './assets/bubble/bubble3.webp' },
    { url: './assets/bubble/bubble4.webp' },
    { url: './assets/bubble/bubble5.webp' },
    { url: './assets/bubble/bubble6.webp' },
    { url: './assets/bubble/bubble7.webp' },
] as const;

export const paletteButtons = [
    { key: 'width', value: 5, label: 'Small' },
    { key: 'width', value: 20, label: 'Medium' },
    { key: 'width', value: 70, label: 'Large' },
    { key: 'style', value: 'solid', label: 'Solid' },
    { key: 'style', value: 'dots', label: 'Dots' },
    { key: 'style', value: 'lines', label: 'Lines' },
    { key: 'color', value: 'black', label: '' },
    { key: 'color', value: 'white', label: '' },
    { key: 'color', value: 'grey', label: '' },
    { key: 'color', value: 'red', label: '' },
    { key: 'color', value: 'orange', label: '' },
    { key: 'color', value: 'yellow', label: '' },
    { key: 'color', value: 'green', label: '' },
    { key: 'color', value: 'blue', label: '' },
    { key: 'color', value: 'purple', label: '' },
    { key: 'style', value: 'eraser', label: 'Eraser' },
] as const;

export const playerIcons = [
    { url: './assets/player-icons/icon1.webp' },
    { url: './assets/player-icons/icon2.webp' },
    { url: './assets/player-icons/icon3.webp' },
    { url: './assets/player-icons/icon4.webp' },
    { url: './assets/player-icons/icon5.webp' },
    { url: './assets/player-icons/icon6.webp' },
    { url: './assets/player-icons/icon7.webp' },
    { url: './assets/player-icons/icon8.webp' },
] as const;

export const backgrounds = {
    tin_left: `${import.meta.env.BASE_URL}assets/tin_left.webp`,
    tin_right: `${import.meta.env.BASE_URL}assets/tin_right.webp`,
    cover: `${import.meta.env.BASE_URL}assets/cover.webp`,
};
