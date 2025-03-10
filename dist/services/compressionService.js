"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sharp_1 = __importDefault(require("sharp"));
const archiver_1 = __importDefault(require("archiver"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const compressImage = async (inputPath, outputPath) => {
    try {
        await (0, sharp_1.default)(inputPath)
            .resize({ width: 1080 }) // Resize (adjust as needed)
            .jpeg({ quality: 70 }) // Reduce quality (adjustable)
            .toFile(outputPath);
        return outputPath;
    }
    catch (error) {
        console.error('Image compression error:', error);
        throw error;
    }
};
const compressFile = async (file) => {
    return new Promise(async (resolve, reject) => {
        const isImage = file.mimetype.startsWith('image/');
        const zipFilePath = path_1.default.join(__dirname, `../../compressed/${file.filename}.zip`);
        const output = fs_1.default.createWriteStream(zipFilePath);
        const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
        archive.on('error', (err) => reject(err));
        archive.pipe(output);
        try {
            let fileToZip = file.path;
            if (isImage) {
                const compressedImagePath = path_1.default.join(__dirname, `../../uploads/compressed-${file.filename}`);
                fileToZip = await compressImage(file.path, compressedImagePath);
            }
            archive.file(fileToZip, { name: file.originalname });
            archive.finalize();
            output.on('close', () => resolve(zipFilePath));
        }
        catch (error) {
            reject(error);
        }
    });
};
exports.default = { compressFile };
