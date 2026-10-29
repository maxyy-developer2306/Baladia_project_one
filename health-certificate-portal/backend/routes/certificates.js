// Certificate routes.
// Admin-protected CRUD + public verification + QR code generation.
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Certificate = require('../models/Certificate');
const Setting = require('../models/Settings');
const { generateUniqueKey } = require('../utils/crypto');
const { generateQRDataUrl } = require('../utils/qr');
const { configureCloudinary, isCloudinaryConfigured, cloudinary } = require('../config/cloudinary');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
configureCloudinary();

// Local storage for certificate photos (used when Cloudinary is not configured).
const uploadsDir = path.join(__dirname, '..', 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (_) {
  // Read-only filesystem (Vercel serverless); local storage unavailable.
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// Stable public redirect URL for a certificate.
// Uses the active redirect deployment (main or backup) so that QR codes
// always point to a live redirect endpoint. Switching the active deployment
// does NOT require regenerating existing QR codes because both deployments
// remain live and serve the same /r/:uniqueKey redirect endpoint.
async function verificationUrl(uniqueKey) {
  const active = await Setting.getSetting(
    'activeRedirectDeployment',
    process.env.ACTIVE_DEPLOYMENT || 'main'
  );
  const base =
    active === 'backup'
      ? process.env.BACKUP_DEPLOYMENT_URL
      : process.env.MAIN_DEPLOYMENT_URL;
  const host = (base || 'http://localhost:5173').replace(/\/+$/, '');
  return `${host}/r/${uniqueKey}`;
}

// Public fields safe to return to anyone verifying a certificate.
const PUBLIC_FIELDS =
  'uniqueKey status name identityNumber gender nationality certificateNumber profession issueDateHijri issueDateGregorian expiryDateHijri expiryDateGregorian programType programEndDate licenseNumber facilityName facilityNumber amanah municipality userPhoto createdAt updatedAt';

// --- Admin: list certificates ---
// Query params: status, search, page, limit
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { certificateNumber: { $regex: search, $options: 'i' } },
        { identityNumber: { $regex: search, $options: 'i' } },
        { uniqueKey: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const [certificates, total] = await Promise.all([
      Certificate.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Certificate.countDocuments(filter),
    ]);

    res.json({
      certificates,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List certificates error:', error.message);
    res.status(500).json({ message: 'Failed to load certificates.' });
  }
});

// --- Admin: get one certificate by internal ID ---
router.get('/:id', async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found.' });
    }
    res.json({ certificate });
  } catch (error) {
    console.error('Get certificate error:', error.message);
    res.status(500).json({ message: 'Failed to load certificate.' });
  }
});

// --- Admin: create a certificate ---
router.post('/', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const {
      name,
      identityNumber,
      gender,
      nationality,
      certificateNumber,
      profession,
      issueDateHijri,
      issueDateGregorian,
      expiryDateHijri,
      expiryDateGregorian,
      programType,
      programEndDate,
      licenseNumber,
      facilityName,
      facilityNumber,
      amanah,
      municipality,
      status,
    } = req.body || {};

    let uniqueKey = generateUniqueKey();
    // Ensure the generated key is unique.
    while (await Certificate.exists({ uniqueKey })) {
      uniqueKey = generateUniqueKey();
    }

    let userPhoto = '';
    if (req.file) {
      try {
        if (isCloudinaryConfigured()) {
          const result = await cloudinary.uploader.upload(req.file.buffer, {
            folder: 'health-certificate-portal',
            resource_type: 'image',
          });
          userPhoto = result.secure_url;
        } else {
          // Vercel serverless has no persistent filesystem; skip local save.
          console.warn('Cloudinary not configured; photo not saved on serverless.');
        }
      } catch (uploadErr) {
        console.error('Photo upload failed:', uploadErr.message);
        // Continue without photo rather than failing the whole request.
      }
    }

    const certificate = await Certificate.create({
      uniqueKey,
      status: status || 'active',
      userPhoto,
      amanah: amanah || '',
      municipality: municipality || '',
      name: name || '',
      identityNumber: identityNumber || '',
      gender: gender || '',
      nationality: nationality || '',
      certificateNumber: certificateNumber || '',
      profession: profession || '',
      issueDateHijri: issueDateHijri || '',
      issueDateGregorian: issueDateGregorian || '',
      expiryDateHijri: expiryDateHijri || '',
      expiryDateGregorian: expiryDateGregorian || '',
      programType: programType || '',
      programEndDate: programEndDate || '',
      licenseNumber: licenseNumber || '',
      facilityName: facilityName || '',
      facilityNumber: facilityNumber || '',
    });

    const url = await verificationUrl(certificate.uniqueKey);
    const qrCode = await generateQRDataUrl(url);
    res.status(201).json({
      message: 'Certificate created.',
      certificate,
      qrCode,
      verificationUrl: url,
    });
  } catch (error) {
    console.error('Create certificate error:', error.message);
    res.status(500).json({ message: 'Failed to create certificate.', error: error.message });
  }
});

// --- Admin: update a certificate ---
router.put('/:id', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found.' });
    }

    const updatable = [
      'name',
      'identityNumber',
      'gender',
      'nationality',
      'certificateNumber',
      'profession',
      'issueDateHijri',
      'issueDateGregorian',
      'expiryDateHijri',
      'expiryDateGregorian',
      'programType',
      'programEndDate',
      'licenseNumber',
      'facilityName',
      'facilityNumber',
      'amanah',
      'municipality',
      'status',
    ];

    updatable.forEach((field) => {
      if (req.body[field] !== undefined) {
        certificate[field] = req.body[field];
      }
    });

    if (req.file) {
      // Remove old local photo when replaced.
      if (certificate.userPhoto && certificate.userPhoto.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', certificate.userPhoto);
        try { fs.unlinkSync(oldPath); } catch (_) {}
      }

      try {
        if (isCloudinaryConfigured()) {
          const result = await cloudinary.uploader.upload(req.file.buffer, {
            folder: 'health-certificate-portal',
            resource_type: 'image',
          });
          certificate.userPhoto = result.secure_url;
        } else {
          // Vercel serverless has no persistent filesystem; skip local save.
          console.warn('Cloudinary not configured; photo not saved on serverless.');
        }
      } catch (uploadErr) {
        console.error('Photo upload failed:', uploadErr.message);
      }
    }

    await certificate.save();
    const url = await verificationUrl(certificate.uniqueKey);
    const qrCode = await generateQRDataUrl(url);
    res.json({
      message: 'Certificate updated.',
      certificate,
      qrCode,
      verificationUrl: url,
    });
  } catch (error) {
    console.error('Update certificate error:', error.message);
    res.status(500).json({ message: 'Failed to update certificate.', error: error.message });
  }
});

// --- Admin: delete a certificate ---
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const certificate = await Certificate.findByIdAndDelete(req.params.id);
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found.' });
    }
    // Remove local photo if present.
    if (certificate.userPhoto && certificate.userPhoto.startsWith('/uploads/')) {
      try { fs.unlinkSync(path.join(__dirname, '..', certificate.userPhoto)); } catch (_) {}
    }
    res.json({ message: 'Certificate deleted.' });
  } catch (error) {
    console.error('Delete certificate error:', error.message);
    res.status(500).json({ message: 'Failed to delete certificate.' });
  }
});

// --- Admin: activate / deactivate a certificate ---
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!['active', 'deactive'].includes(status)) {
      return res.status(400).json({ message: 'Status must be "active" or "deactive".' });
    }

    const certificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found.' });
    }
    res.json({ message: `Certificate ${status}.`, certificate });
  } catch (error) {
    console.error('Update status error:', error.message);
    res.status(500).json({ message: 'Failed to update status.' });
  }
});

// --- Public: verify a certificate by unique key ---
router.get('/verify/:uniqueKey', async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ uniqueKey: req.params.uniqueKey }).select(
      PUBLIC_FIELDS
    );
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found.' });
    }
    const url = await verificationUrl(certificate.uniqueKey);
    const qrCode = await generateQRDataUrl(url);
    res.json({
      certificate,
      verificationUrl: url,
      qrCode,
    });
  } catch (error) {
    console.error('Verify certificate error:', error.message);
    res.status(500).json({ message: 'Verification failed.' });
  }
});

// --- Public: QR code for a certificate's verification URL ---
router.get('/:id/qr', async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id).select('uniqueKey');
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found.' });
    }
    const url = await verificationUrl(certificate.uniqueKey);
    const qrCode = await generateQRDataUrl(url);
    res.json({ qrCode, verificationUrl: url });
  } catch (error) {
    console.error('QR code error:', error.message);
    res.status(500).json({ message: 'Failed to generate QR code.' });
  }
});

// --- Public: redirect endpoint for QR codes ---
// Redirects to the verification page on the same deployment.
// Both Main and Backup deployments serve this identical route, so existing
// QR codes keep working even if the active destination is switched.
router.get('/r/:uniqueKey', async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      uniqueKey: req.params.uniqueKey,
    }).select('uniqueKey status');
    if (!certificate) {
      return res.status(404).send('Certificate not found.');
    }
    // Redirect to the verification page on this same deployment.
    const origin = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(
      /\/+$/,
      ''
    );
    return res.redirect(`${origin}/verify/${certificate.uniqueKey}`);
  } catch (error) {
    console.error('Redirect error:', error.message);
    return res.status(500).send('Redirect failed.');
  }
});

module.exports = router;