"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const archiver_1 = __importDefault(require("archiver"));
const path_1 = __importDefault(require("path"));
const optimize_1 = __importDefault(require("./optimize"));
const compressFile = async (file) => {
    const optimizedFilePath = await (0, optimize_1.default)(file);
    const outputFilePath = `compressed/${path_1.default.basename(file.originalname)}.zip`;
    return new Promise((resolve, reject) => {
        const output = fs_1.default.createWriteStream(outputFilePath);
        const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
        archive.pipe(output);
        archive.file(optimizedFilePath, { name: path_1.default.basename(optimizedFilePath) });
        archive.finalize().then(() => resolve(outputFilePath)).catch(reject);
    });
};
exports.default = compressFile;
