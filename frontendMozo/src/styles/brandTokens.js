export const brandColors = {
    primary: { main: '#7098FA', dark: '#3b5fd9', light: '#cfe0ff' },
    secondary: { main: '#c7b5f1', dark: '#7961e0', light: '#e8e1ff' },
    success: { main: '#b9ef0f', dark: '#1a7700', light: '#e6fc63' },
    warning: { main: '#ffe443', dark: '#b8850a', light: '#fffa57' },
    error: { main: '#fc6131', dark: '#d6380d', light: '#ffc1b0' },
    grey: {
        1: '#191919',
        2: '#343434',
        3: '#5f5f5f',
        4: '#8a8a8a',
        5: '#d6d6d6',
        6: '#ededed',
        7: '#F9F9F9'
    }
};

export const chartColors = [
    brandColors.primary.dark,
    brandColors.success.dark,
    brandColors.warning.dark,
    brandColors.secondary.dark,
    brandColors.primary.main,
    brandColors.secondary.main,
    brandColors.success.main,
    brandColors.error.dark,
    brandColors.error.main,
    brandColors.grey[3]
];
