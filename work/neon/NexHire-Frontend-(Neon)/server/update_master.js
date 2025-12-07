const fs = require('fs');
const path = require('path');

async function test() {
    try {
        const masterScriptPath = path.join('c:', 'Users', 'Hp ENVY X360 2 in 1', 'Desktop', 'NexHire-Frontend', 'ProjectResources', 'RecruitmentDB_MasterScript.sql');
        const clrFunctionsPath = path.join('c:', 'Users', 'Hp ENVY X360 2 in 1', 'Desktop', 'NexHire-Frontend', 'server', 'clr_functions.sql');
        const clrHexPath = path.join('c:', 'Users', 'Hp ENVY X360 2 in 1', 'Desktop', 'NexHire-Frontend', 'server', 'clr_assembly_hex.txt');

        console.log('Reading files...');
        let masterScript = fs.readFileSync(masterScriptPath, 'utf8');
        const clrFunctions = fs.readFileSync(clrFunctionsPath, 'utf8');
        const clrHex = fs.readFileSync(clrHexPath, 'utf8').trim();

        // 1. Enable CLR and Trustworthy
        const setupClr = `
-- ============================================================================
-- PRE-SETUP: ENABLE CLR & TRUSTWORTHY
-- ============================================================================
EXEC sp_configure 'clr enabled', 1;
RECONFIGURE;
GO

ALTER DATABASE RecruitmentDB SET TRUSTWORTHY ON;
GO

-- ============================================================================
-- PHASE 1.1: REGISTER CLR ASSEMBLY
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.assemblies WHERE name = 'RecruitmentCLR')
BEGIN
    CREATE ASSEMBLY [RecruitmentCLR]
    FROM ${clrHex}
    WITH PERMISSION_SET = EXTERNAL_ACCESS;
    PRINT 'Assembly RecruitmentCLR registered successfully.';
END
GO

-- ============================================================================
-- PHASE 1.2: CLR FUNCTIONS
-- ============================================================================
-- Dropping existing functions to avoid conflicts if script is re-run
`;

        // Add drop logic for functions
        const functionNames = clrFunctions.match(/CREATE FUNCTION \[dbo\]\.\[(\w+)\]/g).map(m => m.match(/\[(\w+)\]$/)[1]);
        let dropFunctions = '';
        functionNames.forEach(name => {
            dropFunctions += `IF OBJECT_ID('[dbo].[${name}]') IS NOT NULL DROP FUNCTION [dbo].[${name}];\n`;
        });

        const clrContent = setupClr + dropFunctions + 'GO\n\n' + clrFunctions;

        // more robust search for USE RecruitmentDB
        const regex = /USE\s+\[?RecruitmentDB\]?;\s*\nGO\s*\n/i;
        const match = masterScript.match(regex);

        if (match) {
            const insertPoint = match.index + match[0].length;
            const before = masterScript.substring(0, insertPoint);
            const after = masterScript.substring(insertPoint);
            masterScript = before + clrContent + after;

            fs.writeFileSync(masterScriptPath, masterScript);
            console.log('Successfully updated RecruitmentDB_MasterScript.sql with CLR objects.');
        } else {
            console.error('Could not find insertion point in master script.');
            // Fallback: just append if the script starts with creation logic
            console.log('Trying fallback insertion...');
            const creationPoint = masterScript.indexOf('USE RecruitmentDB;');
            if (creationPoint !== -1) {
                // try simpler search
                const endOfLine = masterScript.indexOf('\n', creationPoint) + 1;
                const nextGo = masterScript.indexOf('GO', endOfLine);
                const finalPoint = (nextGo !== -1) ? (masterScript.indexOf('\n', nextGo) + 1) : endOfLine;

                const before = masterScript.substring(0, finalPoint);
                const after = masterScript.substring(finalPoint);
                masterScript = before + clrContent + after;
                fs.writeFileSync(masterScriptPath, masterScript);
                console.log('Successfully updated RecruitmentDB_MasterScript.sql using fallback.');
            } else {
                console.error('FAILED: No USE RecruitmentDB found.');
            }
        }

    } catch (err) {
        console.error('Update Error:', err.message);
    }
    process.exit();
}
test();
