"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sharp_1 = __importDefault(require("sharp"));
const archiver_1 = __importDefault(require("archiver"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const crypto_1 = __importDefault(require("crypto"));
// Convert callbacks to promises
const fsUnlink = (0, util_1.promisify)(fs_1.default.unlink);
const fsExists = (0, util_1.promisify)(fs_1.default.exists);
const fsMkdir = (0, util_1.promisify)(fs_1.default.mkdir);
// Make temporary directories
const TEMP_DIR = path_1.default.join(__dirname, '../../temp');
const COMPRESSED_DIR = path_1.default.join(TEMP_DIR, 'compressed');
const UPLOADS_DIR = path_1.default.join(TEMP_DIR, 'uploads');
// Function to ensure temp directories exist
const ensureTempDirs = async () => {
    for (const dir of [TEMP_DIR, COMPRESSED_DIR, UPLOADS_DIR]) {
        if (!await fsExists(dir)) {
            await fsMkdir(dir, { recursive: true });
        }
    }
};
// Schedule a file for deletion after a specified time (in milliseconds)
const scheduleCleanup = (filePath, delayMs = 5 * 60 * 1000) => {
    setTimeout(async () => {
        try {
            if (await fsExists(filePath)) {
                await fsUnlink(filePath);
                console.log(`Temp file deleted: ${filePath}`);
            }
        }
        catch (error) {
            console.error(`Error deleting temp file: ${filePath}`, error);
        }
    }, delayMs);
};
// Compress an image
const compressImage = async (inputPath, outputPath) => {
    try {
        await (0, sharp_1.default)(inputPath)
            .resize({ width: 1080 }) // Resize (adjust as needed)
            .jpeg({ quality: 70 }) // Reduce quality (adjustable)
            .toFile(outputPath);
        // Schedule original file for cleanup
        scheduleCleanup(inputPath);
        return outputPath;
    }
    catch (error) {
        console.error('Image compression error:', error);
        throw error;
    }
};
// Main compression function
const compressFile = async (file) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Ensure temp directories exist
            await ensureTempDirs();
            const isImage = file.mimetype.startsWith('image/');
            // Generate unique filename
            const uniqueId = crypto_1.default.randomBytes(8).toString('hex');
            const zipFilePath = path_1.default.join(COMPRESSED_DIR, `${uniqueId}-${file.filename}.zip`);
            const output = fs_1.default.createWriteStream(zipFilePath);
            const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
            archive.on('error', (err) => reject(err));
            archive.pipe(output);
            let fileToZip = file.path;
            // For images, apply additional compression
            if (isImage) {
                const compressedImagePath = path_1.default.join(UPLOADS_DIR, `compressed-${uniqueId}-${file.filename}`);
                fileToZip = await compressImage(file.path, compressedImagePath);
                // Schedule cleanup for the compressed image too
                scheduleCleanup(compressedImagePath);
            }
            else {
                // For non-images, still schedule cleanup
                scheduleCleanup(file.path);
            }
            archive.file(fileToZip, { name: file.originalname });
            await archive.finalize();
            // Schedule cleanup for the zip file
            scheduleCleanup(zipFilePath, 10 * 60 * 1000); // 10 minutes for the zip
            output.on('close', () => resolve(zipFilePath));
        }
        catch (error) {
            reject(error);
        }
    });
};
// Cleanup function to run periodically
const cleanupTempFiles = async () => {
    try {
        for (const dir of [UPLOADS_DIR, COMPRESSED_DIR]) {
            if (!await fsExists(dir))
                continue;
            const files = fs_1.default.readdirSync(dir);
            const now = Date.now();
            for (const file of files) {
                const filePath = path_1.default.join(dir, file);
                const stats = fs_1.default.statSync(filePath);
                // If file is older than 1 hour, delete it
                if (now - stats.mtime.getTime() > 60 * 60 * 1000) {
                    try {
                        await fsUnlink(filePath);
                        console.log(`Deleted old temp file: ${filePath}`);
                    }
                    catch (error) {
                        console.error(`Error deleting old file: ${filePath}`, error);
                    }
                }
            }
        }
    }
    catch (error) {
        console.error('Error during temp files cleanup:', error);
    }
};
// Run cleanup every hour
setInterval(cleanupTempFiles, 60 * 60 * 1000);
// Run cleanup at startup
cleanupTempFiles();
exports.default = { compressFile };
