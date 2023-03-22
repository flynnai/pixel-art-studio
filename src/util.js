export const hexToColor = (hex) => "#" + hex.toString(16).padStart(8, "0");
export const joinClasses = (...args) => args.filter(Boolean).join(" ");
