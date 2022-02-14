export type Features = {
    needsCompatLib: boolean;
    pixelRatio: Window['devicePixelRatio'];
    innerWidth: Window['innerWidth'] | Element['clientWidth'];
};

export type CalibrationResult = Features & {
    top: number;
    left: number;
    usePixelRatio: boolean;
};
