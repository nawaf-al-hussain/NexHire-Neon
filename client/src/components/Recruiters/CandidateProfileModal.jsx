import React from 'react';
import {
 X, MapPin, Briefcase, Mail, Calendar, FileText, Award, Zap, Star, TrendingUp,
 Shield, Globe, Wifi, Home, Building, Target, Clock, CheckCircle, XCircle,
 AlertTriangle, ChevronRight, ExternalLink, Link2, Brain, Users, MessageSquare,
 Heart, User, Download, File, FilePlus, Smile, Meh, Frown
} from 'lucide-react';
import axios from 'axios';
import { formatNumber, formatScore } from '../../utils/format';
import API_BASE from '../../apiConfig';
import RankingHistory from './RankingHistory';
import SentimentTracker from '../Candidate/SentimentTracker';
import { useToast } from '../../components/ui/Toast';

const CandidateProfileModal = ({ isOpen, onClose, candidateId, candidateName }) => {
    const { toast } = useToast();
 const [profile, setProfile] = React.useState(null);
 const [loading, setLoading] = React.useState(true);
 const [error, setError] = React.useState(null);
 const [activeTab, setActiveTab] = React.useState('overview');
 const [documents, setDocuments] = React.useState([]);
 const [resumeSentiment, setResumeSentiment] = React.useState(null);
 const [documentsLoading, setDocumentsLoading] = React.useState(false);
 const [sentimentLoading, setSentimentLoading] = React.useState(false);

 React.useEffect(() => {
 if (isOpen && candidateId) {
 fetchProfile();
 }
 }, [isOpen, candidateId]);

 // Fetch documents and sentiment when Documents tab is active
 React.useEffect(() => {
 if (activeTab === 'documents' && candidateId) {
 fetchDocuments();
 fetchResumeSentiment();
 }
 }, [activeTab, candidateId]);

 const fetchProfile = async () => {
 setLoading(true);
 setError(null);
 try {
 const res = await axios.get(`${API_BASE}/recruiters/candidate-profile/${candidateId}`);
 setProfile(res.data);
 } catch (err) {
 console.error("Profile fetch error:", err);
 setError(err.response?.data?.error || "Failed to load candidate profile");
 } finally {
 setLoading(false);
 }
 };

 const fetchDocuments = async () => {
 setDocumentsLoading(true);
 try {
 const res = await axios.get(`${API_BASE}/candidates/${candidateId}/documents`);
 setDocuments(res.data);
 } catch (err) {
 console.error("Documents fetch error:", err);
 setDocuments([]);
 } finally {
 setDocumentsLoading(false);
 }
 };

 const fetchResumeSentiment = async () => {
 setSentimentLoading(true);
 try {
 const res = await axios.get(`${API_BASE}/candidates/${candidateId}/sentiment`);
 setResumeSentiment(res.data);
 } catch (err) {
 console.error("Sentiment fetch error:", err);
 setResumeSentiment(null);
 } finally {
 setSentimentLoading(false);
 }
 };

 const handleDownloadResume = async () => {
 try {
 const response = await axios.get(`${API_BASE}/candidates/${candidateId}/documents/resume/download`, {
 responseType: 'blob',
 });
 const url = window.URL.createObjectURL(new Blob([response.data]));
 const link = document.createElement('a');
 link.href = url;
 link.setAttribute('download', `resume_${candidateId}.pdf`);
 document.body.appendChild(link);
 link.click();
 link.remove();
 window.URL.revokeObjectURL(url);
 } catch (err) {
 console.error("Download error:", err);
 toast("Failed to download resume");
 }
 };

 if (!isOpen) return null;

 const getScoreColor = (score) => {
 if (score >= 80) return 'text-[var(--success)]';
 if (score >= 60) return 'text-[var(--warning)]';
 return 'text-[var(--danger)]';
 };

 const getRiskBadge = (risk) => {
 switch (risk) {
 case 'High': return 'bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20';
 case 'Medium': return 'bg-[var(--warning)]/10 text-[var(--warning)] border-amber-500/20';
 default: return 'bg-[var(--success)]/10 text-[var(--success)] border-emerald-500/20';
 }
 };

 const getVerificationBadge = (status) => {
 switch (status) {
 case 'Verified (High)': return 'bg-[var(--success)]/10 text-[var(--success)] border-emerald-500/20';
 case 'Verified (Medium)': return 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20';
 case 'Verification Failed': return 'bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20';
 default: return 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] border-slate-500/20';
 }
 };

 const getRemoteIcon = (preference) => {
 switch (preference) {
 case 'Remote': return <Wifi size={14} className="text-[var(--accent)]" />;
 case 'Hybrid': return <Home size={14} className="text-[var(--success)]" />;
 case 'Onsite': return <Building size={14} className="text-[var(--accent)]" />;
 default: return <Globe size={14} className="text-[var(--text-muted)]" />;
 }
 };

 const tabs = [
 { id: 'overview', label: 'Overview' },
 { id: 'skills', label: 'Skills' },
 { id: 'documents', label: 'Documents' },
 { id: 'predictions', label: 'AI Insights' },
 { id: 'sentiment', label: 'Sentiment' },
 { id: 'history', label: 'History' }
 ];

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300">
 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

 <div className="relative bg-[var(--bg-primary)] border border-[var(--border-primary)] w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] flex flex-col text-[var(--text-primary)]">
 {/* Header */}
 <div className="p-8 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-accent)]/20">
 <div className="flex items-center gap-6">
 <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)] flex items-center justify-center text-[var(--accent)]">
 <User size={28} />
 </div>
 <div>
 <h2 className="text-lg sm:text-xl font-semibold tracking-tight">{candidateName || 'Candidate Profile'}</h2>
 <p className="text-[11px] font-semibold text-[var(--text-muted)] mt-1 italic">View detailed candidate information</p>
 </div>
 </div>
 <button
 onClick={onClose}
 className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
 >
 <X size={20} />
 </button>
 </div>

 {/* Tabs */}
 <div className="px-8 pt-6 flex gap-2 border-b border-[var(--border-primary)]">
 {tabs.map(tab => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`px-6 py-3 text-sm font-medium rounded-2xl transition-all ${activeTab === tab.id
 ? 'bg-[var(--accent)] text-white'
 : 'bg-[var(--bg-accent)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
 }`}
 >
 {tab.label}
 </button>
 ))}
 </div>

 {/* Content */}
 <div className="p-8 overflow-y-auto max-h-[calc(90vh-220px)]">
 {/* Candidate Quick Info */}
 {!loading && !error && profile && (
 <div className="flex items-center gap-6 mb-8 pb-6 border-b border-[var(--border-primary)]">
 {profile?.basicInfo?.Location && (
 <span className="flex items-center gap-2 text-sm font-bold text-[var(--text-muted)]">
 <MapPin size={14} className="text-[var(--accent)]" />
 {profile.basicInfo.Location}
 </span>
 )}
 {profile?.basicInfo?.YearsOfExperience !== undefined && (
 <span className="flex items-center gap-2 text-sm font-bold text-[var(--text-muted)]">
 <Briefcase size={14} className="text-[var(--success)]" />
 {profile.basicInfo.YearsOfExperience} years exp
 </span>
 )}
 {profile?.gamification && (
 <span className="flex items-center gap-2 text-sm font-bold text-[var(--text-muted)]">
 <Zap size={14} className="text-[var(--warning)]" />
 {profile.gamification.Points || 0} pts • Lvl {profile.gamification.Level || 1}
 </span>
 )}
 {profile?.basicInfo?.Email && (
 <span className="flex items-center gap-2 text-sm font-bold text-[var(--text-muted)]">
 <Mail size={14} className="text-[var(--accent)]" />
 {profile.basicInfo.Email}
 </span>
 )}
 </div>
 )}

 {loading ? (
 <div className="space-y-6">
 {[1, 2, 3].map(i => (
 <div key={i} className="h-24 bg-[var(--bg-accent)] rounded-2xl animate-pulse" />
 ))}
 </div>
 ) : error ? (
 <div className="text-center py-12">
 <AlertTriangle size={48} className="mx-auto text-[var(--danger)] mb-4" />
 <p className="text-[var(--danger)] font-bold">{error}</p>
 </div>
 ) : profile ? (
 <>
 {/* Overview Tab */}
 {activeTab === 'overview' && (
 <div className="space-y-5 sm:space-y-8">
 {/* Stats Grid */}
 <div className="grid grid-cols-2 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {/* Resume Score */}
 <div className="glass-card rounded-2xl p-6 border border-[var(--border-primary)]">
 <div className="flex items-center gap-2 mb-3">
 <FileText size={16} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Resume Score</span>
 </div>
 <div className={`text-2xl sm:text-3xl font-semibold ${getScoreColor(profile.resumeInsights?.ResumeQualityScore || 0)}`}>
 {profile.resumeInsights?.ResumeQualityScore || 0}%
 </div>
 </div>

 {/* Engagement Rate */}
 <div className="glass-card rounded-2xl p-6 border border-[var(--border-primary)]">
 <div className="flex items-center gap-2 mb-3">
 <Users size={16} className="text-[var(--success)]" />
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Engagement</span>
 </div>
 <div className={`text-2xl sm:text-3xl font-semibold ${getScoreColor(profile.engagement?.EngagementRate || 0)}`}>
 {Number(profile.engagement?.EngagementRate || 0).toFixed(0) || 0}%
 </div>
 </div>

 {/* Ghosting Risk */}
 <div className="glass-card rounded-2xl p-6 border border-[var(--border-primary)]">
 <div className="flex items-center gap-2 mb-3">
 <Shield size={16} className="text-[var(--warning)]" />
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Ghosting Risk</span>
 </div>
 <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold border ${getRiskBadge(profile.ghostingRisk?.OverallRiskLevel)}`}>
 {profile.ghostingRisk?.OverallRiskLevel || 'Low'}
 </div>
 </div>

 {/* Remote Score */}
 <div className="glass-card rounded-2xl p-6 border border-[var(--border-primary)]">
 <div className="flex items-center gap-2 mb-3">
 <Globe size={16} className="text-[var(--accent)]" />
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Remote Score</span>
 </div>
 <div className={`text-2xl sm:text-3xl font-semibold ${getScoreColor(profile.remoteCompatibility?.OverallRemoteScore || 0)}`}>
 {profile.remoteCompatibility?.OverallRemoteScore || 0}%
 </div>
 </div>
 </div>

 {/* Resume Insights */}
 {profile.resumeInsights && (
 <div className="glass-card rounded-2xl p-6 border border-[var(--border-primary)]">
 <h3 className="text-sm font-medium text-[var(--accent)] mb-4 flex items-center gap-2">
 <FileText size={16} /> Resume Insights
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
 {profile.resumeInsights.EducationInstitutions && (
 <div>
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Education</span>
 <p className="text-sm font-bold mt-1">{profile.resumeInsights.EducationInstitutions}</p>
 </div>
 )}
 {profile.resumeInsights.Certifications && (
 <div>
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Certifications</span>
 <p className="text-sm font-bold mt-1">{profile.resumeInsights.Certifications}</p>
 </div>
 )}
 {profile.resumeInsights.TechStack && (
 <div>
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Tech Stack</span>
 <p className="text-sm font-bold mt-1">{profile.resumeInsights.TechStack}</p>
 </div>
 )}
 {profile.resumeInsights.LeadershipExperience !== null && (
 <div>
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Leadership</span>
 <p className="text-sm font-bold mt-1 flex items-center gap-2">
 {profile.resumeInsights.LeadershipExperience ? (
 <><CheckCircle size={14} className="text-[var(--success)]" /> Yes</>
 ) : (
 <><XCircle size={14} className="text-[var(--text-muted)]" /> No</>
 )}
 </p>
 </div>
 )}
 </div>
 </div>
 )}

 {/* Career Path */}
 {profile.careerPath && (
 <div className="glass-card rounded-2xl p-6 border border-[var(--border-primary)]">
 <h3 className="text-sm font-medium text-[var(--accent)] mb-4 flex items-center gap-2">
 <TrendingUp size={16} /> Career Path Prediction
 </h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
 <div>
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Target Role</span>
 <p className="text-lg font-semibold mt-1">{profile.careerPath.TargetRole || 'Not set'}</p>
 </div>
 <div>
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Transition Probability</span>
 <p className="text-lg font-semibold mt-1">{Number(profile.careerPath.TransitionProbability || 0).toFixed(0) || 0}%</p>
 </div>
 <div>
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Readiness Score</span>
 <p className={`text-lg font-semibold mt-1 ${getScoreColor(profile.careerPath.CurrentReadinessScore || 0)}`}>
 {profile.careerPath.CurrentReadinessScore || 0}%
 </p>
 </div>
 </div>
 </div>
 )}

 {/* Blockchain Verifications */}
 {profile.blockchainVerifications?.length > 0 && (
 <div className="glass-card rounded-2xl p-6 border border-[var(--border-primary)]">
 <h3 className="text-sm font-medium text-[var(--accent)] mb-4 flex items-center gap-2">
 <Link2 size={16} /> Verified Credentials
 </h3>
 <div className="space-y-3">
 {profile.blockchainVerifications.map((cred, i) => (
 <div key={i} className="flex items-center justify-between p-3 bg-[var(--bg-accent)] rounded-xl">
 <div className="flex items-center gap-3">
 <Shield size={16} className={cred.IsVerified ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'} />
 <span className="font-bold text-sm">{cred.CredentialType}</span>
 </div>
 <span className={`text-xs font-semibold px-2 py-1 rounded-full ${cred.IsVerified ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'}`}>
 {cred.IsVerified ? 'Verified' : 'Pending'}
 </span>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Quick Documents Access */}
 <div className="glass-card rounded-2xl p-6 border border-[var(--border-primary)]">
 <h3 className="text-sm font-medium text-[var(--accent)] mb-4 flex items-center gap-2">
 <FileText size={16} /> Documents
 </h3>
 <div className="space-y-3">
 <button
 onClick={() => setActiveTab('documents')}
 className="w-full flex items-center justify-between p-4 bg-[var(--bg-accent)] rounded-xl hover:bg-[var(--accent)]/10 transition-all group"
 >
 <div className="flex items-center gap-3">
 <FileText size={20} className="text-[var(--accent)]" />
 <span className="font-bold">View Documents</span>
 </div>
 <ChevronRight size={20} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-all" />
 </button>
 <p className="text-xs text-[var(--text-muted)] px-1">
 View resume, certificates, and download documents. Check resume sentiment analysis.
 </p>
 </div>
 </div>
 </div>
 )}

 {/* Documents Tab */}
 {activeTab === 'documents' && (
 <div className="space-y-5 sm:space-y-8">
 {/* Resume Sentiment Analysis */}
 <div className="glass-card rounded-2xl p-6 border border-[var(--border-primary)]">
 <h3 className="text-sm font-medium text-[var(--accent)] mb-4 flex items-center gap-2">
 <Brain size={16} /> Resume Sentiment Analysis
 </h3>
 {sentimentLoading ? (
 <div className="animate-pulse space-y-4">
 <div className="h-20 bg-[var(--bg-accent)] rounded-xl"></div>
 </div>
 ) : resumeSentiment ? (
 <div className="space-y-4">
 <div className="flex items-center justify-between p-4 bg-[var(--bg-accent)] rounded-xl">
 <div className="flex items-center gap-3">
 {resumeSentiment.sentimentScore > 0.1 ? (
 <Smile size={32} className="text-[var(--success)]" />
 ) : resumeSentiment.sentimentScore < -0.1 ? (
 <Frown size={32} className="text-[var(--danger)]" />
 ) : (
 <Meh size={32} className="text-[var(--warning)]" />
 )}
 <div>
 <div className={`text-xl sm:text-2xl font-semibold ${resumeSentiment.sentimentScore > 0.1 ? 'text-[var(--success)]' :
 resumeSentiment.sentimentScore < -0.1 ? 'text-[var(--danger)]' : 'text-[var(--warning)]'
 }`}>
 {formatNumber(resumeSentiment.sentimentScore, 2)}
 </div>
 <div className="text-sm text-[var(--text-muted)] font-bold">
 {resumeSentiment.sentimentLabel}
 </div>
 </div>
 </div>
 <button
 onClick={fetchResumeSentiment}
 className="px-4 py-2 bg-[var(--accent)]/10 border border-[var(--accent)] rounded-xl text-sm font-bold text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-all"
 >
 Refresh
 </button>
 </div>
 <p className="text-sm text-[var(--text-muted)]">
 {resumeSentiment.analysis}
 </p>
 <p className="text-xs text-[var(--text-muted)]">
 Text length: {resumeSentiment.resumeTextLength} characters
 </p>
 </div>
 ) : (
 <div className="text-center py-6 text-[var(--text-muted)]">
 <AlertTriangle size={24} className="mx-auto mb-2 text-[var(--warning)]" />
 <p className="text-sm">No resume text available for sentiment analysis</p>
 </div>
 )}
 </div>

 {/* Documents List */}
 <div className="glass-card rounded-2xl p-6 border border-[var(--border-primary)]">
 <h3 className="text-sm font-medium text-[var(--success)] mb-4 flex items-center gap-2">
 <FileText size={16} /> Candidate Documents
 </h3>
 {documentsLoading ? (
 <div className="animate-pulse space-y-4">
 {[1, 2, 3].map(i => (
 <div key={i} className="h-16 bg-[var(--bg-accent)] rounded-xl"></div>
 ))}
 </div>
 ) : documents.length > 0 ? (
 <div className="space-y-3">
 {documents.map((doc, i) => (
 <div key={i} className="flex items-center justify-between p-4 bg-[var(--bg-accent)] rounded-xl hover:bg-[var(--bg-accent)]/80 transition-all">
 <div className="flex items-center gap-3">
 {doc.DocumentType === 'Resume' ? (
 <FileText size={24} className="text-[var(--accent)]" />
 ) : doc.DocumentType === 'CoverLetter' ? (
 <File size={24} className="text-[var(--accent)]" />
 ) : (
 <Award size={24} className="text-[var(--warning)]" />
 )}
 <div>
 <div className="font-bold text-[var(--text-primary)]">
 {doc.DocumentType}
 </div>
 {doc.UploadedAt && (
 <div className="text-xs text-[var(--text-muted)]">
 Uploaded: {new Date(doc.UploadedAt).toLocaleDateString()}
 </div>
 )}
 </div>
 </div>
 {doc.DocumentType === 'Resume' && (
 <button
 onClick={handleDownloadResume}
 className="flex items-center gap-2 px-4 py-2 bg-[var(--success)]/10 border border-emerald-500/20 rounded-xl text-sm font-bold text-[var(--success)] hover:bg-[var(--success)]/20 transition-all"
 >
 <Download size={16} />
 Download
 </button>
 )}
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-6 text-[var(--text-muted)]">
 <FileText size={32} className="mx-auto mb-2 opacity-50" />
 <p className="text-sm">No documents uploaded yet</p>
 </div>
 )}
 </div>
 </div>
 )}

 {/* Skills Tab */}
 {activeTab === 'skills' && (
 <div className="space-y-5 sm:space-y-8">
 {/* Extracted Skills */}
 {profile.basicInfo?.ExtractedSkills && (
 <div className="glass-card rounded-2xl p-6 border border-[var(--border-primary)]">
 <h3 className="text-sm font-medium text-[var(--accent)] mb-4 flex items-center gap-2">
 <Target size={16} /> Extracted Skills
 </h3>
 <div className="flex flex-wrap gap-2">
 {(profile.basicInfo?.ExtractedSkills || "").split(',').map((skill, i) => (
 <span key={i} className="px-4 py-2 bg-[var(--accent)]/10 border border-[var(--accent)] rounded-xl text-sm font-bold text-[var(--accent)]">
 {skill.trim()}
 </span>
 ))}
 </div>
 </div>
 )}

 {/* Skill Verification Status */}
 {profile.skillVerification?.length > 0 ? (
 <div className="glass-card rounded-2xl p-6 border border-[var(--border-primary)]">
 <h3 className="text-sm font-medium text-[var(--success)] mb-4 flex items-center gap-2">
 <CheckCircle size={16} /> Skill Verification Status
 </h3>
 <div className="space-y-3">
 {profile.skillVerification.map((skill, i) => (
 <div key={i} className="flex items-center justify-between p-4 bg-[var(--bg-accent)] rounded-xl">
 <div className="flex-1">
 <div className="flex items-center gap-3">
 <span className="font-bold">{skill.SkillName}</span>
 <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${getVerificationBadge(skill.VerificationStatus)}`}>
 {skill.VerificationStatus}
 </span>
 </div>
 <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-muted)]">
 <span>Claimed: L{skill.ClaimedLevel}</span>
 {skill.VerificationScore && (
 <span>Score: {formatScore(skill.VerificationScore)}%</span>
 )}
 {skill.VerificationMethod && (
 <span>Method: {skill.VerificationMethod}</span>
 )}
 </div>
 </div>
 <div className="text-right">
 <div className="w-16 h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
 <div
 className={`h-full rounded-full ${skill.VerificationScore >= 80 ? 'bg-[var(--success)]' : skill.VerificationScore >= 60 ? 'bg-[var(--warning)]' : 'bg-[var(--danger)]'}`}
 style={{ width: `${skill.VerificationScore || 0}%` }}
 />
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 ) : (
 <div className="glass-card rounded-2xl p-12 text-center border border-[var(--border-primary)]">
 <Target size={48} className="mx-auto text-[var(--text-muted)]/30 mb-4" />
 <p className="text-sm font-bold text-[var(--text-muted)]">No skill verification data available</p>
 </div>
 )}
 </div>
 )}

 {/* AI Insights Tab */}
 {activeTab === 'predictions' && (
 <div className="space-y-5 sm:space-y-8">
 {/* AI Predictions */}
 {profile.predictions?.length > 0 ? (
 <div className="glass-card rounded-2xl p-6 border border-[var(--border-primary)]">
 <h3 className="text-sm font-medium text-[var(--accent)] mb-4 flex items-center gap-2">
 <Brain size={16} /> Hire Success Predictions
 </h3>
 <div className="space-y-3">
 {profile.predictions.map((pred, i) => (
 <div key={i} className="p-4 bg-[var(--bg-accent)] rounded-xl">
 <div className="flex items-center justify-between mb-2">
 <span className="font-bold">{pred.JobTitle || `Job #${pred.JobID}`}</span>
 <span className={`text-lg font-semibold ${getScoreColor(pred.SuccessProbability * 100)}`}>
 {(Number(pred.SuccessProbability) * 100).toFixed(0)}%
 </span>
 </div>
 <div className="w-full h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden mb-2">
 <div
 className={`h-full rounded-full ${pred.SuccessProbability >= 0.8 ? 'bg-[var(--success)]' : pred.SuccessProbability >= 0.6 ? 'bg-[var(--warning)]' : 'bg-[var(--danger)]'}`}
 style={{ width: `${pred.SuccessProbability * 100}%` }}
 />
 </div>
 {pred.KeyFactors && (
 <p className="text-xs text-[var(--text-muted)]">{pred.KeyFactors}</p>
 )}
 </div>
 ))}
 </div>
 </div>
 ) : (
 <div className="glass-card rounded-2xl p-12 text-center border border-[var(--border-primary)]">
 <Brain size={48} className="mx-auto text-[var(--text-muted)]/30 mb-4" />
 <p className="text-sm font-bold text-[var(--text-muted)]">No AI predictions available yet</p>
 <p className="text-xs text-[var(--text-muted)] mt-2">Predictions are generated when candidate applies to jobs</p>
 </div>
 )}

 {/* Remote Compatibility Details */}
 {profile.remoteCompatibility && (
 <div className="glass-card rounded-2xl p-6 border border-[var(--border-primary)]">
 <h3 className="text-sm font-medium text-[var(--accent)] mb-4 flex items-center gap-2">
 <Globe size={16} /> Remote Work Compatibility
 </h3>
 <div className="grid grid-cols-2 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="text-center p-4 bg-[var(--bg-accent)] rounded-xl">
 <div className={`text-xl sm:text-2xl font-semibold ${getScoreColor(profile.remoteCompatibility.WorkspaceScore || 0)}`}>
 {profile.remoteCompatibility.WorkspaceScore || 0}%
 </div>
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Workspace</span>
 </div>
 <div className="text-center p-4 bg-[var(--bg-accent)] rounded-xl">
 <div className={`text-xl sm:text-2xl font-semibold ${getScoreColor(profile.remoteCompatibility.CommunicationScore || 0)}`}>
 {profile.remoteCompatibility.CommunicationScore || 0}%
 </div>
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Communication</span>
 </div>
 <div className="text-center p-4 bg-[var(--bg-accent)] rounded-xl">
 <div className={`text-xl sm:text-2xl font-semibold ${getScoreColor(profile.remoteCompatibility.SelfMotivationScore || 0)}`}>
 {profile.remoteCompatibility.SelfMotivationScore || 0}%
 </div>
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Self-Motivation</span>
 </div>
 <div className="text-center p-4 bg-[var(--bg-accent)] rounded-xl">
 <div className="text-xl sm:text-2xl font-semibold text-[var(--accent)]">
 {profile.remoteCompatibility.TimezoneAlignment || 'N/A'}
 </div>
 <span className="text-[11px] font-medium text-[var(--text-muted)]">Timezone</span>
 </div>
 </div>
 </div>
 )}
 </div>
 )}

 {/* Sentiment Tab */}
 {activeTab === 'sentiment' && (
 <div className="space-y-5 sm:space-y-8">
 <SentimentTracker
 candidateId={candidateId}
 candidateName={candidateName}
 />
 </div>
 )}

 {/* History Tab */}
 {activeTab === 'history' && (
 <div className="space-y-5 sm:space-y-8">
 {/* Applications */}
 <div className="glass-card rounded-2xl p-6 border border-[var(--border-primary)]">
 <h3 className="text-sm font-medium text-[var(--accent)] mb-4 flex items-center gap-2">
 <FileText size={16} /> Recent Applications
 </h3>
 {profile.applications?.length > 0 ? (
 <div className="space-y-3">
 {profile.applications.map((app, i) => (
 <div key={i} className="flex items-center justify-between p-4 bg-[var(--bg-accent)] rounded-xl">
 <div>
 <span className="font-bold">{app.JobTitle}</span>
 <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
 <span className="flex items-center gap-1">
 <MapPin size={12} /> {app.JobLocation}
 </span>
 <span className="flex items-center gap-1">
 <Calendar size={12} /> {new Date(app.AppliedDate).toLocaleDateString()}
 </span>
 </div>
 </div>
 <div className="text-right">
 <span className={`text-xs font-semibold px-3 py-1 rounded-full ${app.StatusName === 'Hired' ? 'bg-[var(--success)]/10 text-[var(--success)]' :
 app.StatusName === 'Rejected' ? 'bg-[var(--danger)]/10 text-[var(--danger)]' :
 app.StatusName === 'Interview' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' :
 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
 }`}>
 {app.StatusName}
 </span>
 {app.MatchScore && (
 <div className="text-xs text-[var(--text-muted)] mt-1">
 Match: {formatScore(app.MatchScore)}%
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-sm text-[var(--text-muted)] text-center py-6">No applications found</p>
 )}
 </div>

 {/* Interviews */}
 <div className="glass-card rounded-2xl p-6 border border-[var(--border-primary)]">
 <h3 className="text-sm font-medium text-[var(--accent)] mb-4 flex items-center gap-2">
 <MessageSquare size={16} /> Interview History
 </h3>
 {profile.interviews?.length > 0 ? (
 <div className="space-y-3">
 {profile.interviews.map((int, i) => (
 <div key={i} className="flex items-center justify-between p-4 bg-[var(--bg-accent)] rounded-xl">
 <div>
 <span className="font-bold">{int.JobTitle}</span>
 <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
 <span>with {int.RecruiterName}</span>
 <span className="flex items-center gap-1">
 <Clock size={12} /> {new Date(int.InterviewStart).toLocaleString()}
 </span>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <span className={`text-xs font-semibold px-3 py-1 rounded-full ${int.TimeStatus === 'Upcoming' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
 }`}>
 {int.TimeStatus}
 </span>
 {int.CandidateConfirmed && (
 <CheckCircle size={16} className="text-[var(--success)]" />
 )}
 </div>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-sm text-[var(--text-muted)] text-center py-6">No interviews scheduled</p>
 )}
 </div>

 {/* Ranking History */}
 <div className="glass-card rounded-2xl p-6 border border-[var(--border-primary)]">
 <RankingHistory
 candidateId={candidateId}
 candidateName={candidateName}
 />
 </div>
 </div>
 )}
 </>
 ) : (
 <div className="text-center py-12">
 <AlertTriangle size={48} className="mx-auto text-[var(--text-muted)]/30 mb-4" />
 <p className="text-sm font-bold text-[var(--text-muted)]">No profile data available</p>
 </div>
 )}
 </div>
 </div>
 </div >
 );
};

export default CandidateProfileModal;
