"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForResults = void 0;
const bluebird_1 = __importDefault(require("bluebird"));
function waitForResults(promises) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield bluebird_1.default.all(promises.map((p) => p.reflect()));
        const firstRejection = res.find((v) => v.isRejected());
        return firstRejection ? bluebird_1.default.reject(firstRejection.reason()) : res.map((r) => r.value());
    });
}
exports.waitForResults = waitForResults;
