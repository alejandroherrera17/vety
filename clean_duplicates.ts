import { prisma } from './lib/prisma';

async function main() {
  const clients = await prisma.client.findMany();
  const emails = new Set();
  
  for (const client of clients) {
    if (client.email) {
      if (emails.has(client.email)) {
        await prisma.client.delete({ where: { id: client.id } });
        console.log(`Deleted duplicate client with email ${client.email}`);
      } else {
        emails.add(client.email);
      }
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    console.log("Done");
  });
