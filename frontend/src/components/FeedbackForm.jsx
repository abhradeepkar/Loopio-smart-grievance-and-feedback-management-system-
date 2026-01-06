import React, { useState } from 'react';
import { useFeedback } from '../context/FeedbackContext';
import './FeedbackForm.css';

const FeedbackForm = ({ onClose, initialData = null }) => {
    const { addFeedback, editFeedback } = useFeedback();
    const [formData, setFormData] = useState(initialData || {
        title: '',
        category: 'Software Issue',
        priority: 'Medium',
        description: '',
        file: null
    });
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'file' && files && files[0]) {
            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 2000);
        }

        setFormData(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Create a clean payload with only editable fields
        const payload = {
            title: formData.title,
            category: formData.category,
            priority: formData.priority,
            description: formData.description,
            file: formData.file
        };

        if (initialData) {
            await editFeedback(initialData._id, payload);
        } else {
            await addFeedback(payload);
        }
        onClose();
    };

    return (
        <div className="feedback-modal-overlay">
            <div className="feedback-modal">
                <div className="modal-header">
                    <h2>{initialData ? 'Edit Feedback' : 'Submit Feedback'}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="Brief summary of the issue"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Category</label>
                            <select name="category" value={formData.category} onChange={handleChange}>
                                <option>Software Issue</option>
                                <option>Feature Request</option>
                                <option>HR Issue</option>
                                <option>Project Issue</option>
                                <option>Workplace Issue</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Priority</label>
                            <select name="priority" value={formData.priority} onChange={handleChange}>
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            placeholder="Detailed explanation..."
                            rows="5"
                        />
                    </div>

                    <div className="form-group">
                        <label>Attachment (Optional)</label>
                        <input
                            type="file"
                            name="file"
                            onChange={handleChange}
                        />
                        {uploadSuccess && <p className="upload-success-message">File Uploaded</p>}
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="submit-btn">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackForm;
