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

    //get allorder
    app.get("/orders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });
    //get my orders
    app.get("/orders/:email", async (req, res) => {
      console.log(req.params.email);
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
      console.log(review);
      const result = await reviewsCollection.insertOne(review);
      res.json(result);
    });
    //post users
    app.post("/users", async (req, res) => {
      const result = await usersCollection.insertOne(req.body);
      console.log(result);
      res.json(result);
    });
    //get allorder
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find({});
      const users = await cursor.toArray();
      res.send(users);
    });

    //put admin
    app.put("/makeAdmin", async (req, res) => {
      const filter = { email: req.body.email };
      const result = await usersCollection.find(filter).toArray();
      if (result) {
        const documents = await usersCollection.updateOne(filter, {
          $set: { role: "admin" },
        });
        console.log(documents);
      }

      res.json(result);
    });
    //updatestatus
    app.put("/statusUpdate/:id", async (req, res) => {
      const filter = { _id: ObjectId(req.params.id) };
      console.log(req.params.id);
      const result = await ordersCollection.updateOne(filter, {
        $set: {
          status: req.body.status,
        },
      });
      res.send(result);
      console.log(result);
    });

    //admin check

    app.get("/admin/:email", async (req, res) => {
      const result = await usersCollection
        .find({ email: req.params.email })
        .toArray();
      console.log(result);
      res.send(result);
    });
    //PAYMENT
    app.post("/create-payment-intent", async (req, res) => {
      const order = req.body;
      const total = order.amount;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: total * 100,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({ clientSecret: paymentIntent.client_secret });
    });
  } finally {
  }
}
run().catch(console.dir);

//listen
app.listen(port, () => {
  console.log("Server is running", port);
});
