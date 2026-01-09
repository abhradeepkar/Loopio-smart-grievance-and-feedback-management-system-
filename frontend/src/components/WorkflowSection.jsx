import React from 'react';
import './WorkflowSection.css';
import { FaUser, FaUserShield, FaCode, FaSignInAlt, FaDatabase, FaClipboardList, FaCheckCircle, FaChartBar, FaPaperPlane } from 'react-icons/fa';

const WorkflowSection = () => {
    return (
        <section className="wf-section">
            <h2 className="hp-section-title">How It Works</h2>

            <div className="wf-tree">
                {/* Level 1: Start */}
                <div className="wf-node wf-start">START</div>
                <div className="wf-line-vertical"></div>

                {/* Level 2: Login */}
                <div className="wf-node wf-box">
                    <FaSignInAlt className="wf-icon" /> Login or Signup
                </div>
                <div className="wf-line-vertical"></div>

                {/* Level 3: Decision */}
                <div className="wf-node wf-diamond">
                    <span>Identify User Role</span>
                </div>

                {/* Connecting lines for branches */}
                <div className="wf-branch-connectors">
                    <div className="wf-connector-line"></div>
                </div>

                {/* Level 4: Branches */}
                <div className="wf-branches">

                    {/* Branch 1: User */}
                    <div className="wf-branch">
                        <div className="wf-branch-label">User</div>
                        <div className="wf-line-vertical-small"></div>
                        <div className="wf-node wf-box wf-user">
                            <FaUser className="wf-icon" /> User Dashboard
                        </div>
                        <div className="wf-line-vertical"></div>
                        <div className="wf-node wf-box">
                            <FaPaperPlane className="wf-icon" /> Submit Feedback
                        </div>
                        <div className="wf-line-vertical"></div>
                        <div className="wf-node wf-box wf-db">
                            <FaDatabase className="wf-icon" /> Saved in MongoDB
                        </div>
                    </div>

                    {/* Branch 2: Admin */}
                    <div className="wf-branch">
                        <div className="wf-branch-label">Admin</div>
                        <div className="wf-line-vertical-small"></div>
                        <div className="wf-node wf-box wf-admin">
                            <FaUserShield className="wf-icon" /> Admin Dashboard
                        </div>
                        <div className="wf-line-vertical"></div>

                        {/* Admin Split */}
                        <div className="wf-admin-split">
                            <div className="wf-sub-branch">
                                <div className="wf-node wf-box">
                                    <FaClipboardList className="wf-icon" /> View All Feedbacks
                                </div>
                                <div className="wf-line-vertical"></div>
                                <div className="wf-node wf-box">
                                    Assign to Developer
                                </div>
                                <div className="wf-line-vertical"></div>
                                <div className="wf-node wf-box wf-db">
                                    <FaDatabase className="wf-icon" /> Saved in MongoDB
                                </div>
                            </div>

                            {/* Analytics Path */}
                            <div className="wf-connector-curve-container">
                                <div className="wf-connector-curve"></div>
                            </div>

                            <div className="wf-sub-branch-right">
                                <div className="wf-node wf-box">
                                    <FaChartBar className="wf-icon" /> Analytics & Reports
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Branch 3: Developer */}
                    <div className="wf-branch">
                        <div className="wf-branch-label">Developer</div>
                        <div className="wf-line-vertical-small"></div>
                        <div className="wf-node wf-box wf-dev">
                            <FaCode className="wf-icon" /> Developer Dashboard
                        </div>
                        <div className="wf-line-vertical"></div>
                        <div className="wf-node wf-box">
                            <FaClipboardList className="wf-icon" /> View Assigned Feedback
                        </div>
                        <div className="wf-line-vertical"></div>
                        <div className="wf-node wf-box">
                            <FaCheckCircle className="wf-icon" /> Update Status
                        </div>
                        <div className="wf-line-vertical"></div>
                        <div className="wf-node wf-box wf-db">
                            <FaDatabase className="wf-icon" /> Status Saved
                        </div>
                    </div>

                </div>

                {/* Final End Node */}
                <div className="wf-line-vertical-long"></div>
                <div className="wf-node wf-start">END</div>

            </div>
        </section>
    );
};

export default WorkflowSection;
