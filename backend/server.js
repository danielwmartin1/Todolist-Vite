// filepath: /C:/Users/danie/OneDrive/Coding/Projects/Todolist-Vite/backend/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import TaskRepository from './repositories/TaskRepository.js';

const app = express();
const port = process.env.PORT || 5000;
const ipInfoToken = '50fc15099ad0b0'; // Replace with your IPInfo token

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  const connectDB = async () => {
    try {
      await mongoose.connect('mongodb://localhost:27017/todolist', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB connected...');
    } catch (err) {
      console.error('Error connecting to MongoDB:', err.message);
      process.exit(1);
    }
  };

  connectDB();
}

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
    const geolocation = await getGeolocation(clientIp);
    logRequestDetails(clientIp, geolocation, requestBody);

    const newTask = await taskRepository.add(req.body);
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/tasks/:id', async (req, res) => {
  try {
    const updatedTask = await taskRepository.replace(req.params.id, req.body);
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.patch('/tasks/:id', async (req, res) => {
  try {
    const updatedTask = await taskRepository.update(req.params.id, req.body);
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    const deleted = await taskRepository.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;