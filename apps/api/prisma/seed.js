"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding start...');
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: { email: 'admin@example.com', password: 'admin123', role: client_1.Role.ADMIN },
    });
    const user = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: { email: 'user@example.com', password: 'user123', role: client_1.Role.USER },
    });
    console.log('Users:', { admin: admin.email, user: user.email });

    const venue = await prisma.venue.create({
        data: {
            name: 'Bangkok Arena',
            address: 'Bangkok, Thailand',
            sections: {
                create: [
                    { name: 'VIP' },
                    { name: 'A' },
                    { name: 'B' },
                ],
            },
        },
        include: { sections: true },
    });
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
    const seats = await prisma.seat.findMany({ where: { section: { venueId: venue.id } } });
    console.log(`Seats created: ${seats.length}`);
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
        prisma.priceTier.create({ data: { showId: show.id, name: 'VIP', price: 3500 } }),
        prisma.priceTier.create({ data: { showId: show.id, name: 'A', price: 2500 } }),
        prisma.priceTier.create({ data: { showId: show.id, name: 'B', price: 1500 } }),
    ]);

    const sections = await prisma.section.findMany({ where: { venueId: venue.id } });
    const sectionMap = new Map(sections.map((s) => [s.name, s.id]));
    const priceBySectionId = new Map([
        [sectionMap.get('VIP'), vip.id],
        [sectionMap.get('A'), a.id],
        [sectionMap.get('B'), b.id],
    ]);
    const seatsBySection = await prisma.seat.findMany({ where: { section: { venueId: venue.id } } });

    const chunkSize = 300;
    for (let i = 0; i < seatsBySection.length; i += chunkSize) {
        const chunk = seatsBySection.slice(i, i + chunkSize);
        await prisma.seatInventory.createMany({
            data: chunk.map((s) => ({
                showId: show.id,
                seatId: s.id,
                status: client_1.SeatStatus.AVAILABLE,
                priceTierId: priceBySectionId.get(s.sectionId), 
            })),
            skipDuplicates: true,
        });
    }
    const invCount = await prisma.seatInventory.count({ where: { showId: show.id } });
    console.log(`SeatInventory created: ${invCount}`);
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