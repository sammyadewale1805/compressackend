"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compressionService_1 = __importDefault(require("../services/compressionService"));
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const fsUnlink = (0, util_1.promisify)(fs_1.default.unlink);
const compressFile = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }
        const outputFilePath = await compressionService_1.default.compressFile(req.file);
        // Send file for download
        res.download(outputFilePath, 'compressed-file.zip', (err) => {
            if (err) {
                console.error('Error during file download:', err);
            }
            // Note: We're not deleting files here anymore as the service handles cleanup
            // Files will be deleted after a timeout or by the periodic cleanup
        });
    }
    catch (error) {
        console.error('Compression Error:', error);
        // Attempt to clean up the uploaded file if there's an error
        if (req.file && req.file.path) {
            try {
                await fsUnlink(req.file.path);
            }
            catch (unlinkError) {
                console.error('Error deleting uploaded file after compression failure:', unlinkError);
            }
        }
        res.status(500).json({ message: 'Compression failed' });
    }
};
exports.default = { compressFile };
