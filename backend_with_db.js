import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { body, validationResult } from "express-validator";
import buildingRoutes from './routes/buildings.js';
import userServices from "./models/user-services.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const fakeUser = { username: "", pwd: "" };

function generateAccessToken(username) {
  return jwt.sign({ username: username }, process.env.TOKEN_SECRET, {
    expiresIn: "600s",
  });
}

// Middleware to validate request body for signup
const validateSignup = [
  body('username').isString().withMessage('Username must be a string').trim().escape(),
  body('pwd').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const pwd = req.body.pwd;
  // Call a model function to retrieve an existing user based on username
  //  (or any other unique identifier such as email if that applies to your app)
  // Using our fake user for demo purposes
  const retrievedUser = fakeUser;
  if (retrievedUser.username && retrievedUser.pwd) {
    const isValid = await bcrypt.compare(pwd, retrievedUser.pwd);
    if (isValid) {
      // Generate token and respond
      const token = generateAccessToken(username);
      res.status(200).send(token);
    } else {
      //Unauthorized due to invalid pwd
      res.status(401).send("Unauthorized");
    }
  } else {
    //Unauthorized due to invalid username
    res.status(401).send("Unauthorized");
  }
});

app.post("/signup", validateSignup, async (req, res) => {
  const username = req.body.username;
  const userPwd = req.body.pwd;
  const userPwdValidate = req.body.pwdValidate;
  if (!username && !userPwd) {
    res.status(400).send("Bad request: Invalid input data.");
  } else {
    if (username === fakeUser.username) {
      //Conflicting usernames. Assuming it's not allowed, then:
      res.status(409).send("Username already taken");
    } else {
      // generate salt to hash password
      /* Made up of random bits added to each password instance before its hashing. 
      Salts create unique passwords even in the instance of two users choosing the 
      same passwords. Salts help us mitigate hash table attacks by forcing attackers 
      to re-compute them using the salts for each user.
      More info: https://auth0.com/blog/adding-salt-to-hashing-a-better-way-to-store-passwords/
      */
      // Also, you can pull this salt param from an env variable
      const salt = await bcrypt.genSalt(10);
      // On the database you never store the user input pwd.
      // So, let's hash it:
      const hashedPwd = await bcrypt.hash(userPwd, salt);
      // Now, call a model function to store the username and hashedPwd (a new user)
      // For demo purposes, I'm skipping the model piece, and assigning the new user to this fake obj
      fakeUser.username = username;
      fakeUser.pwd = hashedPwd;

      const token = generateAccessToken(username);
      console.log("JWT: ", token);
      res.status(201).send(token);
    }
  }
});

/* Using this funcion as a "middleware" function for
  all the endpoints that need access control protecion */
function authenticateUser(req, res, next) {
  const authHeader = req.headers["authorization"];
  //Getting the 2nd part of the auth hearder (the token)
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("No token received");
    return res.status(401).end();
  } else {
    // If a callback is supplied, verify() runs async
    // If a callback isn't supplied, verify() runs synchronously
    // verify() throws an error if the token is invalid
    try {
      // verify() returns the decoded obj which includes whatever objs
      // we use to code/sign the token
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
      // in our case, we used the username to sign the token
      console.log("Decoded token: ", decoded);
      next();
    } catch (error) {
      console.log(error);
      return res.status(401).end();
    }
  }
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Turned this endpoint protected with access control
// See the authenticateUser function being passed as a middleware function
app.get("/users", authenticateUser, async (req, res) => {
  const name = req.query["name"];
  const job = req.query["job"];
  try {
    const result = await userServices.getUsers(name, job);
    res.send({ users_list: result });
  } catch (error) {
    console.log(error);
    res.status(500).send("An error ocurred in the server.");
  }
});

app.get("/users/:id", async (req, res) => {
  const id = req.params["id"];
  const result = await userServices.findUserById(id);
  if (result === undefined || result === null)
    res.status(404).send("Resource not found.");
  else {
    res.send({ users_list: result });
  }
});

app.post("/users", async (req, res) => {
  const user = req.body;
  const savedUser = await userServices.addUser(user);
  if (savedUser) res.status(201).send(savedUser);
  else res.status(500).end();
});

app.delete("/users/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const deletedUser = await userServices.deleteUserById(id);
    if (deletedUser) {
      res.sendStatus(204); // Send a success status code (No Content) if the user is successfully deleted
    } else {
      res.sendStatus(404); // Send a not found status code if the user with the specified ID does not exist
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.sendStatus(500); // Send a server error status code if an error occurs during deletion
  }
});

// Use the building routes
app.use('/api/buildings', buildingRoutes);

app.listen(port, () => {
  console.log(`REST API is listening on port: ${port}.`);
});

// Connect to MongoDB and populate initial data
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
    await createInitialData();
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    process.exit(1);
  }
};

const createInitialData = async () => {
  const Building = mongoose.model('Building');
  const buildings = [
    {
      name: 'Building 1',
      location: { longitude: -120.65, latitude: 35.3 },
      amenities: ['Library', 'Cafe'],
      floors: [
        {
          number: 1,
          rooms: [
            { name: 'Room 101', coordinates: { longitude: -120.65, latitude: 35.3 }, floor: 1, occupancy: false },
            { name: 'Room 102', coordinates: { longitude: -120.651, latitude: 35.301 }, floor: 1, occupancy: true },
          ],
        },
      ],
    },
  ];

  try {
    await Building.deleteMany();
    await Building.insertMany(buildings);
    console.log('Buildings added');
  } catch (error) {
    console.error('Error adding buildings', error);
  }
};

connectDB();
