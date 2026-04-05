const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { uploadNote, getNotes, deleteNote, broadcastNote } = require('../controllers/noteController');

router.route('/')
    .get(getNotes)
    .post(protect, upload.single('note-file'), uploadNote);

router.route('/:id')
    .delete(protect, deleteNote);

// Teacher/Admin specific routes
router.post('/broadcast', protect, authorizeRoles('teacher', 'admin'), upload.single('note-file'), broadcastNote);

module.exports = router;
