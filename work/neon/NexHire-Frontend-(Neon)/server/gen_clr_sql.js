const fs = require('fs');

// Data from tool outputs
const params = [
    { "FunctionName": "AddBusinessDays", "ParameterName": "", "TypeName": "datetime", "max_length": 8, "precision": 23, "scale": 3, "is_output": true, "parameter_id": 0, "assembly_class": "RecruitmentCLR", "assembly_method": "AddBusinessDays" },
    { "FunctionName": "AddBusinessDays", "ParameterName": "@startDate", "TypeName": "datetime", "max_length": 8, "precision": 23, "scale": 3, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "AddBusinessDays", "ParameterName": "@daysToAdd", "TypeName": "int", "max_length": 4, "precision": 10, "scale": 0, "is_output": false, "parameter_id": 2 },
    { "FunctionName": "CalculateBusinessDays", "ParameterName": "", "TypeName": "int", "max_length": 4, "precision": 10, "scale": 0, "is_output": true, "parameter_id": 0, "assembly_class": "RecruitmentCLR", "assembly_method": "CalculateBusinessDays" },
    { "FunctionName": "CalculateBusinessDays", "ParameterName": "@startDate", "TypeName": "datetime", "max_length": 8, "precision": 23, "scale": 3, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "CalculateBusinessDays", "ParameterName": "@endDate", "TypeName": "datetime", "max_length": 8, "precision": 23, "scale": 3, "is_output": false, "parameter_id": 2 },
    { "FunctionName": "CalculateSentiment", "ParameterName": "", "TypeName": "float", "max_length": 8, "precision": 53, "scale": 0, "is_output": true, "parameter_id": 0, "assembly_class": "NLPProcessor", "assembly_method": "CalculateSentiment" },
    { "FunctionName": "CalculateSentiment", "ParameterName": "@text", "TypeName": "nvarchar", "max_length": -1, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "CalculateTimezoneOverlap", "ParameterName": "", "TypeName": "int", "max_length": 4, "precision": 10, "scale": 0, "is_output": true, "parameter_id": 0, "assembly_class": "TimezoneFunctions", "assembly_method": "CalculateTimezoneOverlap" },
    { "FunctionName": "CalculateTimezoneOverlap", "ParameterName": "@tz1", "TypeName": "nvarchar", "max_length": 100, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "CalculateTimezoneOverlap", "ParameterName": "@tz2", "TypeName": "nvarchar", "max_length": 100, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 2 },
    { "FunctionName": "CallRESTApi", "ParameterName": "", "TypeName": "nvarchar", "max_length": -1, "precision": 0, "scale": 0, "is_output": true, "parameter_id": 0, "assembly_class": "ApiIntegration", "assembly_method": "CallRESTApi" },
    { "FunctionName": "CallRESTApi", "ParameterName": "@url", "TypeName": "nvarchar", "max_length": -1, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "CallRESTApi", "ParameterName": "@method", "TypeName": "nvarchar", "max_length": 20, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 2 },
    { "FunctionName": "CallRESTApi", "ParameterName": "@body", "TypeName": "nvarchar", "max_length": -1, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 3 },
    { "FunctionName": "ConvertTimezone", "ParameterName": "", "TypeName": "datetime", "max_length": 8, "precision": 23, "scale": 3, "is_output": true, "parameter_id": 0, "assembly_class": "TimezoneFunctions", "assembly_method": "ConvertTimezone" },
    { "FunctionName": "ConvertTimezone", "ParameterName": "@dt", "TypeName": "datetime", "max_length": 8, "precision": 23, "scale": 3, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "ConvertTimezone", "ParameterName": "@fromTz", "TypeName": "nvarchar", "max_length": 100, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 2 },
    { "FunctionName": "ConvertTimezone", "ParameterName": "@toTz", "TypeName": "nvarchar", "max_length": 100, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 3 },
    { "FunctionName": "CorrelationCoefficient", "ParameterName": "", "TypeName": "float", "max_length": 8, "precision": 53, "scale": 0, "is_output": true, "parameter_id": 0, "assembly_class": "RecruitmentCLR", "assembly_method": "CorrelationCoefficient" },
    { "FunctionName": "CorrelationCoefficient", "ParameterName": "@vals1", "TypeName": "nvarchar", "max_length": -1, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "CorrelationCoefficient", "ParameterName": "@vals2", "TypeName": "nvarchar", "max_length": -1, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 2 },
    { "FunctionName": "CosineSimilarity", "ParameterName": "", "TypeName": "float", "max_length": 8, "precision": 53, "scale": 0, "is_output": true, "parameter_id": 0, "assembly_class": "RecruitmentCLR", "assembly_method": "CosineSimilarity" },
    { "FunctionName": "CosineSimilarity", "ParameterName": "@a", "TypeName": "nvarchar", "max_length": -1, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "CosineSimilarity", "ParameterName": "@b", "TypeName": "nvarchar", "max_length": -1, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 2 },
    { "FunctionName": "EncryptSensitiveData", "ParameterName": "", "TypeName": "nvarchar", "max_length": -1, "precision": 0, "scale": 0, "is_output": true, "parameter_id": 0, "assembly_class": "RecruitmentCLR", "assembly_method": "EncryptSensitiveData" },
    { "FunctionName": "EncryptSensitiveData", "ParameterName": "@text", "TypeName": "nvarchar", "max_length": -1, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "ExtractEmailDomain", "ParameterName": "", "TypeName": "nvarchar", "max_length": 200, "precision": 0, "scale": 0, "is_output": true, "parameter_id": 0, "assembly_class": "RecruitmentCLR", "assembly_method": "ExtractEmailDomain" },
    { "FunctionName": "ExtractEmailDomain", "ParameterName": "@email", "TypeName": "nvarchar", "max_length": 200, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "ExtractSkills", "ParameterName": "", "TypeName": "nvarchar", "max_length": -1, "precision": 0, "scale": 0, "is_output": true, "parameter_id": 0, "assembly_class": "NLPProcessor", "assembly_method": "ExtractSkills" },
    { "FunctionName": "ExtractSkills", "ParameterName": "@resumeText", "TypeName": "nvarchar", "max_length": -1, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "ExtractTextFromDocx", "ParameterName": "", "TypeName": "nvarchar", "max_length": -1, "precision": 0, "scale": 0, "is_output": true, "parameter_id": 0, "assembly_class": "DocumentParser", "assembly_method": "ExtractTextFromDocx" },
    { "FunctionName": "ExtractTextFromDocx", "ParameterName": "@docxBytes", "TypeName": "varbinary", "max_length": -1, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "ExtractTextFromPDF", "ParameterName": "", "TypeName": "nvarchar", "max_length": -1, "precision": 0, "scale": 0, "is_output": true, "parameter_id": 0, "assembly_class": "DocumentParser", "assembly_method": "ExtractTextFromPDF" },
    { "FunctionName": "ExtractTextFromPDF", "ParameterName": "@pdfBytes", "TypeName": "varbinary", "max_length": -1, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "ExtractYearsOfExperience", "ParameterName": "", "TypeName": "int", "max_length": 4, "precision": 10, "scale": 0, "is_output": true, "parameter_id": 0, "assembly_class": "DocumentParser", "assembly_method": "ExtractYearsOfExperience" },
    { "FunctionName": "ExtractYearsOfExperience", "ParameterName": "@resumeText", "TypeName": "nvarchar", "max_length": -1, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "GenerateSecureToken", "ParameterName": "", "TypeName": "nvarchar", "max_length": 512, "precision": 0, "scale": 0, "is_output": true, "parameter_id": 0, "assembly_class": "RecruitmentCLR", "assembly_method": "GenerateSecureToken" },
    { "FunctionName": "GeocodeAddress", "ParameterName": "", "TypeName": "nvarchar", "max_length": -1, "precision": 0, "scale": 0, "is_output": true, "parameter_id": 0, "assembly_class": "ApiIntegration", "assembly_method": "GeocodeAddress" },
    { "FunctionName": "GeocodeAddress", "ParameterName": "@address", "TypeName": "nvarchar", "max_length": 1000, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "GeocodeAddress", "ParameterName": "@apiKey", "TypeName": "nvarchar", "max_length": 200, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 2 },
    { "FunctionName": "GetRelativeTime", "ParameterName": "", "TypeName": "nvarchar", "max_length": 200, "precision": 0, "scale": 0, "is_output": true, "parameter_id": 0, "assembly_class": "RecruitmentCLR", "assembly_method": "GetRelativeTime" },
    { "FunctionName": "GetRelativeTime", "ParameterName": "@dt", "TypeName": "datetime", "max_length": 8, "precision": 23, "scale": 3, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "GetTimezoneOffset", "ParameterName": "", "TypeName": "nvarchar", "max_length": 20, "precision": 0, "scale": 0, "is_output": true, "parameter_id": 0, "assembly_class": "TimezoneFunctions", "assembly_method": "GetTimezoneOffset" },
    { "FunctionName": "GetTimezoneOffset", "ParameterName": "@timezoneName", "TypeName": "nvarchar", "max_length": 100, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "HashPassword", "ParameterName": "", "TypeName": "nvarchar", "max_length": 1000, "precision": 0, "scale": 0, "is_output": true, "parameter_id": 0, "assembly_class": "RecruitmentCLR", "assembly_method": "HashPassword" },
    { "FunctionName": "HashPassword", "ParameterName": "@password", "TypeName": "nvarchar", "max_length": 510, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "IsDisposableEmail", "ParameterName": "", "TypeName": "bit", "max_length": 1, "precision": 1, "scale": 0, "is_output": true, "parameter_id": 0, "assembly_class": "RecruitmentCLR", "assembly_method": "IsDisposableEmail" },
    { "FunctionName": "IsDisposableEmail", "ParameterName": "@email", "TypeName": "nvarchar", "max_length": 200, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "IsWithinWorkingHours", "ParameterName": "", "TypeName": "bit", "max_length": 1, "precision": 1, "scale": 0, "is_output": true, "parameter_id": 0, "assembly_class": "RecruitmentCLR", "assembly_method": "IsWithinWorkingHours" },
    { "FunctionName": "IsWithinWorkingHours", "ParameterName": "@dt", "TypeName": "datetime", "max_length": 8, "precision": 23, "scale": 3, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "JaroWinklerSimilarity", "ParameterName": "", "TypeName": "float", "max_length": 8, "precision": 53, "scale": 0, "is_output": true, "parameter_id": 0, "assembly_class": "RecruitmentCLR", "assembly_method": "JaroWinklerSimilarity" },
    { "FunctionName": "JaroWinklerSimilarity", "ParameterName": "@a", "TypeName": "nvarchar", "max_length": -1, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "JaroWinklerSimilarity", "ParameterName": "@b", "TypeName": "nvarchar", "max_length": -1, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 2 },
    { "FunctionName": "LevenshteinDistance", "ParameterName": "", "TypeName": "int", "max_length": 4, "precision": 10, "scale": 0, "is_output": true, "parameter_id": 0, "assembly_class": "RecruitmentCLR", "assembly_method": "LevenshteinDistance" },
    { "FunctionName": "LevenshteinDistance", "ParameterName": "@a", "TypeName": "nvarchar", "max_length": -1, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "LevenshteinDistance", "ParameterName": "@b", "TypeName": "nvarchar", "max_length": -1, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 2 },
    { "FunctionName": "Percentile", "ParameterName": "", "TypeName": "float", "max_length": 8, "precision": 53, "scale": 0, "is_output": true, "parameter_id": 0, "assembly_class": "RecruitmentCLR", "assembly_method": "Percentile" },
    { "FunctionName": "Percentile", "ParameterName": "@values", "TypeName": "nvarchar", "max_length": -1, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "Percentile", "ParameterName": "@p", "TypeName": "float", "max_length": 8, "precision": 53, "scale": 0, "is_output": false, "parameter_id": 2 },
    { "FunctionName": "StandardDeviation", "ParameterName": "", "TypeName": "float", "max_length": 8, "precision": 53, "scale": 0, "is_output": true, "parameter_id": 0, "assembly_class": "RecruitmentCLR", "assembly_method": "StandardDeviation" },
    { "FunctionName": "StandardDeviation", "ParameterName": "@values", "TypeName": "nvarchar", "max_length": -1, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "ValidateEmail", "ParameterName": "", "TypeName": "bit", "max_length": 1, "precision": 1, "scale": 0, "is_output": true, "parameter_id": 0, "assembly_class": "RecruitmentCLR", "assembly_method": "ValidateEmail" },
    { "FunctionName": "ValidateEmail", "ParameterName": "@email", "TypeName": "nvarchar", "max_length": 200, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "VerifyLinkedInProfile", "ParameterName": "", "TypeName": "nvarchar", "max_length": -1, "precision": 0, "scale": 0, "is_output": true, "parameter_id": 0, "assembly_class": "ApiIntegration", "assembly_method": "VerifyLinkedInProfile" },
    { "FunctionName": "VerifyLinkedInProfile", "ParameterName": "@profileUrl", "TypeName": "nvarchar", "max_length": 1000, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "VerifyLinkedInProfile", "ParameterName": "@accessToken", "TypeName": "nvarchar", "max_length": 1000, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 2 },
    { "FunctionName": "VerifyPassword", "ParameterName": "", "TypeName": "bit", "max_length": 1, "precision": 1, "scale": 0, "is_output": true, "parameter_id": 0, "assembly_class": "RecruitmentCLR", "assembly_method": "VerifyPassword" },
    { "FunctionName": "VerifyPassword", "ParameterName": "@password", "TypeName": "nvarchar", "max_length": 510, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "VerifyPassword", "ParameterName": "@hashedPassword", "TypeName": "nvarchar", "max_length": 1000, "precision": 0, "scale": 0, "is_output": false, "parameter_id": 2 },
    { "FunctionName": "ZScore", "ParameterName": "", "TypeName": "float", "max_length": 8, "precision": 53, "scale": 0, "is_output": true, "parameter_id": 0, "assembly_class": "RecruitmentCLR", "assembly_method": "ZScore" },
    { "FunctionName": "ZScore", "ParameterName": "@value", "TypeName": "float", "max_length": 8, "precision": 53, "scale": 0, "is_output": false, "parameter_id": 1 },
    { "FunctionName": "ZScore", "ParameterName": "@mean", "TypeName": "float", "max_length": 8, "precision": 53, "scale": 0, "is_output": false, "parameter_id": 2 },
    { "FunctionName": "ZScore", "ParameterName": "@stdDev", "TypeName": "float", "max_length": 8, "precision": 53, "scale": 0, "is_output": false, "parameter_id": 3 }
];

function formatSqlType(p) {
    let type = p.TypeName.toUpperCase();
    if (type === 'NVARCHAR' || type === 'VARBINARY') {
        if (p.max_length === -1) type += '(MAX)';
        else type += `(${p.max_length / 2})`; // max_length is bytes
    }
    return type;
}

const grouped = {};
params.forEach(p => {
    if (!grouped[p.FunctionName]) grouped[p.FunctionName] = { params: [], return: null, assembly_class: null, assembly_method: null };
    if (p.parameter_id === 0) {
        grouped[p.FunctionName].return = formatSqlType(p);
        grouped[p.FunctionName].assembly_class = p.assembly_class;
        grouped[p.FunctionName].assembly_method = p.assembly_method;
    } else {
        grouped[p.FunctionName].params.push(`${p.ParameterName} ${formatSqlType(p)}`);
    }
});

let sql = '';
Object.keys(grouped).sort().forEach(name => {
    const f = grouped[name];
    sql += `CREATE FUNCTION [dbo].[${name}] (${f.params.join(', ')}) RETURNS ${f.return} AS EXTERNAL NAME [RecruitmentCLR].[${f.assembly_class}].[${f.assembly_method}];\nGO\n`;
});

fs.writeFileSync('clr_functions.sql', sql);
console.log('Saved CLR functions to clr_functions.sql');
