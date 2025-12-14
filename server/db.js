const { Pool } = require("pg");
require('dotenv').config();

const connectionString = process.env.DB_CONNECTION_STRING;

// Use pool for better performance and connection management
const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false // Required for Neon connections
    }
});

/**
 * Executes a SQL query with optional parameters.
 * Handles both SQL Server (?) and PostgreSQL ($1, $2) parameter styles
 * to maintain compatibility during migration.
 * @param {string} sqlQuery - The SQL query string.
 * @param {Array} params - Optional parameters for the query.
 * @returns {Promise<Array>} - Resolves with the result rows.
 */
const query = async (sqlQuery, params = []) => {
    let client;
    try {
        client = await pool.connect();

        // Convert '?' parameters to '$1, $2, ...' if needed for PG
        // This is a simple conversion for legacy SQL Server queries
        let pgQuery = sqlQuery;
        let paramCount = 1;
        while (pgQuery.includes('?')) {
            pgQuery = pgQuery.replace('?', `$${paramCount++}`);
        }

        const result = await client.query(pgQuery, params);

        // Alias support for frontend compatibility
        // Automatically maps lowercase keys to PascalCase for common fields
        const processedRows = result.rows.map(row => {
            const aliasedRow = { ...row };

            // Comprehensive ID and descriptive field mappings
            const mappings = {
                // IDs
                'userid': 'UserID',
                'roleid': 'RoleID',
                'jobid': 'JobID',
                'applicationid': 'ApplicationID',
                'candidateid': 'CandidateID',
                'statusid': 'StatusID',
                'interviewid': 'InterviewID',
                'assessmentid': 'AssessmentID',
                'skillid': 'SkillID',
                'auditid': 'AuditID',
                'recordid': 'RecordID',
                'consentid': 'ConsentID',

                // Common Descriptive Fields
                'jobtitle': 'JobTitle',
                'location': 'Location',
                'description': 'Description',
                'fullname': 'FullName',
                'candidatename': 'CandidateName',
                'yearsofexperience': 'YearsOfExperience',
                'skills': 'Skills',
                'username': 'UserName',
                'email': 'Email',
                'statusname': 'StatusName',
                'rolename': 'RoleName',
                'minexperience': 'MinExperience',
                'vacancies': 'Vacancies',
                'salarymin': 'SalaryMin',
                'salarymax': 'SalaryMax',
                'minsalary': 'MinSalary',
                'maxsalary': 'MaxSalary',
                'applieddate': 'AppliedDate',
                'createdat': 'CreatedAt',
                'updatedat': 'UpdatedAt',
                'isactive': 'IsActive',
                'isdeleted': 'IsDeleted',
                'ismandatory': 'IsMandatory',
                'minproficiency': 'MinProficiency',
                'skillname': 'SkillName',
                'matchedskillscount': 'MatchedSkillsCount',
                'totalmatchscore': 'TotalMatchScore',
                'engagementrate': 'EngagementRate',
                'hireratepercent': 'HireRatePercent',
                'skillgap': 'SkillGap',
                'avgscoregiven': 'AvgScoreGiven',
                'scorevariance': 'ScoreVariance',
                'rejectionreason': 'RejectionReason',
                'rejectioncount': 'RejectionCount',
                'rejectionpercent': 'RejectionPercent',

                // Interview-specific fields
                'scheduleid': 'ScheduleID',
                'interviewstart': 'InterviewStart',
                'interviewend': 'InterviewEnd',
                'candidateconfirmed': 'CandidateConfirmed',
                'recruiterid': 'RecruiterID',
                'recruitername': 'RecruiterName',
                'joblocation': 'JobLocation',
                'timestatus': 'TimeStatus',
                'duration': 'Duration',
                'platform': 'Platform',
                'status': 'Status',

                // Candidate profile fields
                'proficiencylevel': 'ProficiencyLevel',
                'phonenumber': 'PhoneNumber',
                'dateofbirth': 'DateOfBirth',
                'resumeurl': 'ResumeUrl',
                'linkedinurl': 'LinkedInUrl',
                'githuburl': 'GitHubUrl',
                'portfoliourl': 'PortfolioUrl',
                'isverified': 'IsVerified',
                'verifiedat': 'VerifiedAt',
                'verifiedby': 'VerifiedBy',
                'withdrawalreason': 'WithdrawalReason',
                'daysinactive': 'DaysInactive',

                // Assessment / ranking fields
                'assessmentname': 'AssessmentName',
                'assessmenttype': 'AssessmentType',
                'passscore': 'PassScore',
                'maxscore': 'MaxScore',
                'score': 'Score',
                'ispassed': 'IsPassed',
                'completedat': 'CompletedAt',
                'timetaken': 'TimeTaken',
                'candidaterank': 'CandidateRank',
                'rankingscore': 'RankingScore',

                // Analytics / reporting fields
                'applicationcount': 'ApplicationCount',
                'filledpositions': 'FilledPositions',
                'totalapplications': 'TotalApplications',
                'totalapplicants': 'TotalApplicants',
                'hiredcount': 'HiredCount',
                'experiencegroup': 'ExperienceGroup',
                'avgdaysinstage': 'AvgDaysInStage',
                'applicationsinstage': 'ApplicationsInStage',
                'interviewsconducted': 'InterviewsConducted',
                'avgdayshired': 'AvgDaysHired',
                'hirecount': 'HireCount',
                'totalpool': 'TotalPool',
                'topmatches': 'TopMatches',
                'openroles': 'OpenRoles',
                'calculatedat': 'CalculatedAt',
                'matchscore': 'MatchScore',
                'overallremotescore': 'OverallRemoteScore',
                'hireddate': 'HiredDate',
                'dayssincehired': 'DaysSinceHired',
                'historyid': 'HistoryID',
                'utilizationrate': 'UtilizationRate',
                'filledvacancies': 'FilledVacancies',
                'totalvacancies': 'TotalVacancies',
                'skillgap': 'SkillGap',
                'demandlevel': 'DemandLevel',
                'supplycount': 'SupplyCount',
                'demandcount': 'DemandCount',
                'availableskills': 'AvailableSkills',

                // Gamification / leaderboard
                'points': 'Points',
                'totalpoints': 'TotalPoints',
                'rank': 'Rank',
                'badgename': 'BadgeName',
                'badgedescription': 'BadgeDescription',
                'earneddate': 'EarnedDate',
                'streakdays': 'StreakDays',
                'loginstreak': 'LoginStreak',

                // Background check / verification
                'checkid': 'CheckID',
                'checkstatus': 'CheckStatus',
                'checktype': 'CheckType',
                'checkedby': 'CheckedBy',
                'checkdate': 'CheckDate',
                'txhash': 'TxHash',
                'blockchainnetwork': 'BlockchainNetwork',
                'vendor': 'Vendor',
                'requestid': 'RequestID',
                'result': 'Result',
                'findings': 'Findings',
                'risklevel': 'RiskLevel',
                'initiatedat': 'InitiatedAt',
                'completedat': 'CompletedAt',
                'reporturl': 'ReportUrl',
                'cost': 'Cost',
                'turnarounddays': 'TurnaroundDays',
                'notes': 'Notes',

                // Blockchain verification fields
                // These are returned by GET /recruiters/blockchain-verifications/:candidateId
                // and GET /recruiters/blockchain-dashboard. Without these mappings the
                // frontend reads verif.VerificationID as undefined and ends up PUT-ing
                // to /blockchain-verifications/undefined (500).
                'verificationid': 'VerificationID',
                'credentialtype': 'CredentialType',
                'issuingauthority': 'IssuingAuthority',
                'credentialhash': 'CredentialHash',
                'blockchaintransactionid': 'BlockchainTransactionID',
                'blocknumber': 'BlockNumber',
                'network': 'Network',
                'isimmutable': 'IsImmutable',
                'verificationcost': 'VerificationCost',
                'verificationstatus': 'VerificationStatus',
                'metadata': 'Metadata',
                'lastchecked': 'LastChecked',

                // Blockchain dashboard summary aggregates
                'totalverifications': 'TotalVerifications',
                'totalcost': 'TotalCost',
                'avgcost': 'AvgCost',

                // Dashboard stats
                'totalchecks': 'TotalChecks',
                'pending': 'Pending',
                'inprogress': 'InProgress',
                'cleared': 'Cleared',
                'adverse': 'Adverse',
                'consider': 'Consider',
                'avgcost': 'AvgCost',
                'avgturnarounddays': 'AvgTurnaroundDays',
                'totalcost': 'TotalCost',
                'count': 'Count',
                'completed': 'Completed',
                'failed': 'Failed',
                'successprobability': 'SuccessProbability',
                'confidencelevel': 'ConfidenceLevel',
                'keyfactors': 'KeyFactors',
                'predictionid': 'PredictionID',

                // Job salary / requirements
                'istransparent': 'IsTransparent',
                'createdby': 'CreatedBy',
                'fromstatus': 'FromStatus',
                'tostatus': 'ToStatus',
                'changedbylabel': 'ChangedByLabel',

                // ---- Ghosting / risk analytics ----
                // Returned by GET /analytics/ghosting-detail and /analytics/risk-alerts
                // Without these, GhostingRiskDetail.jsx shows 0 candidates in each
                // risk bucket (High/Medium/Low) because OverallRiskLevel is undefined.
                'overallrisklevel': 'OverallRiskLevel',
                'overallriskscore': 'OverallRiskScore',
                'candidateghostingscore': 'CandidateGhostingScore',
                'recruiterghostingscore': 'RecruiterGhostingScore',
                'avgresponsetime': 'AvgResponseTime',
                'totalcommunications': 'TotalCommunications',
                'dayssinceapplication': 'DaysSinceApplication',
                'dayssincecontact': 'DaysSinceLastContact',  // alias used in some queries
                'responsetimehours': 'ResponseTimeHours',
                'communicationfrequency': 'CommunicationFrequency',
                'lastcontactdate': 'LastContactDate',

                // ---- Market intelligence / skill demand ----
                // Returned by GET /analytics/market (MarketIntelligenceChart, SalaryCoach,
                // MarketAlerts, HireAnalytics, SkillGapAnalysis)
                'demandscore': 'DemandScore',
                'supplyscore': 'SupplyScore',
                'salarytrend': 'SalaryTrend',
                'avgsalary': 'AvgSalary',

                // ---- Referral intelligence ----
                // Returned by /referrals routes (ReferralIntelligence.jsx)
                'referralid': 'ReferralID',
                'referraldate': 'ReferralDate',
                'referralstrength': 'ReferralStrength',
                'relationshiptype': 'RelationshipType',
                'connectionstrength': 'ConnectionStrength',
                'bonusamount': 'BonusAmount',
                'totalbonusearned': 'TotalBonusEarned',
                'totalreferrals': 'TotalReferrals',
                'successfulreferrals': 'SuccessfulReferrals',
                'converted': 'Converted',
                'conversionrate': 'ConversionRate',

                // ---- Candidate engagement / interviews ----
                // Returned by /analytics/candidate-engagement (CandidateEngagement.jsx)
                'engagementscore': 'EngagementScore',
                'confirmedinterviews': 'ConfirmedInterviews',
                'interviewsscheduled': 'InterviewsScheduled',
                'interviewername': 'InterviewerName',
                'qualityscore': 'QualityScore',
                'avgqualityscore': 'AvgQualityScore',

                // ---- Career path simulator ----
                // Returned by /analytics/career-path (CareerPath.jsx, CareerPathSimulator.jsx)
                'targetrole': 'TargetRole',
                'transitionprobability': 'TransitionProbability',
                'currentreadinessscore': 'CurrentReadinessScore',
                'selfmotivationscore': 'SelfMotivationScore',
                'timezonealignment': 'TimezoneAlignment',

                // ---- Candidate profile enrichment ----
                // Returned by candidate profile endpoints (CandidateProfileModal.jsx)
                'candidatelocation': 'CandidateLocation',
                'extractedskills': 'ExtractedSkills',
                'resumequalityscore': 'ResumeQualityScore',
                'resumetext': 'ResumeText',
                'educationinstitutions': 'EducationInstitutions',
                'certifications': 'Certifications',
                'badges': 'Badges',
                'trustlevel': 'TrustLevel',
                'complianceverified': 'ComplianceVerified',

                // ---- Skill verification ----
                // Returned by /analytics/skill-verification (SkillVerificationStatus.jsx,
                // CandidateSkillsVerification.jsx)
                'claimedlevel': 'ClaimedLevel',
                'verificationmethod': 'VerificationMethod',
                'verificationscore': 'VerificationScore',
                'expirydate': 'ExpiryDate',
                'validitystatus': 'ValidityStatus',
                'passingscore': 'PassingScore',
                'predictedat': 'PredictedAt',

                // ---- Assessment / question generation ----
                // Returned by /assessment routes (AssessmentTestingEngine.jsx)
                'attemptid': 'AttemptID',
                'questionscount': 'QuestionsCount',
                'timelimit': 'TimeLimit',

                // ---- Hire success prediction breakdown ----
                // Returned by /analytics/predict-hire-success response
                'hireresult': 'HireResult',

                // ---- Common audit fields ----
                'changedby': 'ChangedBy',
                'created': 'Created',
                'submitted': 'Submitted',
                'declined': 'Declined',
                'detection': 'Detection',
                'recruiter': 'Recruiter',
            };

            Object.keys(mappings).forEach(lowerKey => {
                if (row[lowerKey] !== undefined && row[mappings[lowerKey]] === undefined) {
                    aliasedRow[mappings[lowerKey]] = row[lowerKey];
                }
            });

            // Round long-decimal values — PostgreSQL NUMERIC type preserves
            // full precision (e.g., 0.880000000000000000000 or 6.6666666666666667)
            // which looks bad in the UI. This catches ALL values globally.
            for (const key of Object.keys(aliasedRow)) {
                const val = aliasedRow[key];
                if (typeof val === 'string' && val.match(/^-?\d+\.\d{4,}$/)) {
                    const num = parseFloat(val);
                    if (!isNaN(num)) {
                        aliasedRow[key] = Math.round(num * 100) / 100;
                    }
                } else if (typeof val === 'number' && val % 1 !== 0) {
                    const str = String(val);
                    if (str.includes('.') && str.split('.')[1].length > 4) {
                        aliasedRow[key] = Math.round(val * 100) / 100;
                    }
                }
            }

            return aliasedRow;
        });

        return processedRows;
    } catch (err) {
        console.error("Database Query Error:", err.message);
        console.error("SQL:", sqlQuery);
        throw err;
    } finally {
        if (client) client.release();
    }
};

const connectDB = async () => {
    try {
        console.log("Connecting to Neon PostgreSQL...");
        // Running a simple query to verify connection
        await query("SELECT 1 as result");
        console.log("✅ Successfully connected to Neon PostgreSQL!");
        return true;
    } catch (err) {
        console.error("❌ Neon PostgreSQL connection failed!");
        console.error(err.message);
        throw err;
    }
};

module.exports = { query, connectDB, pool };
