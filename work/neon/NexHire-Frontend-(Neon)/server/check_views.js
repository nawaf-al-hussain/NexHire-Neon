const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DB_CONNECTION_STRING
});

async function checkViews() {
    const client = await pool.connect();
    try {
        // Check vw_bias_location
        console.log('=== vw_bias_location ===');
        try {
            const result = await client.query('SELECT * FROM vw_bias_location');
            console.log('Rows:', JSON.stringify(result.rows));
        } catch (e) {
            console.log('Error:', e.message);
        }

        // Check vw_bias_experience
        console.log('\n=== vw_bias_experience ===');
        try {
            const result = await client.query('SELECT * FROM vw_bias_experience');
            console.log('Rows:', JSON.stringify(result.rows));
        } catch (e) {
            console.log('Error:', e.message);
        }

        // Check vw_recruiterperformance
        console.log('\n=== vw_recruiterperformance ===');
        try {
            const result = await client.query('SELECT * FROM vw_recruiterperformance');
            console.log('Rows:', JSON.stringify(result.rows));
        } catch (e) {
            console.log('Error:', e.message);
        }

        // Check vw_timetohire
        console.log('\n=== vw_timetohire ===');
        try {
            const result = await client.query('SELECT * FROM vw_timetohire');
            console.log('Rows:', JSON.stringify(result.rows));
        } catch (e) {
            console.log('Error:', e.message);
        }

        // Check vw_applicationfunnel
        console.log('\n=== vw_applicationfunnel ===');
        try {
            const result = await client.query('SELECT * FROM vw_applicationfunnel');
            console.log('Rows:', JSON.stringify(result.rows));
        } catch (e) {
            console.log('Error:', e.message);
        }

    } finally {
        client.release();
        await pool.end();
    }
}

checkViews().catch(console.error);
