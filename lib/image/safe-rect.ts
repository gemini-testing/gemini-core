import type { Size } from 'png-img';

import type { SerializedRect } from '../types/rect';

export default class SafeRect {
    public static create(rect: SerializedRect, imageSize: Size): SafeRect {
        return new SafeRect(rect, imageSize);
    }

    constructor(private _rect: SerializedRect, private _imageSize: Size) {}

    public get left(): number {
        return this._calcCoord('left');
    }

    public get top(): number {
        return this._calcCoord('top');
    }

    private _calcCoord(coord: keyof SerializedRect): number {
        return Math.max(this._rect[coord], 0);
    }

    public get width(): number {
        return this._calcSize('width', 'left');
    }

    public get height(): number {
        return this._calcSize('height', 'top');
    }

    private _calcSize(size: keyof Size, coord: keyof SerializedRect): number {
        const rectCoord = this._calcCoord(coord);

        return Math.min(this._rect[size], this._imageSize[size] - rectCoord);
    }
};
