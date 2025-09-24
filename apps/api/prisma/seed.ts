/// <reference types="node" />
import { PrismaClient, Role, SeatStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding start...');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: 'admin123',
      role: Role.ADMIN,
    },
  });
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: { email: 'user@example.com', password: 'user123', role: Role.USER },
  });
  console.log('Users:', { admin: admin.email, user: user.email });

  // 2) Venue + Sections + Seats
  const venue = await prisma.venue.create({
    data: {
      name: 'Bangkok Arena',
      address: 'Bangkok, Thailand',
      sections: {
        create: [{ name: 'VIP' }, { name: 'A' }, { name: 'B' }],
      },
    },
    include: { sections: true },
  });

  // สร้างเก้าอี้ต่อ section (เช่น 3 แถว × 10 ที่ = 30 ที่/โซน)
  for (const section of venue.sections) {
    const rows = ['A', 'B', 'C'];
    const numbers = Array.from({ length: 10 }, (_, i) => String(i + 1));
    for (const row of rows) {
      await prisma.seat.createMany({
        data: numbers.map((num) => ({
          sectionId: section.id,
          row,
          number: num,
        })),
        skipDuplicates: true,
      });
    }
  }
  const seats = await prisma.seat.findMany({
    where: { section: { venueId: venue.id } },
  });
  console.log(`Seats created: ${seats.length}`);

  // 3) Event + ShowTime + PriceTier
  const event = await prisma.event.create({
    data: {
      title: 'Awesome Live Concert',
      description: 'One-night-only special performance!',
    },
  });

  const show = await prisma.showTime.create({
    data: {
      eventId: event.id,
      venueId: venue.id,
      startsAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      endsAt: new Date(Date.now() + 7 * 24 * 3600 * 1000 + 2 * 3600 * 1000),
    },
  });

  const [vip, a, b] = await Promise.all([
    prisma.priceTier.create({
      data: { showId: show.id, name: 'VIP', price: 3500 },
    }),
    prisma.priceTier.create({
      data: { showId: show.id, name: 'A', price: 2500 },
    }),
    prisma.priceTier.create({
      data: { showId: show.id, name: 'B', price: 1500 },
    }),
  ]);

  // 4) SeatInventory = map show × seat (+ ใส่ priceTier ตาม section ชื่อ)
  const sections = await prisma.section.findMany({
    where: { venueId: venue.id },
  });
  const sectionMap = new Map(sections.map((s) => [s.name, s.id]));
  const priceBySectionId = new Map<string, string>([
    [sectionMap.get('VIP')!, vip.id],
    [sectionMap.get('A')!, a.id],
    [sectionMap.get('B')!, b.id],
  ]);

  const seatsBySection = await prisma.seat.findMany({
    where: { section: { venueId: venue.id } },
  });

  // ใส่ทีละล็อตเพื่อไม่ยิง bulk ใหญ่เกิน
  const chunkSize = 300;
  for (let i = 0; i < seatsBySection.length; i += chunkSize) {
    const chunk = seatsBySection.slice(i, i + chunkSize);
    await prisma.seatInventory.createMany({
      data: chunk.map((s) => ({
        showId: show.id,
        seatId: s.id,
        status: SeatStatus.AVAILABLE,
        priceTierId: priceBySectionId.get(s.sectionId)!, 
      })),
      skipDuplicates: true,
    });
  }

  const invCount = await prisma.seatInventory.count({
    where: { showId: show.id },
  });
  console.log(`SeatInventory created: ${invCount}`);

  const priorities = ['LOW', 'MEDIUM', 'HIGH'] as const;
  const statuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED'] as const;

  const now = Date.now();
  const ticketsData = Array.from({ length: 50 }, (_, idx) => {
    const i = idx + 1;
    const priority = priorities[idx % priorities.length];
    const status = statuses[idx % statuses.length];

    
    const createdAt = new Date(now - (50 - i) * 60 * 60 * 1000); 
    const updatedAt = new Date(
      createdAt.getTime() + (idx % 6) * 15 * 60 * 1000,
    );

    return {
      title: `Sample Ticket #${i}`,
      description: `Seeded ticket #${i} for testing flows (CRUD + Queue/Redis).`,
      priority: priority as any, 
      status: status as any, 
      createdAt,
      updatedAt,
    };
  });

  await prisma.ticket.createMany({
    data: ticketsData,
    skipDuplicates: true,
  });

  const ticketCount = await prisma.ticket.count();
  console.log(
    `Tickets created: +${ticketsData.length} (total: ${ticketCount})`,
  );

  console.log('Seeding done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
