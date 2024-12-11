import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import axios from 'axios';
import TaskRepository from './repositories/TaskRepository.js';
import dotenv from 'dotenv/config';

const app = express();
const port = process.env.PORT || 5000;
const ipInfoToken = '50fc15099ad0b0'; // Replace with your IPInfo token
// spell-checker: disable

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    await mongoose.connect(mongoUri, {});
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
};

connectDB();

const taskRepository = new TaskRepository();

const getGeolocation = async (ip) => {
  try {
    const response = await axios.get(`https://ipinfo.io/${ip}?token=${ipInfoToken}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching geolocation:', error);
    return null;
  }
};

const logRequestDetails = (clientIp, geolocation, requestBody) => {
  console.log('Client IP:', clientIp);
  console.log('Geolocation:', geolocation);
  console.log('Request Body:', requestBody);
  console.log('Client Timezone:', geolocation.timezone);
};

app.get('/tasks', async (_, res) => {
  try {
    const tasks = await taskRepository.getAll();
    res.json(tasks);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/tasks', async (req, res) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const requestBody = req.body;
    const geolocation = clientIp ? await getGeolocation(clientIp) : null;
    logRequestDetails(clientIp, geolocation, requestBody);
    const task = await taskRepository.add(requestBody, clientIp, geolocation);
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/tasks/:id', async (req, res) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const requestBody = req.body;
    const geolocation = await getGeolocation(clientIp);
    logRequestDetails(clientIp, geolocation, requestBody);
    const task = await taskRepository.replace(req.params.id, requestBody, clientIp, geolocation);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.patch('/tasks/:id', async (req, res) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const requestBody = req.body;
    const geolocation = await getGeolocation(clientIp);
    logRequestDetails(clientIp, geolocation, requestBody);

    const task = await taskRepository.update(req.params.id, requestBody, clientIp, geolocation);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const requestBody = req.body;
    const geolocation = await getGeolocation(clientIp);
    logRequestDetails(clientIp, geolocation, requestBody);

    const task = await taskRepository.delete(req.params.id, clientIp, geolocation);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
