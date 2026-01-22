export const parseCommaList = (value: string) =>
    value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
