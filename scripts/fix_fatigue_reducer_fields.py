"""Fix all PascalCase field accesses in InterviewFatigueReducer.jsx
to use lowercase fallbacks (the API returns lowercase keys)."""
from pathlib import Path

f = Path("/home/z/my-project/work/neon/NexHire-Frontend-(Neon)/client/src/components/Recruiters/InterviewFatigueReducer.jsx")
text = f.read_text(encoding='utf-8')

# Map PascalCase -> lowercase
replacements = [
    ('optimizationData.optimization.RecommendedInterviewRounds', 'optimizationData.optimization.RecommendedInterviewRounds || optimizationData.optimization.recommendedinterviewrounds'),
    ('optimizationData.optimization.RedundantQuestionsDetected', 'optimizationData.optimization.RedundantQuestionsDetected || optimizationData.optimization.redundantquestionsdetected'),
    ('optimizationData.optimization.EstimatedMinutes', 'optimizationData.optimization.EstimatedMinutes || optimizationData.optimization.estimatedminutes'),
    ('optimizationData.optimization.TimeSavedMinutes', 'optimizationData.optimization.TimeSavedMinutes || optimizationData.optimization.timesavedminutes'),
    ('optimizationData.optimization.RedundancyAssessment', 'optimizationData.optimization.RedundancyAssessment || optimizationData.optimization.redundancyassessment'),
    ('optimizationData.optimization.AlreadyAssessedSkills', 'optimizationData.optimization.AlreadyAssessedSkills || optimizationData.optimization.alreadyassessedskills'),
    ('optimizationData.optimization.SkillsToAssess', 'optimizationData.optimization.SkillsToAssess || optimizationData.optimization.skillstoassess'),
]

count = 0
for old, new in replacements:
    if old in text:
        text = text.replace(old, new)
        count += 1

f.write_text(text, encoding='utf-8')
print(f"Fixed {count} field accesses")
