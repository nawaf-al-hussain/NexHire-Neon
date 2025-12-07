/**
 * Document Processing Helper
 * Uses pdf-parse for PDF extraction and custom logic for DOCX
 * Replaces CLR functions for better compatibility with modern PDFs
 */

// pdf-parse is lazy-loaded below to avoid DOMMatrix crash on Vercel serverless
const { query } = require('./db');

let _pdf = null;
function getPdfParse() {
    if (_pdf === null) {
        _pdf = require('pdf-parse');
    }
    return _pdf;
}

/**
 * Extract text from PDF buffer using pdf-parse
 * @param {Buffer} pdfBuffer - The PDF file buffer
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromPDF(pdfBuffer) {
    try {
        if (!pdfBuffer || pdfBuffer.length === 0) {
            console.log('[PDF] No buffer provided');
            return null;
        }

        console.log('[PDF] Starting extraction, buffer size:', pdfBuffer.length);
        const data = await getPdfParse()(pdfBuffer);
        console.log('[PDF] Extraction complete, text length:', data?.text?.length || 0);

        if (data && data.text) {
            // Clean up the extracted text
            let text = data.text;
            // Remove excessive whitespace but keep paragraph breaks
            text = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
            return text.trim();
        }

        console.log('[PDF] No text found in PDF');
        return null;
    } catch (error) {
        console.error('[PDF] Extraction error:', error.message);
        return null;
    }
}

/**
 * Extract text from DOCX buffer
 * Note: This is a basic implementation. For production, consider using 'mammoth' or 'docx' package
 * @param {Buffer} docxBuffer - The DOCX file buffer
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromDOCX(docxBuffer) {
    try {
        if (!docxBuffer || docxBuffer.length === 0) {
            return null;
        }

        // Basic DOCX extraction by finding <w:t> elements in the XML
        // This is a simplified approach - for production, use mammoth.js
        const text = docxBuffer.toString('utf-8');

        // Extract text between <w:t> tags
        const textMatches = text.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);

        if (textMatches && textMatches.length > 0) {
            const extractedTexts = textMatches.map(match => {
                // Remove XML tags to get the text content
                return match.replace(/<[^>]+>/g, '');
            });

            // Join with spaces and clean up
            return extractedTexts.join(' ').replace(/\s+/g, ' ').trim();
        }

        return null;
    } catch (error) {
        console.error('DOCX extraction error:', error.message);
        return null;
    }
}

/**
 * Extract skills from resume text using keyword matching
 * Returns skills in format "SkillName:confidence,SkillName:confidence"
 * @param {string} resumeText - The extracted resume text
 * @returns {string} - Extracted skills string
 */
function extractSkillsFromText(resumeText) {
    if (!resumeText) {
        return null;
    }

    // Comprehensive skill list with variations
    const skills = {
        // Programming Languages
        'Java': ['java', 'java se', 'java ee', 'j2ee', 'jvm'],
        'Python': ['python', 'python3', 'django', 'flask', 'pandas', 'numpy'],
        'JavaScript': ['javascript', 'js', 'ecmascript'],
        'TypeScript': ['typescript', 'ts'],
        'C#': ['c#', 'csharp', '.net', 'dotnet', 'asp.net'],
        'C++': ['c++', 'cpp'],
        'C': ['c programming', 'c language'],
        'PHP': ['php', 'laravel', 'symfony'],
        'Ruby': ['ruby', 'rails', 'ruby on rails'],
        'Go': ['golang', 'go programming'],
        'Rust': ['rust', 'rust programming'],
        'Swift': ['swift', 'ios development'],
        'Kotlin': ['kotlin', 'android development'],
        'Scala': ['scala', 'spark', 'akka'],

        // Web Technologies
        'React': ['react', 'reactjs', 'react.js', 'react native'],
        'Angular': ['angular', 'angularjs', 'angular.js'],
        'Vue': ['vue', 'vuejs', 'vue.js', 'vue.js'],
        'Node.js': ['node', 'nodejs', 'node.js', 'express', 'expressjs'],
        'HTML': ['html', 'html5', 'htm'],
        'CSS': ['css', 'css3', 'scss', 'sass', 'less'],
        'REST': ['rest', 'restful', 'rest api'],
        'GraphQL': ['graphql', 'apollo'],

        // Databases
        'SQL': ['sql', 'mysql', 'postgresql', 'mssql', 'oracle database', 'mariadb', 'sqlite'],
        'MongoDB': ['mongodb', 'mongo'],
        'Redis': ['redis', 'redis cache'],
        'Elasticsearch': ['elasticsearch', 'elastic'],
        'SQL Server': ['sql server', 'mssql', 'tsql'],

        // Cloud & DevOps
        'AWS': ['aws', 'amazon web services', 'ec2', 's3', 'lambda'],
        'Azure': ['azure', 'microsoft azure'],
        'GCP': ['gcp', 'google cloud', 'google cloud platform'],
        'Docker': ['docker', 'docker container'],
        'Kubernetes': ['kubernetes', 'k8s', 'helm'],
        'Jenkins': ['jenkins', 'ci/cd'],
        'Git': ['git', 'github', 'gitlab', 'bitbucket'],
        'CI/CD': ['ci/cd', 'continuous integration', 'continuous deployment', 'devops'],

        // Data Science & ML
        'Machine Learning': ['machine learning', 'ml', 'ml algorithms', 'scikit-learn'],
        'Deep Learning': ['deep learning', 'neural network', 'tensorflow', 'pytorch', 'keras'],
        'Data Analysis': ['data analysis', 'data analytics', 'tableau', 'power bi'],
        'NLP': ['nlp', 'natural language processing'],

        // Frameworks & Libraries
        'Spring': ['spring', 'spring boot', 'spring framework'],
        'Hibernate': ['hibernate', 'jpa'],
        'Express': ['express', 'expressjs', 'express.js'],
        'Bootstrap': ['bootstrap', 'bootstrap5'],
        'Tailwind': ['tailwind', 'tailwind css'],

        // Testing
        'Selenium': ['selenium', 'automated testing'],
        'Jest': ['jest', 'unit testing'],
        'JUnit': ['junit', 'junit testing'],

        // Soft Skills & Methodologies
        'Agile': ['agile', 'scrum', 'kanban'],
        'Project Management': ['project management', 'pmp', 'prince2'],
        'Leadership': ['leadership', 'team lead', 'tech lead'],
        'Communication': ['communication', 'communication skills'],

        // Other Technologies
        'API': ['api', 'web api', 'api development'],
        'Microservices': ['microservices', 'microservice architecture'],
        'Linux': ['linux', 'unix', 'bash'],
        'XML': ['xml', 'xsd'],
        'JSON': ['json', 'json data'],
    };

    const foundSkills = [];
    const textLower = resumeText.toLowerCase();

    for (const [skillName, keywords] of Object.entries(skills)) {
        for (const keyword of keywords) {
            // Use word boundary matching for better accuracy
            const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (regex.test(textLower)) {
                // Calculate confidence based on keyword specificity
                const confidence = keyword.length > 4 ? 80 : 60;
                if (!foundSkills.some(s => s.name === skillName)) {
                    foundSkills.push({ name: skillName, confidence });
                }
                break; // Only count each skill once
            }
        }
    }

    // Sort by confidence and take top skills
    foundSkills.sort((a, b) => b.confidence - a.confidence);
    const topSkills = foundSkills.slice(0, 15);

    // Format as "SkillName:confidence,SkillName:confidence"
    return topSkills.map(s => `${s.name}:${s.confidence}`).join(',');
}

/**
 * Extract years of experience from resume text
 * @param {string} resumeText - The extracted resume text
 * @returns {number|null} - Years of experience
 */
function extractYearsOfExperience(resumeText) {
    if (!resumeText) {
        return null;
    }

    const patterns = [
        // Explicit patterns: "5 years of experience", "10+ years experience"
        /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?experience/gi,
        /experience\s*(?:of|:)?\s*(\d+)\+?\s*(?:years?|yrs?)/gi,
        /(\d+)\+?\s*(?:years?|yrs?)\s*(?:in|with|at)/gi,

        // Date range patterns: "2018 - 2023", "2019 to present"
        /(?:from|between|working)\s*(\d{4})\s*(?:-|to|and)\s*(?:present|current|now|(\d{4}))/gi,

        // Summary patterns: "5+ years", "10 years +"
        /(\d+)\+?\s*(?:years?|yrs?)\s*\+/gi,

        // Seniority patterns
        /senior\s*(?:developer|engineer|manager)\s*(\d+)\+?\s*(?:years?|yrs?)/gi,
        /lead\s*(?:developer|engineer|manager)\s*(\d+)\+?\s*(?:years?|yrs?)/gi,
    ];

    const currentYear = new Date().getFullYear();
    const years = [];

    for (const pattern of patterns) {
        const matches = resumeText.matchAll(pattern);
        for (const match of matches) {
            if (match[1]) {
                let year = parseInt(match[1]);

                // If it's a year (e.g., 2018), calculate years from that year
                if (year <= currentYear && year >= 1970) {
                    year = currentYear - year;
                }

                if (year >= 0 && year <= 50) {
                    years.push(year);
                }
            }
            if (match[2]) {
                let year = parseInt(match[2]);
                if (year <= currentYear && year >= 1970) {
                    year = currentYear - year;
                }
                if (year >= 0 && year <= 50) {
                    years.push(year);
                }
            }
        }
    }

    // Return the maximum years found
    if (years.length > 0) {
        return Math.max(...years);
    }

    return null;
}

/**
 * Process candidate resume using Node.js (replaces CLR stored procedure)
 * @param {number} candidateID - The candidate ID
 * @returns {Promise<object>} - Processing result
 */
async function processCandidateResume(candidateID) {
    try {
        // Get the resume file
        const result = await query(
            "SELECT ResumeFile, ResumeFileName FROM Candidates WHERE CandidateID = ?",
            [candidateID]
        );

        if (result.length === 0 || !result[0].ResumeFile) {
            return { success: false, error: 'No resume file found' };
        }

        const { ResumeFile, ResumeFileName } = result[0];
        let resumeText = null;

        // Extract text based on file type
        if (ResumeFileName?.toLowerCase().endsWith('.pdf')) {
            resumeText = await extractTextFromPDF(ResumeFile);
        } else if (ResumeFileName?.toLowerCase().endsWith('.docx')) {
            resumeText = await extractTextFromDOCX(ResumeFile);
        }

        if (!resumeText) {
            return { success: false, error: 'Failed to extract text from file' };
        }

        // Extract skills and years of experience
        const extractedSkills = extractSkillsFromText(resumeText);
        const yearsOfExperience = extractYearsOfExperience(resumeText);

        // Update the candidate record
        await query(
            `UPDATE Candidates 
             SET ResumeText = ?, ExtractedSkills = ?, YearsOfExperience = CASE WHEN ? > 0 THEN ? ELSE YearsOfExperience END
             WHERE CandidateID = ?`,
            [resumeText, extractedSkills, yearsOfExperience || 0, yearsOfExperience || 0, candidateID]
        );

        return {
            success: true,
            textLength: resumeText.length,
            extractedSkills,
            yearsOfExperience
        };
    } catch (error) {
        console.error('Process resume error:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    extractTextFromPDF,
    extractTextFromDOCX,
    extractSkillsFromText,
    extractYearsOfExperience,
    processCandidateResume
};
