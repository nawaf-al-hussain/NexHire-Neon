CREATE PROCEDURE sp_AwardGamificationPoints
    @CandidateID INT,
    @ActionType VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    
    BEGIN TRANSACTION;
    
    DECLARE @PointsToAdd INT;
    DECLARE @BadgeEligible VARCHAR(100);
    DECLARE @CanAward BIT = 1;
    
    SELECT @PointsToAdd = PointsAwarded, @BadgeEligible = BadgeEligible
    FROM GamificationActions
    WHERE ActionType = @ActionType AND IsActive = 1;
    
    IF @PointsToAdd IS NULL
    BEGIN
        ROLLBACK;
        RAISERROR('Invalid action type or action is not active.', 16, 1);
        RETURN;
    END
    
    DECLARE @MaxDaily INT;
    SELECT @MaxDaily = MaxDaily FROM GamificationActions WHERE ActionType = @ActionType;
    
    IF @MaxDaily IS NOT NULL
    BEGIN
        SET @CanAward = 1;
    END
    
    IF @CanAward = 1
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM CandidateGamification WHERE CandidateID = @CandidateID)
        BEGIN
            INSERT INTO CandidateGamification (CandidateID)
            VALUES (@CandidateID);
        END
        
        UPDATE CandidateGamification
        SET 
            Points = Points + @PointsToAdd,
            Level = CASE 
                WHEN Points + @PointsToAdd >= 1000 THEN 5
                WHEN Points + @PointsToAdd >= 500 THEN 4
                WHEN Points + @PointsToAdd >= 250 THEN 3
                WHEN Points + @PointsToAdd >= 100 THEN 2
                ELSE 1
            END,
            LastActivityDate = GETDATE(),
            UpdatedAt = GETDATE(),
            StreakDays = CASE 
                WHEN DATEDIFF(DAY, LastActivityDate, GETDATE()) <= 1 THEN StreakDays + 1
                ELSE 1
            END
        WHERE CandidateID = @CandidateID;
        
        IF @BadgeEligible IS NOT NULL
        BEGIN
            UPDATE CandidateGamification
            SET Badges = JSON_MODIFY(
                CASE WHEN Badges IS NULL OR Badges = '[]' THEN '[]' ELSE Badges END,
                'append $',
                @BadgeEligible
            )
            WHERE CandidateID = @CandidateID
              AND NOT EXISTS (
                SELECT 1 
                FROM OPENJSON(Badges) 
                WHERE value = @BadgeEligible
              );
        END
        
        UPDATE CandidateGamification
        SET EngagementScore = 
            CASE 
                WHEN Points >= 500 THEN 90
                WHEN Points >= 250 THEN 80
                WHEN Points >= 100 THEN 70
                WHEN Points >= 50 THEN 60
                ELSE 50
            END
        WHERE CandidateID = @CandidateID;
    END
    
    COMMIT;
    
    SELECT 
        Points,
        Level,
        StreakDays,
        EngagementScore,
        Badges,
        @PointsToAdd AS PointsAwarded,
        @BadgeEligible AS BadgeAwarded
    FROM CandidateGamification
    WHERE CandidateID = @CandidateID;
END