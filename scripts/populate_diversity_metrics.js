/**
 * Populate the DiversityMetrics table with realistic demographic data
 * for all existing applications.
 *
 * The table was empty, causing the Gender / Disability / Veteran charts
 * on the Diversity Goals page to show "No demographic data seeded".
 *
 * This script:
 *  1. Fetches all application IDs from the database
 *  2. Generates realistic, diverse demographic data for each application
 *  3. Inserts the rows into diversitymetrics
 *
 * Run with: node scripts/populate_diversity_metrics.js
 */

const { Pool } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DB_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
});

// Realistic demographic distributions (based on typical tech industry demographics)
const GENDERS = [
    { value: 'Male', weight: 55 },
    { value: 'Female', weight: 40 },
    { value: 'Non-Binary', weight: 3 },
    { value: 'Prefer not to say', weight: 2 },
];

const ETHNICITIES = [
    { value: 'Asian', weight: 35 },
    { value: 'White', weight: 30 },
    { value: 'Black or African American', weight: 12 },
    { value: 'Hispanic or Latino', weight: 15 },
    { value: 'Middle Eastern', weight: 4 },
    { value: 'Two or More Races', weight: 3 },
    { value: 'Prefer not to say', weight: 1 },
];

const EDUCATION_LEVELS = [
    { value: 'High School', weight: 10 },
    { value: 'Associate Degree', weight: 15 },
    { value: 'Bachelor Degree', weight: 45 },
    { value: 'Master Degree', weight: 20 },
    { value: 'PhD', weight: 5 },
    { value: 'Bootcamp', weight: 5 },
];

// Simple weighted random picker
function pick(items) {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    for (const item of items) {
        random -= item.weight;
        if (random <= 0) return item.value;
    }
    return items[0].value;
}

// Boolean with probability
function maybe(probability) {
    return Math.random() < probability;
}

async function populateDiversityMetrics() {
    const client = await pool.connect();

    try {
        // 1. Check if diversitymetrics already has data
        const existing = await client.query('SELECT COUNT(*) AS count FROM diversitymetrics');
        const existingCount = parseInt(existing.rows[0].count);
        if (existingCount > 0) {
            console.log(`diversitymetrics already has ${existingCount} rows. Clearing existing data...`);
            await client.query('DELETE FROM diversitymetrics');
            console.log('Cleared.');
        }

        // 2. Fetch all application IDs
        const appsResult = await client.query(`
            SELECT a.applicationid, a.candidateid
            FROM applications a
            WHERE a.isdeleted = false
            ORDER BY a.applicationid
        `);
        const applications = appsResult.rows;
        console.log(`Found ${applications.length} applications to populate.`);

        if (applications.length === 0) {
            console.log('No applications found. Nothing to populate.');
            return;
        }

        // 3. Generate and insert demographic data for each application
        let inserted = 0;
        const batchSize = 25;

        for (let i = 0; i < applications.length; i += batchSize) {
            const batch = applications.slice(i, i + batchSize);
            const values = [];
            const params = [];
            let paramIndex = 1;

            for (const app of batch) {
                const gender = pick(GENDERS);
                const ethnicity = pick(ETHNICITIES);
                const educationLevel = pick(EDUCATION_LEVELS);
                const disabilityStatus = maybe(0.08);  // ~8% have a disability
                const veteranStatus = maybe(0.05);      // ~5% are veterans
                const firstGenCollege = maybe(0.30);    // ~30% are first-gen college
                const lgbtqPlus = maybe(0.12);           // ~12% are LGBTQ+
                const careerGapMonths = maybe(0.25) ? Math.floor(Math.random() * 24) : 0;  // 25% have a gap, 0-23 months
                const nonTraditionalBackground = maybe(0.15);  // ~15% non-traditional
                const anonymizedHash = crypto.createHash('sha256').update(`app-${app.applicationid}-${Date.now()}-${Math.random()}`).digest('hex');

                values.push(
                    `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5}, $${paramIndex + 6}, $${paramIndex + 7}, $${paramIndex + 8}, $${paramIndex + 9}, $${paramIndex + 10}, $${paramIndex + 11})`
                );
                params.push(
                    app.applicationid,
                    gender,
                    ethnicity,
                    disabilityStatus,
                    veteranStatus,
                    firstGenCollege,
                    lgbtqPlus,
                    careerGapMonths,
                    nonTraditionalBackground,
                    educationLevel,
                    anonymizedHash
                );
                paramIndex += 12;
            }

            const insertQuery = `
                INSERT INTO diversitymetrics
                    (applicationid, gender, ethnicity, disabilitystatus, veteranstatus,
                     firstgenerationcollege, lgbtqplus, careergapmonths, nontraditionalbackground,
                     educationlevel, anonymizedhash)
                VALUES ${values.join(', ')}
                ON CONFLICT DO NOTHING
            `;

            await client.query(insertQuery, params);
            inserted += batch.length;
            console.log(`  Inserted ${inserted}/${applications.length}...`);
        }

        // 4. Verify the insert
        const verify = await client.query(`
            SELECT
                COUNT(*) AS total,
                COUNT(CASE WHEN gender IS NOT NULL THEN 1 END) AS with_gender,
                COUNT(CASE WHEN ethnicity IS NOT NULL THEN 1 END) AS with_ethnicity,
                COUNT(CASE WHEN disabilitystatus = true THEN 1 END) AS with_disability,
                COUNT(CASE WHEN veteranstatus = true THEN 1 END) AS veterans,
                COUNT(CASE WHEN lgbtqplus = true THEN 1 END) AS lgbtq,
                COUNT(CASE WHEN firstgenerationcollege = true THEN 1 END) AS first_gen
            FROM diversitymetrics
        `);

        const stats = verify.rows[0];
        console.log('\n=== Diversity Metrics Populated ===');
        console.log(`Total rows: ${stats.total}`);
        console.log(`With gender: ${stats.with_gender}`);
        console.log(`With ethnicity: ${stats.with_ethnicity}`);
        console.log(`With disability: ${stats.with_disability}`);
        console.log(`Veterans: ${stats.veterans}`);
        console.log(`LGBTQ+: ${stats.lgbtq}`);
        console.log(`First-gen college: ${stats.first_gen}`);

        // 5. Print breakdown by gender
        const genderBreakdown = await client.query(`
            SELECT COALESCE(gender, 'Not Disclosed') AS gender, COUNT(*) AS count
            FROM diversitymetrics
            GROUP BY gender
            ORDER BY count DESC
        `);
        console.log('\n=== Gender Breakdown ===');
        for (const row of genderBreakdown.rows) {
            console.log(`  ${row.gender}: ${row.count}`);
        }

        // 6. Print breakdown by ethnicity
        const ethnicityBreakdown = await client.query(`
            SELECT COALESCE(ethnicity, 'Not Disclosed') AS ethnicity, COUNT(*) AS count
            FROM diversitymetrics
            GROUP BY ethnicity
            ORDER BY count DESC
        `);
        console.log('\n=== Ethnicity Breakdown ===');
        for (const row of ethnicityBreakdown.rows) {
            console.log(`  ${row.ethnicity}: ${row.count}`);
        }

        console.log('\n✅ Diversity metrics populated successfully.');

    } catch (err) {
        console.error('❌ Error populating diversity metrics:', err.message);
        console.error(err.stack);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

populateDiversityMetrics();
