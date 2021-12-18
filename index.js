const express = require('express')
require('dotenv').config()
var cors = require('cors')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;


const app = express()
app.use(cors());
app.use(express.json())
const port = process.env.PORT || 5000





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ex382.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        const database = client.db("finalProject");
        const allPackage = database.collection("packageCollections");
        const userPayment = database.collection("userPayments");
        const BookingCollection = database.collection("bookingCollection");
        const customerReview = database.collection("customerReview");
        const userCollection = database.collection("users");
        console.log('done')

        // find limited data for homepage
        app.get('/packages', async (req, res) => {
            const cursor = allPackage.find({});
            const packages = await cursor.limit(6).toArray();
            res.send(packages);
        });

        // find all packages
        app.get('/allPackages', async (req, res) => {
            const cursor = allPackage.find({});
            const packages = await cursor.toArray();
            res.send(packages);
        });
        // post packages
        app.post('/allPackages', async (req, res) => {
            const service = req.body;
            const result = await allPackage.insertOne(service);
            res.json(result)
        })

        // post user payment/////////////////////////////////////
        app.post('/userPayment', async (req, res) => {
            const service = req.body;
            const result = await userPayment.insertOne(service);
            res.json(result)
        })


        // find all order for admin
        app.get('/manageAllOrders', async (req, res) => {
            const cursor = BookingCollection.find({});
            const manageAllOrders = await cursor.toArray();
            res.send(manageAllOrders);
        });

        // find payment lists of bachelors for manager

        app.get('/paymentList', async (req, res) => {
            const cursor = userPayment.find({});
            const managePayment = await cursor.toArray();
            res.send(managePayment);
        });

        // get all users from users !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
        app.get('/manageUserList', async (req, res) => {
            const cursor = userCollection.find({});

            const allPerson = await cursor.toArray();

            res.json(allPerson);
        })

        // single packages based on product id 
        app.get('/booking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const user = await allPackage.findOne(query);
            res.send(user);
        });
        // single manageEdit based on product id 
        app.get('/manageEditList/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const user = await allPackage.findOne(query);
            res.send(user);
        });

        // get my orders
        app.get('/myOrders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = BookingCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        });;
        // get single user by email
        app.get('/singleUser', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = userCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        });;

        // post Booking
        app.post('/booking', async (req, res) => {

            const booking = req.body;
            const result = await BookingCollection.insertOne(booking);
            res.json(result);

        });

        // customer Review post
        app.post('/customerReview', async (req, res) => {

            const review = req.body;
            const result = await customerReview.insertOne(review);
            res.json(result);

        });
        // show customer reviews
        app.get('/customerReview', async (req, res) => {
            const cursor = customerReview.find({});
            const review = await cursor.toArray();
            res.send(review);
        })
        // users
        app.post('/users', async (req, res) => {

            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result);

        });

        // put users
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user }
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })



        // put users update
        app.put('/users/update', async (req, res) => {
            const user = req.body;

            const filter = { email: user.email };
            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    displayName: user.name,
                    email: user.email
                }
            }
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })
        // put package update
        app.put('/package/update', async (req, res) => {
            const user = req.body;
            const filter = { name: user.name };
            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    name: user.name,
                    img: user.img,
                    rating: user.rating,
                    description: user.description,
                    rent: user.rent
                }
            }
            const result = await allPackage.updateOne(filter, updateDoc, options);
            res.json(result);
        })

        // admin 
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);

        })


        // manager
        app.put('/users/manager', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'manager' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);

        })

        // houseOwner
        app.put('/users/houseOwner', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'owner' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);

        })
        // houseOwner verify
        app.get('/users/houseOwner/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);

            let isOwner = false;
            if (user?.role === 'owner') {
                isOwner = true;
            }

            res.json({ owner: isOwner })
        })

        // manager verify
        app.get('/users/manager/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);

            let isManager = false;
            if (user?.role === 'manager') {
                isManager = true;
            }

            res.json({ manager: isManager })
        })
        // admin or user verify
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            // console.log(isAdmin)
            res.json({ admin: isAdmin })
        })


        // delete Api

        app.delete('/booking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await BookingCollection.deleteOne(query);
            res.json(result)
        })

        // delete manage all orders for admin

        app.delete('/manageAllOrders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await BookingCollection.deleteOne(query);
            res.json(result)
        })
        // delete users from the users table

        app.delete('/manageUserList/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.json(result)
        })
        // delete manage packages
        app.delete('/managePackages/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await allPackage.deleteOne(query);
            res.json(result)
        })
        // delete payment from payment list
        app.delete('/paymentList/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await userPayment.deleteOne(query);
            res.json(result)
        })
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})