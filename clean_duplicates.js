const { neonConfig } = require("@neondatabase/serverless");
const { PrismaNeon } = require("@prisma/adapter-neon");
const { PrismaClient } = require("@prisma/client");
const ws = require("ws");
require('dotenv').config();

neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const clients = await prisma.client.findMany();
  const emails = new Set();
  for (const client of clients) {
    if (client.email) {
      if (emails.has(client.email)) {
        await prisma.client.update({
          where: { id: client.id },
          data: { email: `${client.email}-dup-${Math.random()}` }
        });
        console.log(`Updated duplicate client with email ${client.email}`);
      } else {
        emails.add(client.email);
      }
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
