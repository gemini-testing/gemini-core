export { default as BaseStats } from "./lib/base-stats";
export { default as SetsBuilder } from "./lib/sets-builder";

import options from "./lib/config/options";
export const config = { options };

export { default as Calibrator } from "./lib/calibrator";
export * as BrowserPool from "./lib/browser-pool";
export { default as BrowserAgent } from "./lib/browser-agent";
export { default as Image } from "./lib/image";
export * as temp from "./lib/temp";
export * as errors from "./lib/errors";
export * as events from "./lib/events";
export * as promiseUtils from "./lib/promise-utils";
export * as clientBridge from "./lib/client-bridge";

import * as coverageLevel from "./lib/coverage/coverage-level";
export const coverage = { coverageLevel };

import Camera from "./lib/browser/camera";
export const browser = { Camera };
export { Camera };

export { default as ScreenShooter } from "./lib/screen-shooter";
export { default as Viewport } from "./lib/screen-shooter/viewport";
export { default as CoordValidator } from "./lib/screen-shooter/viewport/coord-validator";
