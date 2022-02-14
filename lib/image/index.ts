import Bluebird from 'bluebird';
import looksSame from 'looks-same';
import PngImg, { Size, Color } from 'png-img';
import * as utils from 'png-img/utils';

import SafeRect from './safe-rect';

import type { SerializedRect } from '../types/rect';

type ImageCompareOpts = {
    canHaveCaret?: boolean;
    pixelRatio?: number;
    compareOpts?: looksSame.LooksSameOptions;
    tolerance?: number;
    antialiasingTolerance?: number;
};

type ImageBuildDiffOpts = Omit<looksSame.CreateDiffOptions, 'highlightColor'> & {
    diffColor: string;
};

type LooksSameResult = Parameters<Parameters<typeof looksSame>[2]>[1];

type ScaleOpts = {
    scaleFactor?: number;
};

export default class Image {
    private _img: PngImg;

    public static create(buffer: Buffer): Image {
        return new this(buffer);
    }

    constructor(buffer: Buffer) {
        this._img = new PngImg(buffer);
    }

    public crop(rect: SerializedRect, opts: ScaleOpts = {}): Promise<this> {
        rect = this._scale(rect, (opts).scaleFactor);
        const imageSize = this.getSize();
        const safeRect = SafeRect.create(rect, imageSize);

        this._img.crop(
            safeRect.left,
            safeRect.top,
            safeRect.width,
            safeRect.height
        );

        return Bluebird.resolve(this);
    }

    public getSize(): Size {
        return this._img.size();
    }

    public getRGBA(x: number, y: number): Color {
        return this._img.get(x, y);
    }

    public save(file: string): Promise<void> {
        return Bluebird.fromCallback((cb) => this._img.save(file, cb));
    }

    public clear(area: SerializedRect, opts: ScaleOpts = {}): void {
        area = this._scale(area, (opts).scaleFactor);
        this._img.fill(
            area.left,
            area.top,
            area.width,
            area.height,
            '#000000'
        );
    }

    public join(newImage: Image): this {
        const imageSize = this.getSize();
        this._img
            .setSize(imageSize.width, imageSize.height + newImage.getSize().height)
            .insert(newImage._img, 0, imageSize.height);

        return this;
    }

    private _scale(area: SerializedRect, scaleFactor?: number): SerializedRect {
        scaleFactor = scaleFactor || 1;
        return {
            left: area.left * scaleFactor,
            top: area.top * scaleFactor,
            width: area.width * scaleFactor,
            height: area.height * scaleFactor
        };
    }

    public static fromBase64(base64: string): Image {
        return new Image(Buffer.from(base64, 'base64'));
    }

    public static RGBToString(rgb: Color): string {
        return utils.RGBToString(rgb);
    }

    public static compare(path1: string, path2: string, opts: ImageCompareOpts = {}): Promise<LooksSameResult> {
        const compareOptions = {
            ignoreCaret: opts.canHaveCaret,
            pixelRatio: opts.pixelRatio,
            ...opts.compareOpts
        };

        (['tolerance', 'antialiasingTolerance'] as const).forEach((option) => {
            if (option in opts) {
                compareOptions[option] = opts[option];
            }
        });

        return Bluebird.fromCallback((cb) => {
            looksSame(path1, path2, compareOptions, cb);
        });
    }

    public static buildDiff(opts: ImageBuildDiffOpts): Promise<Buffer> {
        const {diffColor: highlightColor, ...otherOpts} = opts;
        const diffOptions = {highlightColor, ...otherOpts};

        return Bluebird.fromCallback((cb) => looksSame.createDiff(diffOptions, cb));
    }
};
