"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoordValidator = exports.Viewport = exports.ScreenShooter = exports.browser = exports.coverage = exports.clientBridge = exports.promiseUtils = exports.events = exports.errors = exports.temp = exports.Image = exports.BrowserAgent = exports.BrowserPool = exports.Calibrator = exports.config = exports.SetsBuilder = exports.BaseStats = void 0;
var base_stats_1 = require("./lib/base-stats");
Object.defineProperty(exports, "BaseStats", { enumerable: true, get: function () { return __importDefault(base_stats_1).default; } });
var sets_builder_1 = require("./lib/sets-builder");
Object.defineProperty(exports, "SetsBuilder", { enumerable: true, get: function () { return __importDefault(sets_builder_1).default; } });
exports.config = __importStar(require("./lib/config"));
var calibrator_1 = require("./lib/calibrator");
Object.defineProperty(exports, "Calibrator", { enumerable: true, get: function () { return __importDefault(calibrator_1).default; } });
exports.BrowserPool = __importStar(require("./lib/browser-pool"));
var browser_agent_1 = require("./lib/browser-agent");
Object.defineProperty(exports, "BrowserAgent", { enumerable: true, get: function () { return __importDefault(browser_agent_1).default; } });
var image_1 = require("./lib/image");
Object.defineProperty(exports, "Image", { enumerable: true, get: function () { return __importDefault(image_1).default; } });
exports.temp = __importStar(require("./lib/temp"));
exports.errors = __importStar(require("./lib/errors"));
exports.events = __importStar(require("./lib/events"));
exports.promiseUtils = __importStar(require("./lib/promise-utils"));
exports.clientBridge = __importStar(require("./lib/client-bridge"));
exports.coverage = __importStar(require("./lib/coverage"));
exports.browser = __importStar(require("./lib/browser"));
var screen_shooter_1 = require("./lib/screen-shooter");
Object.defineProperty(exports, "ScreenShooter", { enumerable: true, get: function () { return __importDefault(screen_shooter_1).default; } });
var viewport_1 = require("./lib/screen-shooter/viewport");
Object.defineProperty(exports, "Viewport", { enumerable: true, get: function () { return __importDefault(viewport_1).default; } });
var coord_validator_1 = require("./lib/screen-shooter/viewport/coord-validator");
Object.defineProperty(exports, "CoordValidator", { enumerable: true, get: function () { return __importDefault(coord_validator_1).default; } });
