CREATE FUNCTION [dbo].[AddBusinessDays] (@startDate DATETIME, @daysToAdd INT) RETURNS DATETIME AS EXTERNAL NAME [RecruitmentCLR].[RecruitmentCLR].[AddBusinessDays];
GO
CREATE FUNCTION [dbo].[CalculateBusinessDays] (@startDate DATETIME, @endDate DATETIME) RETURNS INT AS EXTERNAL NAME [RecruitmentCLR].[RecruitmentCLR].[CalculateBusinessDays];
GO
CREATE FUNCTION [dbo].[CalculateSentiment] (@text NVARCHAR(MAX)) RETURNS FLOAT AS EXTERNAL NAME [RecruitmentCLR].[NLPProcessor].[CalculateSentiment];
GO
CREATE FUNCTION [dbo].[CalculateTimezoneOverlap] (@tz1 NVARCHAR(50), @tz2 NVARCHAR(50)) RETURNS INT AS EXTERNAL NAME [RecruitmentCLR].[TimezoneFunctions].[CalculateTimezoneOverlap];
GO
CREATE FUNCTION [dbo].[CallRESTApi] (@url NVARCHAR(MAX), @method NVARCHAR(10), @body NVARCHAR(MAX)) RETURNS NVARCHAR(MAX) AS EXTERNAL NAME [RecruitmentCLR].[ApiIntegration].[CallRESTApi];
GO
CREATE FUNCTION [dbo].[ConvertTimezone] (@dt DATETIME, @fromTz NVARCHAR(50), @toTz NVARCHAR(50)) RETURNS DATETIME AS EXTERNAL NAME [RecruitmentCLR].[TimezoneFunctions].[ConvertTimezone];
GO
CREATE FUNCTION [dbo].[CorrelationCoefficient] (@vals1 NVARCHAR(MAX), @vals2 NVARCHAR(MAX)) RETURNS FLOAT AS EXTERNAL NAME [RecruitmentCLR].[RecruitmentCLR].[CorrelationCoefficient];
GO
CREATE FUNCTION [dbo].[CosineSimilarity] (@a NVARCHAR(MAX), @b NVARCHAR(MAX)) RETURNS FLOAT AS EXTERNAL NAME [RecruitmentCLR].[RecruitmentCLR].[CosineSimilarity];
GO
CREATE FUNCTION [dbo].[EncryptSensitiveData] (@text NVARCHAR(MAX)) RETURNS NVARCHAR(MAX) AS EXTERNAL NAME [RecruitmentCLR].[RecruitmentCLR].[EncryptSensitiveData];
GO
CREATE FUNCTION [dbo].[ExtractEmailDomain] (@email NVARCHAR(100)) RETURNS NVARCHAR(100) AS EXTERNAL NAME [RecruitmentCLR].[RecruitmentCLR].[ExtractEmailDomain];
GO
CREATE FUNCTION [dbo].[ExtractSkills] (@resumeText NVARCHAR(MAX)) RETURNS NVARCHAR(MAX) AS EXTERNAL NAME [RecruitmentCLR].[NLPProcessor].[ExtractSkills];
GO
CREATE FUNCTION [dbo].[ExtractTextFromDocx] (@docxBytes VARBINARY(MAX)) RETURNS NVARCHAR(MAX) AS EXTERNAL NAME [RecruitmentCLR].[DocumentParser].[ExtractTextFromDocx];
GO
CREATE FUNCTION [dbo].[ExtractTextFromPDF] (@pdfBytes VARBINARY(MAX)) RETURNS NVARCHAR(MAX) AS EXTERNAL NAME [RecruitmentCLR].[DocumentParser].[ExtractTextFromPDF];
GO
CREATE FUNCTION [dbo].[ExtractYearsOfExperience] (@resumeText NVARCHAR(MAX)) RETURNS INT AS EXTERNAL NAME [RecruitmentCLR].[DocumentParser].[ExtractYearsOfExperience];
GO
CREATE FUNCTION [dbo].[GenerateSecureToken] () RETURNS NVARCHAR(256) AS EXTERNAL NAME [RecruitmentCLR].[RecruitmentCLR].[GenerateSecureToken];
GO
CREATE FUNCTION [dbo].[GeocodeAddress] (@address NVARCHAR(500), @apiKey NVARCHAR(100)) RETURNS NVARCHAR(MAX) AS EXTERNAL NAME [RecruitmentCLR].[ApiIntegration].[GeocodeAddress];
GO
CREATE FUNCTION [dbo].[GetRelativeTime] (@dt DATETIME) RETURNS NVARCHAR(100) AS EXTERNAL NAME [RecruitmentCLR].[RecruitmentCLR].[GetRelativeTime];
GO
CREATE FUNCTION [dbo].[GetTimezoneOffset] (@timezoneName NVARCHAR(50)) RETURNS NVARCHAR(10) AS EXTERNAL NAME [RecruitmentCLR].[TimezoneFunctions].[GetTimezoneOffset];
GO
CREATE FUNCTION [dbo].[HashPassword] (@password NVARCHAR(255)) RETURNS NVARCHAR(500) AS EXTERNAL NAME [RecruitmentCLR].[RecruitmentCLR].[HashPassword];
GO
CREATE FUNCTION [dbo].[IsDisposableEmail] (@email NVARCHAR(100)) RETURNS BIT AS EXTERNAL NAME [RecruitmentCLR].[RecruitmentCLR].[IsDisposableEmail];
GO
CREATE FUNCTION [dbo].[IsWithinWorkingHours] (@dt DATETIME) RETURNS BIT AS EXTERNAL NAME [RecruitmentCLR].[RecruitmentCLR].[IsWithinWorkingHours];
GO
CREATE FUNCTION [dbo].[JaroWinklerSimilarity] (@a NVARCHAR(MAX), @b NVARCHAR(MAX)) RETURNS FLOAT AS EXTERNAL NAME [RecruitmentCLR].[RecruitmentCLR].[JaroWinklerSimilarity];
GO
CREATE FUNCTION [dbo].[LevenshteinDistance] (@a NVARCHAR(MAX), @b NVARCHAR(MAX)) RETURNS INT AS EXTERNAL NAME [RecruitmentCLR].[RecruitmentCLR].[LevenshteinDistance];
GO
CREATE FUNCTION [dbo].[Percentile] (@values NVARCHAR(MAX), @p FLOAT) RETURNS FLOAT AS EXTERNAL NAME [RecruitmentCLR].[RecruitmentCLR].[Percentile];
GO
CREATE FUNCTION [dbo].[StandardDeviation] (@values NVARCHAR(MAX)) RETURNS FLOAT AS EXTERNAL NAME [RecruitmentCLR].[RecruitmentCLR].[StandardDeviation];
GO
CREATE FUNCTION [dbo].[ValidateEmail] (@email NVARCHAR(100)) RETURNS BIT AS EXTERNAL NAME [RecruitmentCLR].[RecruitmentCLR].[ValidateEmail];
GO
CREATE FUNCTION [dbo].[VerifyLinkedInProfile] (@profileUrl NVARCHAR(500), @accessToken NVARCHAR(500)) RETURNS NVARCHAR(MAX) AS EXTERNAL NAME [RecruitmentCLR].[ApiIntegration].[VerifyLinkedInProfile];
GO
CREATE FUNCTION [dbo].[VerifyPassword] (@password NVARCHAR(255), @hashedPassword NVARCHAR(500)) RETURNS BIT AS EXTERNAL NAME [RecruitmentCLR].[RecruitmentCLR].[VerifyPassword];
GO
CREATE FUNCTION [dbo].[ZScore] (@value FLOAT, @mean FLOAT, @stdDev FLOAT) RETURNS FLOAT AS EXTERNAL NAME [RecruitmentCLR].[RecruitmentCLR].[ZScore];
GO
