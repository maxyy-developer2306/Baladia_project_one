// Settings routes.
// Admin-protected: get and set the active redirect deployment (main or backup).
const express = require('express');
const Setting = require('../models/Settings');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/settings/redirect-destination
router.get('/redirect-destination', authMiddleware, async (req, res) => {
  try {
    const value = await Setting.getSetting(
      'activeRedirectDeployment',
      process.env.ACTIVE_DEPLOYMENT || 'main'
    );
    res.json({ activeRedirectDeployment: value });
  } catch (error) {
    console.error('Get redirect destination error:', error.message);
    res.status(500).json({ message: 'Failed to load redirect destination.' });
  }
});

// PUT /api/settings/redirect-destination
router.put('/redirect-destination', authMiddleware, async (req, res) => {
  try {
    const { activeRedirectDeployment } = req.body || {};
    if (!['main', 'backup'].includes(activeRedirectDeployment)) {
      return res.status(400).json({
        message: 'activeRedirectDestination must be "main" or "backup".',
      });
    }
    await Setting.setSetting('activeRedirectDeployment', activeRedirectDeployment);
    res.json({
      message: 'Redirect destination updated.',
      activeRedirectDeployment,
    });
  } catch (error) {
    console.error('Set redirect destination error:', error.message);
    res.status(500).json({ message: 'Failed to update redirect destination.' });
  }
});

module.exports = router;