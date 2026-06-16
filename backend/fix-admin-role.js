const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // Find the admin user
  const users = await p.user.findMany({
    where: { email: { contains: 'lakmi' } },
    select: { id: true, email: true, role: true }
  });
  console.log('Found users:', JSON.stringify(users, null, 2));

  if (users.length > 0) {
    const result = await p.user.updateMany({
      where: { email: { contains: 'lakmi' } },
      data: { role: 'ADMIN' }
    });
    console.log('Restored ADMIN role for', result.count, 'user(s)');
  } else {
    console.log('No matching user found');
  }
}

main()
  .then(() => p.$disconnect())
  .catch(e => { console.error(e); p.$disconnect(); process.exit(1); });
