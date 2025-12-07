import React from 'react';
import { User, MapPin, Briefcase, Link2, Globe, Save, Loader2, CheckCircle, AlertCircle, FileText, Upload, Trash2, Download, Sparkles } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../../apiConfig';

const ProfileManagement = ({ onRefresh }) => {
 const [loading, setLoading] = React.useState(true);
 const [saving, setSaving] = React.useState(false);
 const [message, setMessage] = React.useState(null);
 const [profile, setProfile] = React.useState({
 fullName: '',
 email: '',
 username: '',
 location: '',
 yearsOfExperience: 0,
 preferredLocations: '',
 linkedInURL: '',
 timezone: '',
 profileCompletionScore: 0,
 consents: [],
 notifications: []
 });

 // Document upload state
 const [documents, setDocuments] = React.useState([]);
 const [uploading, setUploading] = React.useState(false);
 const [selectedFile, setSelectedFile] = React.useState(null);
 const [documentType, setDocumentType] = React.useState('Resume');

 // Extracted skills state
 const [extractedSkills, setExtractedSkills] = React.useState([]);

 React.useEffect(() => {
 fetchProfile();
 fetchDocuments();
 }, []);

 const fetchDocuments = async () => {
 try {
 const res = await axios.get(`${API_BASE}/candidates/documents`);
 setDocuments(res.data);
 } catch (err) {
 console.error("Fetch Documents Error:", err);
 }
 };const fetchProfile = async () => {
 setLoading(true);
 try {
 const res = await axios.get(`${API_BASE}/candidates/profile`);
 setProfile(res.data);
 } catch (err) {
 console.error("Fetch Profile Error:", err);
 setMessage({ type: 'error', text: 'Failed to load profile' });
 } finally {
 setLoading(false);
 }
 };

 const handleChange = (e) => {
 const { name, value } = e.target;
 setProfile(prev => ({ ...prev, [name]: value }));
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 setSaving(true);
 setMessage(null);
 try {
 await axios.put(`${API_BASE}/candidates/profile`, {
 fullName: profile.fullName,
 location: profile.location,
 yearsOfExperience: parseInt(profile.yearsOfExperience) || 0,
 preferredLocations: profile.preferredLocations,
 linkedInURL: profile.linkedInURL,
 timezone: profile.timezone
 });
 setMessage({ type: 'success', text: 'Profile updated.' });
 if (onRefresh) onRefresh();
 } catch (err) {
 console.error("Update Profile Error:", err);
 setMessage({ type: 'error', text: 'Failed to update profile' });
 } finally {
 setSaving(false);
 }
 };

 const handleConsentToggle = async (consentType, currentStatus) => {
 try {
 await axios.put(`${API_BASE}/candidates/profile/consent`, {
 consentType,
 isGranted: !currentStatus
 });
 await fetchProfile();
 setMessage({ type: 'success', text: 'Consent preferences updated.' });
 } catch (err) {
 console.error("Update Consent Error:", err);
 setMessage({ type: 'error', text: 'Failed to update consent preferences' });
 }
 };

 // Document upload handlers
 const handleFileSelect = (e) => {
 const file = e.target.files[0];
 if (file) {
 // Validate file size (5MB max)
 if (file.size > 5 * 1024 * 1024) {
 setMessage({ type: 'error', text: 'File size must be less than 5MB' });
 return;
 }
 // Validate file type
 const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
 if (!allowedTypes.includes(file.type)) {
 setMessage({ type: 'error', text: 'Invalid file type. Allowed: PDF, DOCX, JPG, PNG' });
 return;
 }
 setSelectedFile(file);
 setMessage(null);
 }
 };

 const handleUpload = async () => {
 if (!selectedFile) {
 setMessage({ type: 'error', text: 'Please select a file to upload' });
 return;
 }

 setUploading(true);
 setMessage(null);

 try {
 const formData = new FormData();
 formData.append('file', selectedFile);
 formData.append('documentType', documentType);

 const res = await axios.post(`${API_BASE}/candidates/documents/upload`, formData, {
 headers: {
 'Content-Type': 'multipart/form-data'
 }
 });

 setMessage({ type: 'success', text: res.data.message || 'Document uploaded successfully!' });
 setSelectedFile(null);
 await fetchDocuments();
 // Skip extracted skills fetch - route not working
 // await 
 await fetchProfile(); // Refresh to get updated skills
 } catch (err) {
 console.error("Upload Error:", err);
 setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to upload document' });
 } finally {
 setUploading(false);
 }
 };

 const handleDeleteDocument = async (docType) => {
 if (!confirm(`Are you sure you want to delete your ${docType}?`)) return;

 try {
 await axios.delete(`${API_BASE}/candidates/documents/${docType}`);
 setMessage({ type: 'success', text: `${docType} deleted successfully!` });
 await fetchDocuments();
 } catch (err) {
 console.error("Delete Error:", err);
 setMessage({ type: 'error', text: 'Failed to delete document' });
 }
 };

 const handleDownloadResume = async () => {
 try {
 const res = await axios.get(`${API_BASE}/candidates/documents/resume/download`, {
 responseType: 'blob'
 });
 const url = window.URL.createObjectURL(new Blob([res.data]));
 const link = document.createElement('a');
 link.href = url;
 link.setAttribute('download', 'resume.pdf');
 document.body.appendChild(link);
 link.click();
 link.remove();
 } catch (err) {
 console.error("Download Error:", err);
 setMessage({ type: 'error', text: 'Failed to download resume' });
 }
 };

 if (loading) {
 return (
 <div className="flex flex-col items-center justify-center py-20">
 <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mb-4" />
 <p className="text-[11px] font-semibold text-[var(--text-muted)]">Loading profile...</p>
 </div>
 );
 }

 return (
 <div className="space-y-5 sm:space-y-8">
 {/* Profile Completion Score */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center gap-3">
 <User className="w-5 h-5 text-[var(--accent)]" />
 <h3 className="text-sm font-medium">Profile Completion</h3>
 </div>
 <span className="text-xl sm:text-2xl font-semibold text-[var(--accent)]">{profile.profileCompletionScore}%</span>
 </div>
 <div className="w-full bg-[var(--bg-primary)] rounded-full h-4">
 <div
 className="bg-[var(--accent)] h-4 rounded-full transition-all duration-500"
 style={{ width: `${profile.profileCompletionScore}%` }}
 ></div>
 </div>
 <p className="text-[11px] text-[var(--text-muted)] mt-2">
 Complete your profile to increase your chances of getting hired!
 </p>
 </div>

 {/* Message Toast */}
 {message && (
 <div className={`flex items-center gap-2 p-4 rounded-2xl ${message.type === 'success'
 ? 'bg-[var(--success)]/10 text-[var(--success)] border border-emerald-500/20'
 : 'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20'
 }`}>
 {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
 <span className="text-xs font-bold">{message.text}</span>
 </div>
 )}

 {/* Basic Information */}
 <form onSubmit={handleSubmit} className="glass-card rounded-[var(--radius-xl)] p-8">
 <h3 className="text-lg font-medium mb-6">Basic Information</h3>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
 <div>
 <label className="text-[11px] font-medium text-[var(--text-muted)] block mb-2">
 <User size={12} className="inline mr-1" />
 Full Name
 </label>
 <input
 type="text"
 name="fullName"
 value={profile.fullName}
 onChange={handleChange}
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-normal focus:outline-none focus:border-[var(--accent)]"
 />
 </div>

 <div>
 <label className="text-[11px] font-medium text-[var(--text-muted)] block mb-2">
 Email
 </label>
 <input
 type="email"
 value={profile.email}
 disabled
 className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-normal text-[var(--text-muted)] cursor-not-allowed"
 />
 </div>

 <div>
 <label className="text-[11px] font-medium text-[var(--text-muted)] block mb-2">
 <MapPin size={12} className="inline mr-1" />
 Location
 </label>
 <input
 type="text"
 name="location"
 value={profile.location || ''}
 onChange={handleChange}
 placeholder="City, Country"
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-normal focus:outline-none focus:border-[var(--accent)]"
 />
 </div>

 <div>
 <label className="text-[11px] font-medium text-[var(--text-muted)] block mb-2">
 <Briefcase size={12} className="inline mr-1" />
 Years of Experience
 </label>
 <input
 type="number"
 name="yearsOfExperience"
 value={profile.yearsOfExperience}
 onChange={handleChange}
 min="0"
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-normal focus:outline-none focus:border-[var(--accent)]"
 />
 </div>

 <div>
 <label className="text-[11px] font-medium text-[var(--text-muted)] block mb-2">
 <Link2 size={12} className="inline mr-1" />
 LinkedIn URL
 </label>
 <input
 type="url"
 name="linkedInURL"
 value={profile.linkedInURL || ''}
 onChange={handleChange}
 placeholder="https://linkedin.com/in/yourprofile"
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-normal focus:outline-none focus:border-[var(--accent)]"
 />
 </div>

 <div>
 <label className="text-[11px] font-medium text-[var(--text-muted)] block mb-2">
 <Globe size={12} className="inline mr-1" />
 Timezone
 </label>
 <select
 name="timezone"
 value={profile.timezone || ''}
 onChange={handleChange}
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-normal focus:outline-none focus:border-[var(--accent)]"
 >
 <option value="">Select Timezone</option>
 <option value="Bangladesh Standard Time">Bangladesh (UTC+06:00)</option>
 <option value="Eastern Standard Time">US Eastern (UTC-05:00)</option>
 <option value="Pacific Standard Time">US Pacific (UTC-08:00)</option>
 <option value="GMT Standard Time">UK (UTC+00:00)</option>
 <option value="Central European Standard Time">Central Europe (UTC+01:00)</option>
 <option value="India Standard Time">India (UTC+05:30)</option>
 <option value="China Standard Time">China (UTC+08:00)</option>
 <option value="Japan Standard Time">Japan (UTC+09:00)</option>
 <option value="Australian Eastern Standard Time">Australia (UTC+10:00)</option>
 </select>
 </div>
 </div>

 <div className="mt-6">
 <label className="text-[11px] font-medium text-[var(--text-muted)] block mb-2">
 Preferred Locations
 </label>
 <input
 type="text"
 name="preferredLocations"
 value={profile.preferredLocations || ''}
 onChange={handleChange}
 placeholder="Remote, New York, London, etc."
 className="w-full bg-[var(--bg-accent)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-sm font-normal focus:outline-none focus:border-[var(--accent)]"
 />
 </div>

 <button
 type="submit"
 disabled={saving}
 className="mt-8 px-8 py-4 bg-[var(--accent)] text-white rounded-2xl font-semibold text-xs hover:bg-[var(--accent-hover)] transition-all disabled:opacity-50 flex items-center gap-2"
 >
 {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
 {saving ? 'Saving...' : 'Save Changes'}
 </button>
 </form>

 {/* Privacy & Consent */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h3 className="text-lg font-medium mb-6">Privacy & Consent</h3>

 <div className="space-y-4">
 {/* Default consent types from database schema */}
 {[
 { type: 'DataProcessing', label: 'Data Processing', description: 'Allow processing of your application data' },
 { type: 'Marketing', label: 'Marketing', description: 'Receive updates about new job opportunities' },
 { type: 'Retention', label: 'Data Retention', description: 'Allow storing your profile for future opportunities' },
 { type: 'ThirdPartySharing', label: 'Third Party Sharing', description: 'Share profile with partner companies' }
 ].map((consentOption) => {
 // Find existing consent status or default to false
 const existingConsent = profile.consents?.find(c =>
 (c.ConsentType || c.consentType) === consentOption.type
 );
 const isGranted = existingConsent ? (existingConsent.IsGranted ?? existingConsent.isGranted ?? false) : false;

 return (
 <div key={consentOption.type} className="flex items-center justify-between p-4 bg-[var(--bg-accent)] rounded-2xl">
 <div>
 <p className="font-semibold text-sm">{consentOption.label}</p>
 <p className="text-[11px] text-[var(--text-muted)]">{consentOption.description}</p>
 </div>
 <button
 onClick={() => handleConsentToggle(consentOption.type, isGranted)}
 className={`px-4 py-2 rounded-xl font-semibold text-xs transition-all ${isGranted
 ? 'bg-[var(--success)]/20 text-[var(--success)] border border-emerald-500/30'
 : 'bg-[var(--danger)]/20 text-[var(--danger)] border border-rose-500/30'
 }`}
 >
 {isGranted ? 'Granted' : 'Denied'}
 </button>
 </div>
 );
 })}
 </div>
 </div>

 {/* Account Info */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <h3 className="text-lg font-medium mb-6">Account Information</h3>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
 <div className="p-4 bg-[var(--bg-accent)] rounded-2xl">
 <p className="text-[11px] font-medium text-[var(--text-muted)] mb-1">Username</p>
 <p className="font-semibold">{profile.username}</p>
 </div>
 <div className="p-4 bg-[var(--bg-accent)] rounded-2xl">
 <p className="text-[11px] font-medium text-[var(--text-muted)] mb-1">Last Login</p>
 <p className="font-semibold">
 {profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'N/A'}
 </p>
 </div>
 </div>
 </div>

 {/* Resume Extracted Skills Section */}
 {extractedSkills.length > 0 && (
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <div className="flex items-center gap-3 mb-6">
 <Sparkles className="w-5 h-5 text-[var(--warning)]" />
 <h3 className="text-lg font-medium">Resume Extracted Skills</h3>
 </div>
 <p className="text-xs text-[var(--text-muted)] mb-4">
 Skills automatically extracted from your resume. These are unverified and based on resume content.
 </p>
 <div className="flex flex-wrap gap-2">
 {extractedSkills.map((skill, index) => (
 <div
 key={index}
 className="flex items-center gap-2 px-4 py-2 bg-[var(--warning)]/10 border border-amber-500/20 rounded-2xl"
 >
 <span className="text-sm font-bold text-[var(--warning)]">{skill.skillName}</span>
 <span className="text-[11px] px-2 py-0.5 bg-[var(--warning)]/20 text-[var(--warning)] rounded-full font-semibold">
 {skill.confidence}% match
 </span>
 <span className="text-[11px] px-2 py-0.5 bg-gray-500/20 text-[var(--text-muted)] rounded-full font-semibold">
 Unverified
 </span>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Documents Section */}
 <div className="glass-card rounded-[var(--radius-xl)] p-8">
 <div className="flex items-center gap-3 mb-6">
 <FileText className="w-5 h-5 text-[var(--accent)]" />
 <h3 className="text-lg font-medium">Documents</h3>
 </div>

 {/* Upload Form */}
 <div className="mb-8 p-6 bg-[var(--bg-accent)] rounded-2xl">
 <h4 className="text-sm font-medium mb-4">Upload Document</h4>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
 <div>
 <label className="text-[11px] font-medium text-[var(--text-muted)] block mb-2">
 Document Type
 </label>
 <select
 value={documentType}
 onChange={(e) => setDocumentType(e.target.value)}
 className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-[var(--accent)]"
 >
 <option value="Resume">Resume</option>
 <option value="CoverLetter">Cover Letter</option>
 <option value="Certificate">Certificate</option>
 </select>
 </div>
 <div className="md:col-span-2">
 <label className="text-[11px] font-medium text-[var(--text-muted)] block mb-2">
 Choose File (PDF, DOCX, JPG, PNG - Max 5MB)
 </label>
 <div className="flex gap-2">
 <input
 type="file"
 onChange={handleFileSelect}
 accept=".pdf,.docx,.jpg,.jpeg,.png"
 className="flex-1 text-sm"
 />
 <button
 type="button"
 onClick={handleUpload}
 disabled={uploading || !selectedFile}
 className="px-6 py-2 bg-[var(--accent)] text-white rounded-2xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
 >
 {uploading ? (
 <Loader2 className="w-4 h-4 animate-spin" />
 ) : (
 <Upload className="w-4 h-4" />
 )}
 Upload
 </button>
 </div>
 </div>
 </div>

 {selectedFile && (
 <p className="text-xs text-[var(--text-muted)] mt-2">
 Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
 </p>
 )}
 </div>

 {/* Document List */}
 <div>
 <h4 className="text-sm font-medium mb-4">Your Documents</h4>

 {documents.length === 0 ? (
 <p className="text-sm text-[var(--text-muted)] py-4">No documents uploaded yet.</p>
 ) : (
 <div className="space-y-3">
 {documents.map((doc, index) => (
 <div key={index} className="flex items-center justify-between p-4 bg-[var(--bg-accent)] rounded-2xl">
 <div className="flex items-center gap-3">
 <FileText className="w-5 h-5 text-[var(--accent)]" />
 <div>
 <p className="font-bold text-sm">{doc.DocumentType}</p>
 <p className="text-[11px] text-[var(--text-muted)]">
 {doc.FilePath} {doc.UploadedAt && `- ${new Date(doc.UploadedAt).toLocaleDateString()}`}
 </p>
 </div>
 </div>
 <div className="flex gap-2">
 {doc.DocumentType === 'Resume' && (
 <button
 onClick={handleDownloadResume}
 className="p-2 text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded-xl transition-colors"
 title="Download Resume"
 >
 <Download className="w-4 h-4" />
 </button>
 )}
 <button
 onClick={() => handleDeleteDocument(doc.DocumentType)}
 className="p-2 text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-xl transition-colors"
 title="Delete Document"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 );
};

export default ProfileManagement;
