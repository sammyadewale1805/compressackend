"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
const zlib_1 = __importDefault(require("zlib"));
const path_1 = __importDefault(require("path"));
const optimizeFile = async (file) => {
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    let outputFilePath = file.path;
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        const webpPath = `uploads/${file.filename}.webp`;
        await (0, sharp_1.default)(file.path).webp({ quality: 80 }).toFile(webpPath);
        fs_1.default.unlinkSync(file.path);
        outputFilePath = webpPath;
    }
    if (['.txt', '.json', '.log', '.csv'].includes(ext)) {
        const gzipPath = `uploads/${file.filename}.gz`;
        const gzip = fs_1.default.createWriteStream(gzipPath);
        fs_1.default.createReadStream(file.path).pipe(zlib_1.default.createGzip()).pipe(gzip);
        await new Promise((resolve) => gzip.on('finish', () => resolve()));
        fs_1.default.unlinkSync(file.path);
        outputFilePath = gzipPath;
    }
    return outputFilePath;
};
exports.default = optimizeFile;
