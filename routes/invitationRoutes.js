import express from 'express';
import multer from 'multer';
import path from 'path';
import { generateInvitation, generatePrompt } from '../app/controllers/invitationController.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/');
  },
  filename: (req, file, cb) => {
    cb(null, `upload_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

const router = express.Router();

router.post('/generate-prompt', generatePrompt);
router.post('/generate-invitation', upload.single('backgroundImage'), generateInvitation);

export default router;
