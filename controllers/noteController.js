const Note = require('../models/noteModel');
const path = require('path');
const fs = require('fs');

// @desc    Upload a new note
// @route   POST /api/notes
// @access  Private
const uploadNote = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const { title, description, subject, semester } = req.body;

        if (!title) {
            // cleanup the uploaded file if validation fails
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Please add a title' });
        }

        const note = await Note.create({
            title,
            description,
            filePath: req.file.path,
            originalFileName: req.file.originalname,
            fileType: req.file.mimetype,
            size: req.file.size,
            subject,
            semester,
            uploader: req.user.id, // Comes from authMiddleware
        });

        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all notes (with optional filtering)
// @route   GET /api/notes
// @access  Public or Private depending on requirement (Let's make it Public for browsing)
const getNotes = async (req, res) => {
    try {
        // Basic filtering via query params
        const { subject, semester, keyword } = req.query;
        let query = {};
        
        if (subject) query.subject = subject;
        if (semester) query.semester = semester;
        if (keyword) query.title = { $regex: keyword, $options: 'i' };

        const notes = await Note.find(query).populate('uploader', 'name role');
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private (Uploader, Teacher, or Admin)
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Check for user ownership or admin/teacher privilege
        if (note.uploader.toString() !== req.user.id && req.user.role === 'student') {
            return res.status(401).json({ message: 'Not authorized to delete this note' });
        }

        // Remove file from filesystem
        if (fs.existsSync(note.filePath)) {
            fs.unlinkSync(note.filePath);
        }

        await note.deleteOne();

        res.status(200).json({ id: req.params.id, message: 'Note deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Teacher specific note broadcast endpoint
// @route   POST /api/notes/broadcast
// @access  Private (Teacher, Admin)
const broadcastNote = async (req, res) => {
    // This is essentially same as uploadNote but with additional metadata targeting specific class segments
    // Placeholder functionality
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file to broadcast' });
        }
        res.status(201).json({ message: 'Note successfully broadcasted to target segment', file: req.file.originalname });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    uploadNote,
    getNotes,
    deleteNote,
    broadcastNote
};
