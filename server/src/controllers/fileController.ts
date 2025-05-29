import { Request, Response } from 'express';
import { uploadFile as uploadFileService, downloadFile as downloadFileService } from '../services/fileService';
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, 'uploads/');
  },
  filename: (_, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

export const uploadFile = upload.single('file');

export const handleFileUpload = async (req: Request, res: Response) => {
  try {
    const file = await uploadFileService(req);
    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

export const downloadFile = async (req: Request, res: Response) => {
  const { fileId } = req.params;
  try {
    const file = await downloadFileService(fileId);
    res.download(file.path);
  } catch (error) {
    res.status(500).json({ error: 'Failed to download file' });
  }
}; 