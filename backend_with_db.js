import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import userServices from './models/user-services.js';
import DrawingServices from './models/drawing-services.js'; // Import drawing services

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const fakeUser = { username: '', pwd: '' };

function generateAccessToken(username) {
  return jwt.sign({ username: username }, process.env.TOKEN_SECRET, {
    expiresIn: '600s',
  });
}

app.post('/login', async (req, res) => {
  const { username, pwd } = req.body;
  const retrievedUser = fakeUser;
  if (retrievedUser.username && retrievedUser.pwd) {
    const isValid = await bcrypt.compare(pwd, retrievedUser.pwd);
    if (isValid) {
      const token = generateAccessToken(username);
      res.status(200).send(token);
    } else {
      res.status(401).send('Unauthorized');
    }
  } else {
    res.status(401).send('Unauthorized');
  }
});

app.post('/signup', async (req, res) => {
  const { username, pwd, pwdValidate } = req.body;
  if (!username || !pwd) {
    return res.status(400).send('Bad request: Invalid input data.');
  }
  if (username === fakeUser.username) {
    return res.status(409).send('Username already taken');
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPwd = await bcrypt.hash(pwd, salt);
  fakeUser.username = username;
  fakeUser.pwd = hashedPwd;

  const token = generateAccessToken(username);
  console.log('JWT: ', token);
  res.status(201).send(token);
});

app.post('/drawings', async (req, res) => {
  const { userId, pdfUrl, pageNumber, drawing } = req.body;
  if (!userId || !pdfUrl || pageNumber === undefined || !drawing) {
    return res.status(400).send('Bad request: Invalid input data.');
  }
  try {
    const drawingData = {
      userId,
      pdfUrl,
      pageNumber,
      drawing,
    };
    const savedDrawing = await DrawingServices.addDrawing(drawingData);
    res.status(201).send(savedDrawing);
  } catch (error) {
    res.status(500).send('Error saving drawing');
  }
});

app.get('/drawings', async (req, res) => {
  const { userId, pdfUrl } = req.query;
  if (!userId || !pdfUrl) {
    return res.status(400).send('Bad request: Invalid input data.');
  }
  try {
    const drawings = await DrawingServices.getDrawings(userId, pdfUrl);
    res.status(200).send(drawings);
  } catch (error) {
    res.status(500).send('Error retrieving drawings');
  }
});

function authenticateUser(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token received');
    return res.status(401).end();
  } else {
    try {
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
      console.log('Decoded token: ', decoded);
      next();
    } catch (error) {
      console.log(error);
      return res.status(401).end();
    }
  }
}

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/users', authenticateUser, async (req, res) => {
  const name = req.query['name'];
  const job = req.query['job'];
  try {
    const result = await userServices.getUsers(name, job);
    res.send({ users_list: result });
  } catch (error) {
    console.log(error);
    res.status(500).send('An error occurred in the server.');
  }
});

app.get('/users/:id', async (req, res) => {
  const id = req.params['id'];
  const result = await userServices.findUserById(id);
  if (result === undefined || result === null) res.status(404).send('Resource not found.');
  else {
    res.send({ users_list: result });
  }
});

app.post('/users', async (req, res) => {
  const user = req.body;
  const savedUser = await userServices.addUser(user);
  if (savedUser) res.status(201).send(savedUser);
  else res.status(500).end();
});

app.delete('/users/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const deletedUser = await userServices.deleteUserById(id);
    if (deletedUser) {
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.sendStatus(500);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
