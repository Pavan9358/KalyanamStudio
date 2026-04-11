const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres.ptpiwlcjuxahcddeotpk:Pavan%40935@aws-0-ap-south-1.pooler.supabase.com:5432/postgres';

async function pushSchema() {
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('CONNECTED! Syncing schema...');

    const sqlPath = path.join(__dirname, 'supabase_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Remove comments to reduce issues, though pg handles them
    await client.query(sql);

    console.log('SUCCESS! All tables, indexes, and RLS policies have been pushed to Supabase.');
  } catch (err) {
    console.error('PUSH ERROR:', err.message);
  } finally {
    await client.end();
  }
}

pushSchema();
