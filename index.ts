import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import express, {type Request,type Response,type NextFunction} from 'express';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import 'dotenv/config';

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;



//middleware
app.use(express.json());

// Authentication routes and middleware
const protect = (req:Request, res:Response, next:NextFunction) => {
    //let token; // Initialize token variable outside the if block
    const authHeader = req.headers.authorization;

    if(authHeader && authHeader.startsWith('Bearer')){
        
        // Get token from header
        const token = authHeader.split(' ')[1];

        // Verify token
        if(token){
            try{
                const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
                req.user = decoded;
                next();
            } catch (error) {
                return res.status(401).json({message: 'Not authorized, token failed'});
            }       
        } else{
            return res.status(401).json({message: 'Not authorized, no token'});
        }
    } else{
        return res.status(401).json({message: 'Not authorized, no token'});
    }

};

// Authentication for admin
const adminProtect = (req:Request, res:Response, next:NextFunction) => {
    //protect middleware
    protect (req, res, async () => {
        const {userId} = req.user as {userId: number}; // get userId from token
        const user = await prisma.user.findUnique({where:{id: userId}});

        //check if user is admin
        if(user && user.role === 'ADMIN'){
            next();
        } else {
            res.status(403).json({message: 'Forbidden: admin access is required'});
        }
    });

};


//post /register
app.post('/register', async(req, res) =>{
    const {email, name, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const newUser = await prisma.user.create({
            data: {email, name, password: hashedPassword}
        });
        const {password, ...userWithoutpassword} = newUser;
        res.status(201).json(userWithoutpassword);
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                res.status(409).json({message: 'Email already exists'});
            } else {
                res.status(500).json({message: 'Something went wrong'});
            }
        }
    }
});


//post endpoint for user login
//post /login
app.post('/login', async (req, res) => {
    const {email, password} = req.body;
    
    // find user by email
    const user = await prisma.user.findUnique({where: {email} });
    if (!user) {
        return res.status(401).json({message: 'User not found'});
    }

    // compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({message: 'Invalid credentials'});
    }

    // if valid, return user token
    const token = jwt.sign(
        {userId: user.id, email: user.email},
        process.env.JWT_SECRET,
        {expiresIn: '1h'}
    );
    res.json({token : token});
});

//get /users
app.get('/users', async (req, res) => {
    const allUsers = await prisma.user.findMany();
    res.json(allUsers);
});

//get /users/:id
app.get('/users/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const user = await prisma.user.findUnique({
        where: {id: id},
    });

    if(!user){
        return res.status(404).json({error: 'User not found'});
    }
    res.json(user);
});


//post /users - create new user
/* app.post('/users', async (req , res ) =>{
    try {
        const {email, name} = req.body;
        const newUser = await prisma.user.create({
            data: {email : email, name: name},
        });
        res.status(201).json(newUser);
    } catch (error) {
        //import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
        if (error instanceof PrismaClientKnownRequestError) {
            // if this error from prisma
            if (error.code === 'P2002') {
                res.status(409).json({ message: 'Email already exists' });
            }
        } else {
            res.status(500).json({ message: 'Something went wrong'})   
        }
    }
});*/

//put /users/:id - update user
app.put('/users/:id', protect, async (req:Request, res:Response) => {

    try{
        const {id}= req.params as {id: string};
        const numericId = parseInt(id);
        const {email, name} = req.body;

        if(isNaN(numericId)){
            return res.status(400).json({message: 'Invalid ID format'});
        }

        //check token user id and param id
        const {userId : idFromToken} = req.user as {userId: number};
        if(idFromToken !== numericId){
            return res.status(403).json({message: 'Forbidden: You can only update your own profile'});
        }

        const updatedUser = await prisma.user.update({
            where: {id: numericId},
            data: {email: email, name: name},
        });
        res.json(updatedUser);
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return res.status(404).json({message: 'User not found'});
            } else if (error.code === 'P2002') {
                return res.status(409).json({message: 'Email already exists'});
            }
        }
        return res.status(500).json({message: 'Something went wrong'});
    }
});

//delete /users/:id - delete user
app.delete('/users/:id',protect, async (req: Request, res:Response) => {
    const {id} = req.params as {id: string};
    const numericId = parseInt(id);
    //const id = parseInt(req.params.id);
    
    const {userId : idFromToken} = req.user as {userId: number};
    if(idFromToken !== numericId){
        return res.status(403).json({message: 'Forbidden: You can only update your own profile'});
    };

    await prisma.user.delete({
        where: {id: numericId},
    });
    res.status(204).end();
});

//PRODUCT ENDPOINTS

//get /products -- all users can access
app.get('/products', async (req, res) =>{
    const products = await prisma.product.findMany({
        include: {category: true, stock: true}, // get category and stock info
    });
    res.json(products);
    
});

//get /products/:id -- get only one product -- all users can access
app.get('/products/:id', async (req, res) =>{
    const {id} = req.params as {id: string};
    const product = await prisma.product.findUnique({
        where: {id: parseInt(id)},
        include: {addons: true},

    });
    res.json(product);
});

//POST /products -- only admin can create product -- create product
app.post('/products', adminProtect, async (req, res) =>{
    const {productName, description, price, categoryId, stockQuantity, addons} = req.body;

    // check basic validation
    if(!productName || !price || !categoryId || !stockQuantity){
        return res.status(400).json({message: 'Missing required fields'});
    }
    // create product
    try {
        const newProduct = await prisma.product.create({
            data: {
                productName : productName,
                description : description,
                price : price,
                category : {
                    connect: {id: categoryId} // connect to existing category
                },
                stock: {
                    create: {
                        quantity: stockQuantity
                    }
                },
                //addons: {create: addons}, //create addons
            },
        });
        res.status(201).json(newProduct);
    } catch (error) {
       console.error(error);
       return res.status(500).json({message: 'Something went wrong'});
    }
});

//PUT /products/:id -- only admin can update 
app.put('/products/:id', adminProtect, async (req,res) =>{
    const {id} = req.params as {id: string};
    const {productName, description, price, categoryId} = req.body;

    //check basic validation
    if(!productName || !price || !categoryId){
        return res.status(400).json({message: 'Missing required fields'});
    }

    try{
        const updatedProduct = await prisma.product.update({
            where: {id: parseInt(id)},
            data: {
                productName: productName,
                description: description,
                price: price,
                category : {
                    connect: {id: categoryId}
                }
            }
        });
        res.json(updatedProduct);
    } catch (error){
        console.error(error);
        return res.status(500).json({message: 'Something went wrong'});
    }
});

//DELETE /products/:id -- only admin can delete
app.delete('/product/:id', adminProtect, async (req,res) => {
    const {id} = req.params as {id:string};
    try{
        await prisma.product.delete({
            where: {id: parseInt(id)}
        });
        res.status(204).end();
    } catch (error){
        console.error(error);
        return res.status(500).json({message: 'Something went wrong'});
    }
});

//ORDER ENDPOINTS

//POST /orders -- create order -- only logged in user can create order
app.post('/orders', protect, async (req,res) =>{

    try{
        const {userId} = req.user as {userId: number};
        const {paymentMethodId, addressDetail, items, employeeId} = req.body;

        // Get all employees
        const allEmployees = await prisma.employee.findMany();
        if(allEmployees.length === 0){
            return res.status(500).json({message: 'No employees available to assign the order'});
        }

        // random select employee
        const randomEmployee = allEmployees[Math.floor(Math.random() * allEmployees.length)];
        if (!randomEmployee) {
            return res.status(500).json({message: 'Failed to assign an employee to the order'});
        }

        //basic validation
        if(!paymentMethodId || !items || !Array.isArray(items) || items.length === 0 || !employeeId){
            return res.status(400).json({message: 'Invalid order data provided'});
        }

        //create order
        const newOrder = await prisma.order.create({
            data: {
                userId: userId,
                employeeId: randomEmployee.id,
                paymentMethodId: paymentMethodId,
                addressDetail: addressDetail,
                orderDetails: {
                    create: items.map((item: {productId: number, quantity: number}) =>({
                        productId: item.productId,
                        quantity: item.quantity
                    })),
                },
            },
            include: {orderDetails: true}
        });
        res.status(201).json(newOrder);
    } catch (error){
        console.error(error);
        return res.status(500).json({message: 'Something went wrong'});
    }
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


/* async function main(){
    // create user
     const user = await prisma.user.create({
        data: {
            name: 'Alice',
            email: 'alice@gmail.com',
        },
    }); 

    //get all users
    //const users = await prisma.user.findMany();
    console.log(user);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    }) */

