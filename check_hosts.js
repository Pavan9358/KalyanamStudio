const dns = require('dns');

const refs = ['ptpiwlcjuxahcddeotpk'];
const formats = [
  'db.%s.supabase.co',
  'db.%s.supabase.com',
  '%s.supabase.co',
  'aws-0-ap-south-1.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-eu-central-1.pooler.supabase.com'
];

async function check() {
  for (const ref of refs) {
    for (const format of formats) {
      const host = format.includes('%s') ? format.replace('%s', ref) : format;
      try {
        const addr = await new Promise((resolve, reject) => {
          dns.lookup(host, (err, address) => {
            if (err) reject(err);
            else resolve(address);
          });
        });
        console.log(`FOUND: ${host} -> ${addr}`);
      } catch (err) {
        // console.log(`FAIL: ${host}`);
      }
    }
  }
}

check();
