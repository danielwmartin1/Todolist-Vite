import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
import TaskRepository from './repositories/TaskRepository.js';
import app from './server.js';
import dotenv from 'dotenv';

jest.mock('axios');
jest.mock('./repositories/TaskRepository.js');

describe('Task API', () => {
    let server;

    beforeAll(async () => {
        server = express();
        server.use(app);
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        await mongoose.connection.close();
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /tasks should return all tasks', async () => {
        TaskRepository.prototype.getAll.mockResolvedValue([{ title: 'Test Task' }]);

        const response = await request(server).get('/tasks');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([{ title: 'Test Task' }]);
    });

    test('POST /tasks should create a new task', async () => {
        const newTask = { title: 'New Task' };
        TaskRepository.prototype.add.mockResolvedValue(newTask);
        axios.get.mockResolvedValue({ data: { timezone: 'UTC' } });

        const response = await request(server).post('/tasks').send(newTask);

        expect(response.status).toBe(201);
        expect(response.body).toEqual(newTask);
    });

    test('POST /tasks should handle errors', async () => {
        TaskRepository.prototype.add.mockRejectedValue(new Error('Failed to create task'));
        axios.get.mockResolvedValue({ data: { timezone: 'UTC' } });

        const response = await request(server).post('/tasks').send({ title: 'New Task' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Failed to create task' });
    });

    test('PUT /tasks/:id should replace a task', async () => {
        const updatedTask = { title: 'Updated Task' };
        TaskRepository.prototype.replace.mockResolvedValue(updatedTask);
        axios.get.mockResolvedValue({ data: { timezone: 'UTC' } });

        const response = await request(server).put('/tasks/1').send(updatedTask);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(updatedTask);
    });

    test('PUT /tasks/:id should handle task not found', async () => {
        TaskRepository.prototype.replace.mockResolvedValue(null);
        axios.get.mockResolvedValue({ data: { timezone: 'UTC' } });

        const response = await request(server).put('/tasks/1').send({ title: 'Updated Task' });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Task not found' });
    });

    test('PATCH /tasks/:id should update a task', async () => {
        const updatedTask = { title: 'Updated Task' };
        TaskRepository.prototype.update.mockResolvedValue(updatedTask);
        axios.get.mockResolvedValue({ data: { timezone: 'UTC' } });

        const response = await request(server).patch('/tasks/1').send(updatedTask);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(updatedTask);
    });

    test('PATCH /tasks/:id should handle task not found', async () => {
        TaskRepository.prototype.update.mockResolvedValue(null);
        axios.get.mockResolvedValue({ data: { timezone: 'UTC' } });

        const response = await request(server).patch('/tasks/1').send({ title: 'Updated Task' });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Task not found' });
    });

    test('DELETE /tasks/:id should delete a task', async () => {
        TaskRepository.prototype.delete.mockResolvedValue(true);
        axios.get.mockResolvedValue({ data: { timezone: 'UTC' } });

        const response = await request(server).delete('/tasks/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Task deleted successfully' });
    });

    test('DELETE /tasks/:id should handle task not found', async () => {
        TaskRepository.prototype.delete.mockResolvedValue(false);
        axios.get.mockResolvedValue({ data: { timezone: 'UTC' } });

        const response = await request(server).delete('/tasks/1');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Task not found' });
    });
});