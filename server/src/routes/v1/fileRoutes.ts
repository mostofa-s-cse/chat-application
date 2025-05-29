import express from 'express';
import { handleFileUpload, downloadFile, uploadFile } from '../../controllers/fileController';

const router = express.Router();

router.post('/upload', uploadFile, handleFileUpload);
router.get('/download/:fileId', downloadFile);

export default router; 