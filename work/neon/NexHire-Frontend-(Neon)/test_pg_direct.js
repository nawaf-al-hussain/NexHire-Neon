const { Pool } = require('pg');

async function testMatch() {
    const pool = new Pool({
        connectionString: process.env.DB_CONNECTION_STRING,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Testing sp_advancedcandidatematchingenhanced(25, 10)...');
        const res = await pool.query('SELECT * FROM sp_advancedcandidatematchingenhanced($1, $2)', [25, 10]);
        console.log('Success! Rows returned:', res.rows.length);
        if (res.rows.length > 0) {
            console.log('First row keys:', Object.keys(res.rows[0]));
        }
    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        await pool.end();
    }
}

testMatch();
