import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star, Zap, Award, Loader2, Flame, Crown, TrendingUp, Calendar } from 'lucide-react';

const Leaderboard = ({ leaderboardData, loading, globalData, userRank }) => {
 const [activeTab, setActiveTab] = useState('personal');
 const [globalRanking, setGlobalRanking] = useState([]);
 const [loadingGlobal, setLoadingGlobal] = useState(false);

 useEffect(() => {
 if (globalData && globalData.globalRanking) {
 setGlobalRanking(globalData.globalRanking);
 }
 }, [globalData]);

 if (loading) {
 return (
 <div className="flex flex-col items-center justify-center py-20">
 <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mb-4" />
 <p className="text-[11px] font-semibold text-[var(--text-muted)]">Loading Leaderboard...</p>
 </div>
 );
 }

 // Default gamification data if no data exists
 const data = leaderboardData && leaderboardData.length > 0 ? leaderboardData : [{
 Points: 1250,
 Level: 5,
 Badges: 'ApplicationWinner,SkillMaster,InterviewPro',
 StreakDays: 7,
 Rank: 42,
 LastActivityDate: new Date().toISOString()
 }];

 const badges = data[0]?.Badges ? (data[0].Badges || "").split(',') : ['ApplicationWinner', 'SkillMaster'];
 const badgeIcons = {
 'ApplicationWinner': <Star className="w-5 h-5 text-[var(--warning)]" />,
 'SkillMaster': <Award className="w-5 h-5 text-[var(--success)]" />,
 'InterviewPro': <Medal className="w-5 h-5 text-[var(--accent)]" />,
 'EarlyBird': <Zap className="w-5 h-5 text-[var(--danger)]" />,
 'StreakMaster': <Trophy className="w-5 h-5 text-[var(--warning)]" />,
 'ProfilePerfectionist': <Crown className="w-5 h-5 text-[var(--accent)]" />,
 'JobHunter': <TrendingUp className="w-5 h-5 text-[var(--accent)]" />,
 'ConsistentCandidate': <Flame className="w-5 h-5 text-[var(--warning)]" />
 };

 // Check if user logged in today for streak indicator
 const lastLoginDate = data[0]?.LastActivityDate ? new Date(data[0].LastActivityDate).toISOString().split('T')[0] : null;
 const today = new Date().toISOString().split('T')[0];
 const loggedInToday = lastLoginDate === today;
 const streakDays = data[0]?.StreakDays || 0;

 // Calculate progress to next level
 const currentPoints = data[0]?.Points || 1250;
 const currentLevel = data[0]?.Level || 5;
 const pointsInCurrentLevel = currentPoints % 500;
 const progressToNext = (pointsInCurrentLevel / 500) * 100;
 const pointsToNextLevel = (currentLevel * 500) - currentPoints;

 return (
 <div className="space-y-5 sm:space-y-8">
 {/* Tab Navigation */}
 <div className="flex items-center gap-3 mb-6">
 <Trophy className="w-5 h-5 text-[var(--warning)]" />
 <h2 className="text-lg font-medium">Achievements</h2>

 <div className="ml-auto flex gap-2">
 <button
 onClick={() => setActiveTab('personal')}
 className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${activeTab === 'personal'
 ? 'bg-[var(--accent)] text-white'
 : 'bg-[var(--bg-accent)] text-[var(--text-muted)] hover:bg-[var(--accent)]/10'
 }`}
 >
 My Progress
 </button>
 <button
 onClick={() => setActiveTab('global')}
 className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${activeTab === 'global'
 ? 'bg-[var(--warning)] text-white'
 : 'bg-[var(--bg-accent)] text-[var(--text-muted)] hover:bg-[var(--warning)]/10'
 }`}
 >
 <Crown className="w-4 h-4" />
 Global Rankings
 </button>
 </div>
 </div>

 {activeTab === 'personal' ? (
 <>
 {/* Daily Login Streak Indicator */}
 <div className={`glass-card p-6 rounded-[var(--radius-xl)] border-2 ${loggedInToday ? 'border-emerald-500/30 bg-[var(--success)]/5' : 'border-rose-500/30 bg-[var(--danger)]/5'
 }`}>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${loggedInToday ? 'bg-[var(--success)]/20' : 'bg-[var(--danger)]/20'
 }`}>
 <Flame className={`w-7 h-7 ${loggedInToday ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`} />
 </div>
 <div>
 <h3 className="text-sm font-medium">
 {loggedInToday ? 'Streak Active!' : 'Login to Keep Streak'}
 </h3>
 <p className="text-xs text-[var(--text-muted)]">
 {streakDays} day streak • {loggedInToday ? 'Come back tomorrow!' : 'Login to continue'}
 </p>
 </div>
 </div>
 <div className="text-right">
 <div className="text-xl sm:text-2xl font-semibold text-[var(--danger)]">{streakDays}</div>
 <div className="text-[11px] font-semibold text-[var(--text-muted)]">Day Streak</div>
 </div>
 </div>
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
 <div className="glass-card p-8 rounded-[var(--radius-xl)] text-center">
 <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--warning)]/10 border border-amber-500/20 flex items-center justify-center">
 <Trophy className="w-8 h-8 text-[var(--warning)]" />
 </div>
 <div className="text-4xl font-semibold text-[var(--warning)]">{currentPoints}</div>
 <div className="text-[11px] font-semibold text-[var(--text-muted)] mt-2">Total Points</div>
 </div>

 <div className="glass-card p-8 rounded-[var(--radius-xl)] text-center">
 <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)] flex items-center justify-center">
 <Star className="w-8 h-8 text-[var(--accent)]" />
 </div>
 <div className="text-4xl font-semibold text-[var(--accent)]">Level {currentLevel}</div>
 <div className="text-[11px] font-semibold text-[var(--text-muted)] mt-2">Current Level</div>
 </div>

 <div className="glass-card p-8 rounded-[var(--radius-xl)] text-center">
 <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 flex items-center justify-center">
 <Zap className="w-8 h-8 text-[var(--danger)]" />
 </div>
 <div className="text-4xl font-semibold text-[var(--danger)]">{streakDays}</div>
 <div className="text-[11px] font-semibold text-[var(--text-muted)] mt-2">Day Streak</div>
 </div>

 <div className="glass-card p-8 rounded-[var(--radius-xl)] text-center">
 <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--success)]/10 border border-emerald-500/20 flex items-center justify-center">
 <Award className="w-8 h-8 text-[var(--success)]" />
 </div>
 <div className="text-4xl font-semibold text-[var(--success)]">#{userRank || data[0]?.Rank || 42}</div>
 <div className="text-[11px] font-semibold text-[var(--text-muted)] mt-2">Global Rank</div>
 </div>
 </div>

 {/* Badges */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <h3 className="text-sm font-medium mb-6">Earned Badges</h3>
 <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
 {badges.map((badge, index) => (
 <div
 key={index}
 className="flex flex-col items-center p-6 bg-[var(--bg-accent)] rounded-2xl border border-[var(--border-primary)] hover:border-amber-500/30 transition-all"
 >
 <div className="w-12 h-12 rounded-xl bg-[var(--bg-primary)] flex items-center justify-center mb-3">
 {badgeIcons[badge.trim()] || <Star className="w-5 h-5 text-[var(--text-muted)]" />}
 </div>
 <span className="text-[11px] font-medium text-center">{badge.trim()}</span>
 </div>
 ))}
 </div>
 </div>

 {/* Progress to Next Level */}
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-sm font-medium">Progress to Level {currentLevel + 1}</h3>
 <span className="text-xs font-semibold text-[var(--accent)]">{Number(progressToNext || 0).toFixed(0)}%</span>
 </div>
 <div className="w-full h-4 bg-[var(--bg-accent)] rounded-full overflow-hidden">
 <div
 className="h-full bg-[var(--accent)] transition-all duration-1000"
 style={{ width: `${progressToNext}%` }}
 ></div>
 </div>
 <p className="text-[11px] font-semibold text-[var(--text-muted)] mt-4">
 {pointsToNextLevel} points until next level
 </p>
 </div>

 {/* Achievement Tips */}
 <div className="bg-[var(--bg-accent)] rounded-[var(--radius-xl)] p-8 border border-[var(--border-primary)]">
 <div className="flex items-center gap-3 mb-4">
 <Zap className="w-5 h-5 text-[var(--warning)]" />
 <h3 className="text-sm font-medium">How to Earn More Points</h3>
 </div>
 <ul className="space-y-3">
 <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
 <span className="w-2 h-2 rounded-full bg-[var(--warning)] mt-1.5 shrink-0"></span>
 Complete skill assessments to earn 100+ points
 </li>
 <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
 <span className="w-2 h-2 rounded-full bg-[var(--warning)] mt-1.5 shrink-0"></span>
 Attend interviews on time for 50 point bonus
 </li>
 <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
 <span className="w-2 h-2 rounded-full bg-[var(--warning)] mt-1.5 shrink-0"></span>
 Maintain daily login streak for multipliers
 </li>
 <li className="flex items-start gap-3 text-xs font-medium text-[var(--text-muted)]">
 <span className="w-2 h-2 rounded-full bg-[var(--warning)] mt-1.5 shrink-0"></span>
 Get your skills verified by recruiters
 </li>
 </ul>
 </div>
 </>
 ) : (
 /* Global Rankings Tab */
 <div className="glass-card p-8 rounded-[var(--radius-xl)]">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-sm font-medium flex items-center gap-2">
 <Crown className="w-5 h-5 text-[var(--warning)]" />
 Top Candidates
 </h3>
 <div className="text-sm font-semibold text-[var(--accent)]">
 Your Rank: #{userRank || '—'}
 </div>
 </div>

 {loadingGlobal ? (
 <div className="flex items-center justify-center py-12">
 <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
 </div>
 ) : globalRanking && globalRanking.length > 0 ? (
 <div className="space-y-3">
 {globalRanking.slice(0, 20).map((entry, index) => (
 <div
 key={entry.CandidateID || index}
 className={`flex items-center p-4 rounded-2xl transition-all ${entry.GlobalRank <= 3
 ? 'bg-[var(--bg-tertiary)] border border-amber-500/20'
 : 'bg-[var(--bg-accent)]'
 }`}
 >
 <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 font-semibold ${entry.GlobalRank === 1 ? 'bg-[var(--warning)] text-white' :
 entry.GlobalRank === 2 ? 'bg-gray-400 text-white' :
 entry.GlobalRank === 3 ? 'bg-amber-700 text-white' :
 'bg-[var(--bg-primary)] text-[var(--text-muted)]'
 }`}>
 {entry.GlobalRank <= 3 ? (
 <Trophy className="w-5 h-5" />
 ) : (
 entry.GlobalRank
 )}
 </div>

 <div className="flex-1">
 <div className="font-semibold text-sm">{entry.FullName || 'Anonymous Candidate'}</div>
 <div className="text-xs text-[var(--text-muted)]">{entry.Location || 'Location N/A'}</div>
 </div>

 <div className="text-right">
 <div className="text-lg font-semibold text-[var(--accent)]">{entry.Points || 0}</div>
 <div className="text-[11px] font-semibold text-[var(--text-muted)]">pts</div>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-12 text-[var(--text-muted)]">
 <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
 <p className="text-sm">No rankings yet. Start earning points!</p>
 </div>
 )}

 {/* Top 3 Podium */}
 {globalRanking && globalRanking.length >= 3 && (
 <div className="mt-8 pt-8 border-t border-[var(--border-primary)]">
 <h4 className="text-xs font-medium text-center mb-6">Podium</h4>
 <div className="flex items-end justify-center gap-4">
 {/* 2nd Place */}
 <div className="text-center">
 <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-400/20 flex items-center justify-center mb-2">
 <Medal className="w-8 h-8 text-[var(--text-muted)]" />
 </div>
 <div className="text-sm font-semibold">{globalRanking[1]?.FullName?.split(' ')[0] || '2nd'}</div>
 <div className="text-xs text-[var(--text-muted)]">{globalRanking[1]?.Points || 0} pts</div>
 </div>
 {/* 1st Place */}
 <div className="text-center -mt-4">
 <div className="w-20 h-20 mx-auto rounded-2xl bg-[var(--warning)]/30 flex items-center justify-center mb-2 border-2 border-amber-500">
 <Crown className="w-10 h-10 text-[var(--warning)]" />
 </div>
 <div className="text-sm font-semibold">{globalRanking[0]?.FullName?.split(' ')[0] || '1st'}</div>
 <div className="text-xs text-[var(--warning)]">{globalRanking[0]?.Points || 0} pts</div>
 </div>
 {/* 3rd Place */}
 <div className="text-center">
 <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-700/20 flex items-center justify-center mb-2">
 <Medal className="w-8 h-8 text-amber-700" />
 </div>
 <div className="text-sm font-semibold">{globalRanking[2]?.FullName?.split(' ')[0] || '3rd'}</div>
 <div className="text-xs text-amber-700">{globalRanking[2]?.Points || 0} pts</div>
 </div>
 </div>
 </div>
 )}
 </div>
 )}
 </div>
 );
};

export default Leaderboard;
