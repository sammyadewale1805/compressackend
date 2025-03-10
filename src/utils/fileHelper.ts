import fs from 'fs';

export const deleteFile = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (error) {
    console.error('cant delete file:', error);
  }
};
