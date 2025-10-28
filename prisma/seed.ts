import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(){
    console.log('start seeding. . .');
    
    //Employees
    const emp1 = await prisma.employee.create({
        data: {
            name: 'Alice'
        }
    });
    const emp2 = await prisma.employee.create({
        data: {
            name: 'Bob'
        }
    });
    const emp3 = await prisma.employee.create({
        data: {
            name: 'Charlie'
        }
    });
    const emp4 = await prisma.employee.create({
        data: {
            name: 'John'
        }
    });

    //Payment
    const payment1 =  await prisma.paymentMethod.create({
        data: {
            method: 'Credit Card'  
        }
    });
    const payment2 =  await prisma.paymentMethod.create({
        data: {
            method: 'Mobile Banking'  
        }
    });
    const payment3 =  await prisma.paymentMethod.create({
        data: {
            method: 'Cash on Delivery'  
        }
    });

    //Category
    const defaultCatergory = await prisma.category.create({
        data:{
            name: 'Default Category'
        }
    });
    console.log('Created category:', defaultCatergory);
    //stock
    const product1 = await prisma.product.create({
        data: {
            productName: 'Sample Product 1',
            price: 199,
            description: 'A sample product for testing',
            categoryId: defaultCatergory.id, // connect to category 
            stock:{
                create:{
                    quantity: 100
                }
            }
        }
    });

    console.log('Created product:', product1);
    
    console.log('Seeding finished.');
    console.log('Created employees:', emp1, emp2, emp3, emp4);
    console.log('Created payment methods:', payment1, payment2, payment3);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
