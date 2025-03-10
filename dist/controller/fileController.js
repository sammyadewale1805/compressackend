"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compressFile = void 0;
const archiver_1 = __importDefault(require("archiver"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const compressFile = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).send('No file uploaded.');
            return;
        }
        const filePath = req.file.path;
        const fileName = req.file.originalname;
        const zipFilePath = path_1.default.join(__dirname, `../../compressed-${fileName}.zip`);
        const output = fs_1.default.createWriteStream(zipFilePath);
        const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
        archive.on('error', (err) => {
            console.error('Error creating ZIP file:', err);
            res.status(500).send('Error creating ZIP file');
        });
        output.on('close', () => {
            console.log(`ZIP file created successfully: ${zipFilePath} (${archive.pointer()} bytes)`);
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="compressed-${fileName}.zip"`);
            res.download(zipFilePath, (err) => {
                if (err) {
                    console.error('Error sending ZIP file:', err);
                    res.status(500).send('Error sending ZIP file');
                }
                fs_1.default.unlink(zipFilePath, (err) => {
                    if (err)
                        console.error('Error deleting ZIP file:', err);
                });
                fs_1.default.unlink(filePath, (err) => {
                    if (err)
                        console.error('Error deleting original file:', err);
                });
            });
        });
        archive.pipe(output);
        archive.file(filePath, { name: fileName });
        await archive.finalize(); // Ensure archive is fully written before proceeding
    }
    catch (error) {
        console.error('Error compressing file:', error);
        res.status(500).send('Error compressing file');
    }
};
exports.compressFile = compressFile;
