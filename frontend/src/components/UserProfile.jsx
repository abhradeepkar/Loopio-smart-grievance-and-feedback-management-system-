import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { FaCamera, FaTrash } from 'react-icons/fa';
import Popup from './Popup';
import './UserProfile.css';

const UserProfile = ({ onClose }) => {
    const { user, updateProfile, deleteAccount } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || ''
    });
    const [message, setMessage] = useState('');



    const [selectedFile, setSelectedFile] = useState(null);
    const [removePhoto, setRemovePhoto] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setRemovePhoto(false); // Reset delete flag if new file selected
        }
    };

    const handleRemovePhoto = () => {
        setSelectedFile(null);
        setRemovePhoto(true);
    };

    const handleSubmit = async () => {
        // Create FormData to send file + text data
        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        data.append('address', formData.address);

        if (selectedFile) {
            data.append('profilePicture', selectedFile);
        }
        if (removePhoto) {
            data.append('deleteProfilePicture', 'true');
        }

        const res = await updateProfile(data); // Send FormData
        if (res.success) {
            setMessage('Profile updated successfully!');
            setTimeout(() => {
                setIsEditing(false);
                setMessage('');
                setSelectedFile(null); // Reset file
                setRemovePhoto(false);
            }, 1500);
        } else {
            setMessage(res.message || 'Update failed');
        }
    };



    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content profile-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEditing ? 'Edit Profile' : 'My Profile'}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="profile-body">
                    <div className="profile-avatar-large" style={{ position: 'relative' }}>
                        {(!removePhoto && (selectedFile || user.profilePicture)) ? (
                            <img
                                src={selectedFile ? URL.createObjectURL(selectedFile) : `http://localhost:5000/${user.profilePicture}`}
                                alt="Profile"
                                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                            />
                        ) : (
                            user.name.charAt(0).toUpperCase()
                        )}
                        {isEditing && (
                            <div style={{ position: 'absolute', bottom: '0', right: '0', display: 'flex', gap: '5px' }}>
                                <label htmlFor="profile-upload" className="upload-icon" style={{
                                    background: 'linear-gradient(135deg, #00D2FF 0%, #3A7BD5 100%)',
                                    color: 'white', borderRadius: '50%',
                                    width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', border: '2px solid white',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}>
                                    <FaCamera size={14} />
                                    <input
                                        id="profile-upload"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                    />
                                </label>
                                {(user.profilePicture || selectedFile) && !removePhoto && (
                                    <button onClick={handleRemovePhoto} style={{
                                        background: '#FF5C5C', color: 'white', borderRadius: '50%',
                                        width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', border: '2px solid white',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }} title="Remove Photo">
                                        <FaTrash size={12} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {message && <p className="status-message">{message}</p>}

                    <div className="profile-details">
                        {isEditing ? (
                            <>
                                <div className="detail-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="edit-input"
                                    />
                                </div>
                                <div className="detail-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="edit-input"
                                    />
                                </div>
                                <div className="detail-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="edit-input"
                                        placeholder="+88017..."
                                    />
                                </div>
                                <div className="detail-group">
                                    <label>Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="edit-input"
                                        placeholder="Dhaka, Bangladesh"
                                    />
                                </div>

                            </>
                        ) : (
                            <>
                                <div className="detail-group">
                                    <label>Full Name</label>
                                    <p>{user.name}</p>
                                </div>
                                <div className="detail-group">
                                    <label>Email Address</label>
                                    <p>{user.email}</p>
                                </div>
                                {user.phone && (
                                    <div className="detail-group">
                                        <label>Phone Number</label>
                                        <p>{user.phone}</p>
                                    </div>
                                )}
                                {user.address && (
                                    <div className="detail-group">
                                        <label>Address</label>
                                        <p>{user.address}</p>
                                    </div>
                                )}
                                <div className="detail-group">
                                    <label>Role</label>
                                    <span className="role-badge">{user.role}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    {isEditing ? (
                        <>
                            <button className="secondary-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                            <button className="primary-btn" onClick={handleSubmit}>Save Changes</button>
                        </>
                    ) : (
                        <>

                            <button className="secondary-btn" onClick={onClose}>Close</button>
                            <button className="primary-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
                        </>
                    )}
                </div>


            </div >
        </div >
    );
};

export default UserProfile;
