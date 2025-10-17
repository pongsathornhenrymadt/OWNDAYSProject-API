import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(){
    console.log('start seeding. . .');
    
    await prisma.employee.createMany({
        data: {
            name: 'Alice'
        }
    });
    await prisma.employee.createMany({
        data: {
            name: 'Bob'
        }
    });
    await prisma.employee.createMany({
        data: {
            name: 'Charlie'
        }
    });
    await prisma.employee.createMany({
        data: {
            name: 'John'
        }
    });

    console.log('Seeding finished.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
