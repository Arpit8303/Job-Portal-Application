import express from 'express';
import userAuth from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdmin.js';
import { upload, uploadToCloudinary } from '../utils/cloudinary.js';
import {
  createCompanyController,
  getCompaniesController,
  updateCompanyController,
  deleteCompanyController,
} from '../controllers/companyController.js';

const router = express.Router();

// ── Phase 3: Cloudinary Upload ────────────────────────────────────────────────
router.post('/upload', userAuth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }
    const result = await uploadToCloudinary(req.file.buffer);
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      url: result.secure_url,
    });
  } catch (error) {
    next(error);
  }
});

// ── Phase 3: Company Profiles ─────────────────────────────────────────────────
router.post('/companies', userAuth, createCompanyController);
router.get('/companies', userAuth, getCompaniesController);
router.put('/companies/:id', userAuth, updateCompanyController);
router.delete('/companies/:id', userAuth, deleteCompanyController);

export default router;
