import express from 'express';
import multer from 'multer';
import compressionController from '../controller/compressionController';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), compressionController.compressFile);

export default router;
