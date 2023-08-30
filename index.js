const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;

app.use(cors());
app.use(express.json());
// const stripe = require('stripe')(process.env.STRIPE_SECRET);
const stripe = require("stripe")(
  "sk_test_51JwJJWDWruHMZxwUonpvYSiX7cfzKVTHuhtNCVkHI97L4ghdf7cAU7F8Nk8nmCXLOo3JHnnjYuCPIHpX7kMYbO5d00ugSlbuRI"
);
const port = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.send("Welcome !!!!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eoyrd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("homeland");
    const propertyCollection = database.collection("properties");
    const ordersCollection = database.collection("orders");
    const usersCollection = database.collection("users");
    const reviewsCollection = database.collection("reviews");

    //getproperty
    app.get("/properties", async (req, res) => {
      const cursor = propertyCollection.find({});
      const properties = await cursor.toArray();
      res.send(properties);
    });
    //property delete from manage property
    app.delete("/properties/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await propertyCollection.deleteOne(query);
      res.json(result);
    });
    //post or addpropertys
    app.post("/properties", async (req, res) => {
      const property = req.body;
      const result = await propertyCollection.insertOne(property);
      res.json(result);
    });
    //get details
    app.get("/properties/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const property = await propertyCollection.findOne(query);
      res.json(property);
    });
    // save user info google login
    app.put("/users", async (req, res) => {
      const user = req.params;

      const filter = { email: user.email };
      const options = { upsert: true };
      const doc = { $set: user };
      const result = await usersCollection.updateOne(filter, doc, options);
      res.send(result);
    });

    // insert user by register
    app.post("/users", async (req, res) => {
      const result = await usersCollection.insertOne(req.body);
      res.send(result);
    });
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });
    //get allorder
    app.get("/orders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });
    //get my orders
    app.get("/orders/:email", async (req, res) => {
      const result = await ordersCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });

    //delete orders
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });
    // post order
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      console.log("orders", order);
      res.json(result);
    });
    //get reviews
    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    //post reviews
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.json(result);
    });
    //delete orders
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.json(result);
    });
    // make admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // get admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //getpaymentid
    app.get("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.findOne(query);
      res.json(result);
    });

    //PAYMENT
    app.post("/create-payment-intent", async (req, res) => {
      const paymentInfo = req.body;
      const amount = paymentInfo.price * 100;

      const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        payment_method_types: ["card"],
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    });
    //updatestatus
    app.put("/orderStatus/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: { status: "Confirm" },
      };
      const result = await ordersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    app.put("/order/:id", async (req, res) => {
      const id = req.params.id;
      const payment = req.body;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          payment: payment,
        },
      };
      const result = await ordersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

//listen
app.listen(port, () => {
  console.log("Server is running", port);
});
