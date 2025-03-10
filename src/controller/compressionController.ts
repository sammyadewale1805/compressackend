import { Request, Response } from 'express';
import compressionService from '../services/compressionService';
import fs from 'fs';

const compressFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const outputFilePath = await compressionService.compressFile(req.file);

    res.download(outputFilePath, 'compressed-file.zip', () => {
      fs.unlinkSync(outputFilePath); // Cleanup compressed ZIP file
      if (req.file) {
        fs.unlinkSync(req.file.path); // Cleanup original uploaded file
      }
    });
  } catch (error) {
    console.error('Compression Error:', error);
    res.status(500).json({ message: 'Compression failed' });
  }
};

export default { compressFile };
