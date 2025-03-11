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
      try {
        const isImage = file.mimetype.startsWith('image/');
        
        // Ensure directories exist
        const compressedDir = path.join(__dirname, '../../compressed');
        const uploadsDir = path.join(__dirname, '../../uploads');
  
        if (!fs.existsSync(compressedDir)) fs.mkdirSync(compressedDir, { recursive: true });
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  
        const zipFilePath = path.join(compressedDir, `${file.filename}.zip`);
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', { zlib: { level: 9 } });
  
        archive.on('error', (err) => reject(err));
        archive.pipe(output);
  
        let fileToZip = file.path;
  
        if (isImage) {
          const compressedImagePath = path.join(uploadsDir, `compressed-${file.filename}`);
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
