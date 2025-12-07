"""Patch TalentPool.jsx with Skeleton loaders + EmptyState. CRLF-safe."""
from pathlib import Path

FILE = Path("/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/client/src/components/Recruiters/TalentPool.jsx")
text = FILE.read_text(encoding='utf-8')

# 1. Update imports
old_imports = "import { Users, Search, Filter, UserPlus, Sparkles as FuzzyIcon, Loader2, User } from 'lucide-react';\r\nimport axios from 'axios';\r\nimport API_BASE from '../../apiConfig';\r\nimport CandidateProfileModal from './CandidateProfileModal';"
new_imports = "import { Users, Search, Filter, UserPlus, Sparkles as FuzzyIcon, User } from 'lucide-react';\r\nimport axios from 'axios';\r\nimport API_BASE from '../../apiConfig';\r\nimport CandidateProfileModal from './CandidateProfileModal';\r\nimport Skeleton from '../ui/Skeleton';\r\nimport EmptyState from '../ui/EmptyState';"

if old_imports in text:
    text = text.replace(old_imports, new_imports, 1)
    print("OK: imports updated")
else:
    print("NOT FOUND: imports")

# 2. Replace the loading + empty states (the block from line 203 to 221)
old_block = """            {loading ? (
                <div className="glass-card rounded-[3rem] p-8 animate-pulse">
                    <div className="h-8 bg-[var(--bg-accent)] rounded-xl w-1/3 mb-8"></div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-16 bg-[var(--bg-accent)] rounded-xl"></div>
                        ))}
                    </div>
                </div>
            ) : candidates.length === 0 ? (
                <div className="p-12 border-2 border-dashed border-[var(--border-primary)] rounded-[3rem] text-center bg-[var(--bg-accent)]/5">
                    <Users className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-6 opacity-20" />
                    <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-40 mb-4">
                        No data available.
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] opacity-60">
                        Try adjusting your search criteria.
                    </p>
                </div>
            ) : (
                <div className="glass-card rounded-[3rem] p-8\">"""

new_block = """            {loading ? (
                <div
                    style={{
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '1.5rem',
                        boxShadow: 'var(--shadow-sm)',
                    }}
                >
                    <Skeleton height="2rem" width="33%" className="mb-6" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <Skeleton key={i} height="4rem" rounded="var(--radius-md)" />
                        ))}
                    </div>
                </div>
            ) : candidates.length === 0 ? (
                <div
                    style={{
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '2rem',
                        boxShadow: 'var(--shadow-sm)',
                    }}
                >
                    <EmptyState
                        icon={Users}
                        title={searchQuery || locationFilter ? 'No candidates match your search' : 'No candidates yet'}
                        description={searchQuery || locationFilter
                            ? 'Try different keywords or clear your filters.'
                            : 'Active candidates will appear here once they sign up.'}
                    />
                </div>
            ) : (
                <div
                    style={{
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '1.5rem',
                        boxShadow: 'var(--shadow-sm)',
                    }}
                >"""

if old_block in text:
    text = text.replace(old_block, new_block, 1)
    print("OK: loading + empty state replaced")
else:
    print("NOT FOUND: loading block")

FILE.write_text(text, encoding='utf-8')
print("Saved.")
