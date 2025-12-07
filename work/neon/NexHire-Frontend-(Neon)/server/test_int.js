const { query } = require('./db');
async function test() {
    try {
        console.log('--- Fetching CLR Function Parameters ---');
        const params = await query(`
            SELECT 
                o.name as FunctionName,
                p.name as ParameterName,
                t.name as TypeName,
                p.max_length,
                p.precision,
                p.scale,
                p.is_output,
                p.parameter_id,
                am.assembly_class,
                am.assembly_method
            FROM sys.objects o
            JOIN sys.assembly_modules am ON o.object_id = am.object_id
            LEFT JOIN sys.parameters p ON o.object_id = p.object_id
            JOIN sys.types t ON p.user_type_id = t.user_type_id
            WHERE o.type = 'FS'
            ORDER BY o.name, p.parameter_id
        `);

        console.log(JSON.stringify(params, null, 2));

        console.log('\n--- Fetching Return Types ---');
        // For scalar functions, the parameter with parameter_id = 0 is the return value
        const returns = await query(`
            SELECT 
                o.name as FunctionName,
                t.name as ReturnTypeName,
                p.max_length,
                p.precision,
                p.scale
            FROM sys.objects o
            JOIN sys.parameters p ON o.object_id = p.object_id
            JOIN sys.types t ON p.user_type_id = t.user_type_id
            WHERE o.type = 'FS' AND p.parameter_id = 0
            ORDER BY o.name
        `);
        console.log(JSON.stringify(returns, null, 2));

    } catch (err) {
        console.error('SQL Error:', err.message);
    }
    process.exit();
}
test();
