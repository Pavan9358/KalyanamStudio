const https = require('https');

const options = {
  hostname: 'ptpiwlcjuxahcddeotpk.supabase.co',
  port: 443,
  path: '/rest/v1/',
  method: 'GET',
  headers: {
    'apikey': 'sb_publishable_KgOKHBaeH-PDrL8uIxe53A_NkLPV9s1',
    'Authorization': 'Bearer sb_publishable_KgOKHBaeH-PDrL8uIxe53A_NkLPV9s1'
  }
};

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
});

req.on('error', (e) => {
  console.error(e);
});

req.end();
