"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compressionService_1 = __importDefault(require("../services/compressionService"));
const fs_1 = __importDefault(require("fs"));
const compressFile = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }
        const outputFilePath = await compressionService_1.default.compressFile(req.file);
        res.download(outputFilePath, 'compressed-file.zip', () => {
            fs_1.default.unlinkSync(outputFilePath); // Cleanup compressed ZIP file
            if (req.file) {
                fs_1.default.unlinkSync(req.file.path); // Cleanup original uploaded file
            }
        });
    }
    catch (error) {
        console.error('Compression Error:', error);
        res.status(500).json({ message: 'Compression failed' });
    }
};
exports.default = { compressFile };
