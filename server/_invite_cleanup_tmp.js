require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
// Use the admin connection (neondb_owner) so RLS doesn't hide rows.
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

const APPLY = process.argv.includes("--apply");

(async () => {
  const memberPending = await prisma.memberInvitation.findMany({
    where: { status: "PENDING" },
    select: { id: true, email: true, tenantId: true, createdAt: true, expiresAt: true },
    orderBy: { createdAt: "desc" },
  });
  const clientPending = await prisma.clientInvitation.findMany({
    where: { status: "PENDING" },
    select: { id: true, email: true, projectId: true, createdAt: true, expiresAt: true },
    orderBy: { createdAt: "desc" },
  });

  console.log(`\n=== PENDING MEMBER INVITATIONS: ${memberPending.length} ===`);
  memberPending.forEach((r) =>
    console.log(`  ${r.email}  | tenant=${r.tenantId}  | created=${r.createdAt.toISOString().slice(0,16)}  | id=${r.id}`)
  );
  console.log(`\n=== PENDING CLIENT INVITATIONS: ${clientPending.length} ===`);
  clientPending.forEach((r) =>
    console.log(`  ${r.email}  | project=${r.projectId}  | created=${r.createdAt.toISOString().slice(0,16)}  | id=${r.id}`)
  );

  if (!APPLY) {
    console.log(`\n(DRY RUN — nothing deleted. Re-run with --apply to delete the ${memberPending.length + clientPending.length} pending rows above.)`);
  } else {
    const m = await prisma.memberInvitation.deleteMany({ where: { status: "PENDING" } });
    const c = await prisma.clientInvitation.deleteMany({ where: { status: "PENDING" } });
    console.log(`\nDELETED: ${m.count} member + ${c.count} client pending invitations.`);
  }
  await prisma.$disconnect();
})().catch(async (e) => { console.error("ERROR:", e.message); try { await prisma.$disconnect(); } catch {} process.exit(1); });
