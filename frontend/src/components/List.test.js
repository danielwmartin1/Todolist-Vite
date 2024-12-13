// filepath: /c:/Users/danie/OneDrive/Coding/Projects/Todolist-Vite/frontend/src/components/List.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { format, toZonedTime } from 'date-fns-tz';
import axios from 'axios';
import List from './List';
import { jest } from '@jest/globals';
import { describe, beforeEach, test, expect } from '@jest/globals';
import React from 'react';

jest.mock('axios');

describe('List Component', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: [] });
  });

  test('should add a new task with a valid due date', async () => {
    render(<List />);

    // Simulate user input for task title
    const taskInput = screen.getByPlaceholderText('Add a new task');
    fireEvent.change(taskInput, { target: { value: 'New Task' } });

    // Simulate user input for due date
    const dueDateInput = screen.getByPlaceholderText('Due Date');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    fireEvent.change(dueDateInput, { target: { value: tomorrow.toISOString().slice(0, 10) } });

    // Simulate clicking the "Add Task" button
    const addButton = screen.getByText('Add Task');
    fireEvent.click(addButton);

    // Assert that the task is added successfully
    await waitFor(() => {
      const taskTitle = screen.getAllByText('New Task').find(el => el.classList.contains('taskTitle'));
      const dueDate = screen.getAllByText(`Due: ${format(toZonedTime(tomorrow, Intl.DateTimeFormat().resolvedOptions().timeZone), 'MMMM d, yyyy')}`).find(el => el.classList.contains('timestamp'));
      expect(taskTitle).toBeInTheDocument();
      expect(dueDate).toBeInTheDocument();
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
      expect(screen.getByText('Please enter a task and due date')).toBeInTheDocument();
    });
  });

  test('should show an error message if due date is in the past', async () => {
    render(<List />);

    // Simulate user input for task title
    const taskInput = screen.getByPlaceholderText('Add a new task');
    fireEvent.change(taskInput, { target: { value: 'New Task' } });

    // Simulate user input for due date
    const dueDateInput = screen.getByPlaceholderText('Due Date');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    fireEvent.change(dueDateInput, { target: { value: yesterday.toISOString().slice(0, 10) } });

    // Simulate clicking the "Add Task" button
    const addButton = screen.getByText('Add Task');
    fireEvent.click(addButton);

    // Assert that the error message is shown
    await waitFor(() => {
      expect(screen.getByText('Due date cannot be in the past')).toBeInTheDocument();
    });
  });

  test('renders List component', () => {
    render(<List />);
    const addButton = screen.getByText('Add Task');
    expect(addButton).toBeInTheDocument();
  });
});