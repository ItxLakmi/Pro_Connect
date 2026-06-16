const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.uloqxjotrgahqjwzybpq:itxlakmi123@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
});
async function listUsers() {
  await client.connect();
  const res = await client.query("SELECT id, email, \"firstName\", role FROM \"User\"");
  console.table(res.rows);
  await client.end();
}
listUsers().catch(console.error);
