import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { FaUser, FaLock, FaPalette, FaTrash, FaCamera, FaSave, FaMoon, FaSun, FaExclamationTriangle } from 'react-icons/fa';
import Popup from './Popup';
import './SettingsPage.css';

const SettingsPage = () => {
    const { user, updateProfile, deleteAccount, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { showToast } = useToast();

    // Form States
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [removePhoto, setRemovePhoto] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);

    // Initialize data
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || ''
            });
            if (user.profilePicture) {
                setPreviewUrl(`http://localhost:5000/${user.profilePicture}`);
            }
        }
    }, [user]);

    // Handlers
    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setRemovePhoto(false);
        }
    };

    const handleRemovePhoto = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setRemovePhoto(true);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('name', profileData.name);
        formData.append('email', profileData.email);
        formData.append('phone', profileData.phone);
        formData.append('address', profileData.address);

        if (selectedFile) {
            formData.append('profilePicture', selectedFile);
        }
        if (removePhoto) {
            formData.append('deleteProfilePicture', 'true');
        }

        const res = await updateProfile(formData);

        if (res.success) {
            showToast('Profile updated successfully', 'success');
            // Clean up file selection
            setSelectedFile(null);
            setRemovePhoto(false);
        } else {
            showToast(res.message || 'Failed to update profile', 'error');
        }
        setLoading(false);
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }
        if (!passwordData.newPassword) return;

        setLoading(true);
        // We reuse the updateProfile endpoint or a specific changePassword endpoint if available
        // AuthProvider's updateProfile might not handle password verification correctly if it expects specific fields
        // Checking backend authController: updateUserProfile DOES NOT handle password change logic securely (it's commented out)
        // We really should use the /api/users/password endpoint.
        // Let's implement a direct fetch here to be safe and correct.

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/users/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    oldPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await res.json();
            if (res.ok) {
                showToast('Password changed successfully', 'success');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                showToast(data.message || 'Failed to change password', 'error');
            }
        } catch (error) {
            showToast('Network error changing password', 'error');
        }
        setLoading(false);
    };

    const handleDeleteClick = () => {
        setShowDeletePopup(true);
    };

    const confirmDeleteAccount = async () => {
        setShowDeletePopup(false); // Close first usually, or keep open and show loading?
        // User wants "delete accout click korle jemon message show kore thik sei rokom message jeno showhoy"
        // Meaning behaves like the registration popup (simple message). 
        // But for delete, we need a choice.
        // My Popup component supports 'danger' type with confirm/cancel.

        const res = await deleteAccount();
        if (!res.success) {
            showToast(res.message || 'Failed to delete account', 'error');
        }
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <h2>Account Settings</h2>
                <p className="settings-subtitle">Manage your profile, preferences, and security</p>
            </div>

            <div className="settings-grid">

                {/* 1. Profile Card (Left Column) */}
                <div className="settings-card profile-card-container">
                    <div className="card-header">
                        <div className="card-icon" style={{ background: 'linear-gradient(135deg, #00D2FF 0%, #3A7BD5 100%)' }}>
                            <FaUser />
                        </div>
                        <span className="card-title">Profile Info</span>
                    </div>

                    <div className="profile-content">
                        <div className="settings-avatar-wrapper">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Avatar" className="settings-avatar" />
                            ) : (
                                <div className="settings-avatar">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            )}

                            <div className="avatar-actions">
                                <label className="btn-icon-circle btn-upload" title="Upload Photo">
                                    <FaCamera />
                                    <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                                </label>
                                {(previewUrl || user?.profilePicture) && (
                                    <button className="btn-icon-circle btn-remove" onClick={handleRemovePhoto} title="Remove Photo">
                                        <FaTrash />
                                    </button>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleUpdateProfile} style={{ width: '100%' }}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profileData.name}
                                    onChange={handleProfileChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profileData.email}
                                    onChange={handleProfileChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={profileData.phone}
                                    onChange={handleProfileChange}
                                    className="form-input"
                                    placeholder="+1234567890"
                                />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={profileData.address}
                                    onChange={handleProfileChange}
                                    className="form-input"
                                    placeholder="City, Country"
                                />
                            </div>
                            <button type="submit" className="btn-save" disabled={loading}>
                                {loading ? 'Saving...' : <><FaSave /> Save Changes</>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column Stack */}
                <div className="right-column-stack">

                    {/* 2. Preferences Card */}
                    <div className="settings-card">
                        <div className="card-header">
                            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%)' }}>
                                <FaPalette />
                            </div>
                            <span className="card-title">Appearance</span>
                        </div>

                        <div className="theme-row">
                            <div className="theme-label">
                                <p>Dark Mode</p>
                                <span>Switch between light and dark themes</span>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={theme === 'dark'}
                                    onChange={toggleTheme}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>

                    {/* 3. Security Card */}
                    <div className="settings-card">
                        <div className="card-header">
                            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #01B574 0%, #009357 100%)' }}>
                                <FaLock />
                            </div>
                            <span className="card-title">Security</span>
                        </div>

                        <form onSubmit={handleUpdatePassword}>
                            <div className="form-group">
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    className="form-input"
                                    placeholder="Need this to verify it's you"
                                />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="form-input"
                                    placeholder="At least 6 characters"
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="form-input"
                                />
                            </div>
                            <button type="submit" className="btn-save" disabled={loading} style={{ marginTop: '10px' }}>
                                <FaLock /> Update Password
                            </button>
                        </form>
                    </div>

                    {/* 4. Danger Zone */}
                    <div className="settings-card" style={{ borderColor: 'rgba(255, 92, 92, 0.3)' }}>
                        <div className="card-header" style={{ borderBottomColor: 'rgba(255, 92, 92, 0.2)' }}>
                            <div className="card-icon" style={{ background: '#FF5C5C' }}>
                                <FaExclamationTriangle />
                            </div>
                            <span className="card-title" style={{ color: '#FF5C5C' }}>Danger Zone</span>
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--vision-text-muted)', marginBottom: '15px' }}>
                            Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <button className="btn-danger" onClick={handleDeleteClick}>
                            <FaTrash /> Delete Account
                        </button>
                    </div>

                </div>
            </div>

            <Popup
                isOpen={showDeletePopup}
                onClose={() => setShowDeletePopup(false)}
                title="Delete Account?"
                message="Are you sure you want to permanently delete your account? This action cannot be undone."
                type="danger"
                confirmText="Yes, Delete"
                cancelText="Cancel"
                onConfirm={confirmDeleteAccount}
            />
        </div >
    );
};

export default SettingsPage;
