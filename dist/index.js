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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _DdddOcr_charsets, _DdddOcr_session;
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const jimp_1 = __importDefault(require("jimp"));
const onnxruntime_node_1 = require("onnxruntime-node");
class DdddOcr {
    constructor(session, charsets) {
        _DdddOcr_charsets.set(this, void 0);
        _DdddOcr_session.set(this, void 0);
        __classPrivateFieldSet(this, _DdddOcr_session, session, "f");
        __classPrivateFieldSet(this, _DdddOcr_charsets, charsets, "f");
    }
    static create(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const charsetsPath = (options === null || options === void 0 ? void 0 : options.charsetsPath) || node_path_1.default.resolve(__dirname, "../onnx/charsets.json");
            const charsets = JSON.parse(node_fs_1.default.readFileSync(charsetsPath, { encoding: "utf-8" }));
            const session = yield onnxruntime_node_1.InferenceSession.create((options === null || options === void 0 ? void 0 : options.onnxPath) || node_path_1.default.resolve(__dirname, "../onnx/common.onnx"));
            return new DdddOcr(session, charsets);
        });
    }
    classification(buff) {
        return __awaiter(this, void 0, void 0, function* () {
            const { image, dims } = yield this.loadImage(buff);
            const inputTensor = this.coverImageToTensor(image, dims);
            const { output: { data: outputData }, } = yield __classPrivateFieldGet(this, _DdddOcr_session, "f").run({ input1: inputTensor });
            return [...outputData]
                .filter(Boolean)
                .map((i) => __classPrivateFieldGet(this, _DdddOcr_charsets, "f")[Number(i)])
                .join("");
        });
    }
    loadImage(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            return jimp_1.default.read(buffer).then((imageBuffer) => {
                var width = imageBuffer.bitmap.width;
                var height = imageBuffer.bitmap.height;
                const dims = [1, 1, 64, Math.floor(width * (64 / height))];
                return {
                    image: imageBuffer.resize(dims[3], dims[2]).grayscale(),
                    dims,
                };
            });
        });
    }
    coverImageToTensor(image, dims) {
        const redArray = [];
        const greenArray = [];
        const blueArray = [];
        for (let i = 0; i < image.bitmap.data.length; i += 4) {
            redArray.push(image.bitmap.data[i]);
            greenArray.push(image.bitmap.data[i + 1]);
            blueArray.push(image.bitmap.data[i + 2]);
        }
        const transposedData = redArray.concat(greenArray).concat(blueArray);
        const float32Data = new Float32Array(dims.reduce((a, b) => a * b));
        for (let i = 0; i < transposedData.length; i++) {
            float32Data[i] = transposedData[i] / 255.0;
        }
        return new onnxruntime_node_1.Tensor("float32", float32Data, dims);
    }
}
_DdddOcr_charsets = new WeakMap(), _DdddOcr_session = new WeakMap();
module.exports = DdddOcr;
