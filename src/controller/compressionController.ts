import { Request, Response } from 'express';
import compressionService from '../services/compressionService';
import fs from 'fs';
import { promisify } from 'util';

const fsUnlink = promisify(fs.unlink);

const compressFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    
    const outputFilePath = await compressionService.compressFile(req.file);
    
    // Send file for download
    res.download(outputFilePath, 'compressed-file.zip', (err) => {
      if (err) {
        console.error('Error during file download:', err);
      }
      
      // Note: We're not deleting files here anymore as the service handles cleanup
      // Files will be deleted after a timeout or by the periodic cleanup
    });
  } catch (error) {
    console.error('Compression Error:', error);
    
    // Attempt to clean up the uploaded file if there's an error
    if (req.file && req.file.path) {
      try {
        await fsUnlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file after compression failure:', unlinkError);
      }
    }
    
    res.status(500).json({ message: 'Compression failed' });
  }
};

export default { compressFile };