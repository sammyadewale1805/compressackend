import sharp from 'sharp';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

const compressImage = async (inputPath: string, outputPath: string) => {
  try {
    await sharp(inputPath)
      .resize({ width: 1080 }) // Resize (adjust as needed)
      .jpeg({ quality: 70 }) // Reduce quality (adjustable)
      .toFile(outputPath);
    return outputPath;
  } catch (error) {
    console.error('Image compression error:', error);
    throw error;
  }
};

const compressFile = async (file: Express.Multer.File): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const isImage = file.mimetype.startsWith('image/');
    const zipFilePath = path.join(__dirname, `../../compressed/${file.filename}.zip`);
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => reject(err));
    archive.pipe(output);

    try {
      let fileToZip = file.path;
      
      if (isImage) {
        const compressedImagePath = path.join(__dirname, `../../uploads/compressed-${file.filename}`);
        fileToZip = await compressImage(file.path, compressedImagePath);
      }

      archive.file(fileToZip, { name: file.originalname });
      archive.finalize();

      output.on('close', () => resolve(zipFilePath));
    } catch (error) {
      reject(error);
    }
  });
};

export default { compressFile };
