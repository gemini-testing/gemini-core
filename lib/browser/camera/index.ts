import _ from "lodash";

import * as utils from "./utils";
import Image from "../../image";

import type { Page } from "../../types/page";
import type { CalibrationResult } from "../../types/calibrator";

export type ScreenshotMode = "fullpage" | "viewport" | "auto";

export default class Camera {
    private _calibration: CalibrationResult | null;

    public static create(screenshotMode: ScreenshotMode, takeScreenshot: () => Promise<string>): Camera {
        return new this(screenshotMode, takeScreenshot);
    }

    constructor(
        private _screenshotMode: ScreenshotMode,
        private _takeScreenshot: () => Promise<string>
    ) {
        this._calibration = null;
    }

    public calibrate(calibration: CalibrationResult): void {
        this._calibration = calibration;
    }

    public async captureViewportImage(page?: Page): Promise<Image> {
        const base64 = await this._takeScreenshot();
        const image = await this._applyCalibration(Image.fromBase64(base64));

        return this._cropToViewport(image, page);
    }

    private async _applyCalibration(image: Image): Promise<Image> {
        if (!this._calibration) {
            return image;
        }

        const {left, top} = this._calibration;
        const {width, height} = image.getSize();

        return image.crop({left, top, width: width - left, height: height - top});
    }

    private async _cropToViewport(image: Image, page?: Page): Promise<Image> {
        if (!page) {
            return image;
        }

        const isFullPage = utils.isFullPage(image, page, this._screenshotMode);
        const cropArea = _.clone(page.viewport);

        if (!isFullPage) {
            _.extend(cropArea, {
                top: 0,
                left: 0
            });
        }

        return image.crop(cropArea, {scaleFactor: page.pixelRatio});
    }
};
