import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import List from './List';
import { jest } from '@jest/globals';
import { describe, beforeEach, test, expect } from '@jest/globals';

// frontend/src/components/List.test.jsx

jest.mock('axios');

describe('List Component', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: [] });
  });

  test('should add a new task with a valid due date', async () => {
    render(<List />);

    // Simulate user input for task title
    const taskInput = screen.getByPlaceholderText('Add a new task...');
    fireEvent.change(taskInput, { target: { value: 'New Task' } });

    // Simulate selecting a due date
    const dueDateInput = screen.getByPlaceholderText('Enter Due Date');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    fireEvent.change(dueDateInput, { target: { value: tomorrow.toISOString().slice(0, 10) } });

    // Simulate selecting a priority
    const prioritySelect = screen.getByPlaceholderText('Select Priority');
    fireEvent.change(prioritySelect, { target: { value: 'Medium' } });

    // Mock the POST request
    axios.post.mockResolvedValue({
      data: {
        _id: '1',
        title: 'New Task',
        dueDate: tomorrow.toISOString(),
        priority: 'Medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    // Simulate clicking the "Add Task" button
    const addButton = screen.getByText('Add Task');
    fireEvent.click(addButton);

    // Assert that the task is added successfully
    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
      expect(screen.getByText(`Due: ${tomorrow.toISOString().slice(0, 10)}`)).toBeInTheDocument();
    });
  });

  test('should show an error message if due date is not selected', async () => {
    render(<List />);

    // Simulate user input for task title
    const taskInput = screen.getByPlaceholderText('Add a new task');
    fireEvent.change(taskInput, { target: { value: 'New Task' } });

    // Simulate clicking the "Add Task" button without selecting a due date
    const addButton = screen.getByText('Add Task');
    fireEvent.click(addButton);

    // Assert that the error message is shown
    await waitFor(() => {
      expect(screen.getByText('Please choose a Due Date')).toBeInTheDocument();
    });
  });

  test('should show an error message if due date is in the past', async () => {
    render(<List />);

    // Simulate user input for task title
    const taskInput = screen.getByPlaceholderText('Add a new task');
    fireEvent.change(taskInput, { target: { value: 'New Task' } });

    // Simulate selecting a past due date
    const dueDateInput = screen.getByPlaceholderText('Due Date');
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    fireEvent.change(dueDateInput, { target: { value: pastDate.toISOString().slice(0, 10) } });

    // Simulate clicking the "Add Task" button
    const addButton = screen.getByText('Add Task');
    fireEvent.click(addButton);

    // Assert that the error message is shown
    await waitFor(() => {
      expect(screen.getByText('Please choose a future date and time.')).toBeInTheDocument();
    });
  });
});