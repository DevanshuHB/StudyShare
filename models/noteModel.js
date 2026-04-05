const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a title for the note'],
        },
        description: {
            type: String,
        },
        filePath: {
            type: String,
            required: [true, 'File path is required'],
        },
        originalFileName: {
            type: String,
            required: true,
        },
        fileType: {
            type: String,
        },
        size: {
            type: Number,
        },
        subject: {
            type: String,
            default: 'General',
        },
        semester: {
            type: String,
        },
        uploader: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        downloads: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Note = mongoose.model('Note', noteSchema);
module.exports = Note;
