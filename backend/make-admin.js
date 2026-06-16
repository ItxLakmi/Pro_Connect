const { Client } = require('pg');

const email = process.argv[2];

if (!email) {
  console.error("Please provide an email address.");
  console.error("Usage: node make-admin.js <user-email>");
  process.exit(1);
}

const client = new Client({
  connectionString: 'postgresql://postgres.uloqxjotrgahqjwzybpq:itxlakmi123@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
});

async function updateAdmin() {
  try {
    await client.connect();
    // Using parameterized query to prevent SQL injection and specify the exact user
    const res = await client.query("UPDATE \"User\" SET role = 'ADMIN' WHERE email = $1 RETURNING email, role", [email]);
    
    if (res.rows.length === 0) {
      console.log(`No user found with email: ${email}`);
    } else {
      console.log(`\nSuccess! Updated ${email} to ADMIN role.`);
      console.log(res.rows[0]);
    }
  } catch (err) {
    console.error("Error updating admin:", err);
  } finally {
    await client.end();
  }
}

updateAdmin();
