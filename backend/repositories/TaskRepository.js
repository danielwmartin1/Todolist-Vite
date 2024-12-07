import Tasks from '../models/Tasks.js';
import { formatInTimeZone } from 'date-fns-tz';

  class TaskRepository {

    formatTaskDates(task) {
      const clientTimezone = 'UTC';
      return {
        ...task.toObject(),
        dueDate: task.dueDate ? formatInTimeZone(new Date(task.dueDate), clientTimezone, 'MMMM d, yyyy') : null,
        createdAt: task.createdAt ? formatInTimeZone(new Date(task.createdAt), clientTimezone, 'MMMM d, yyyy h:mm a zzz') : null,
        updatedAt: task.updatedAt ? formatInTimeZone(new Date(task.updatedAt), clientTimezone, 'MMMM d, yyyy h:mm a zzz') : null,
        completedAt: task.completedAt ? formatInTimeZone(new Date(task.completedAt), clientTimezone,'MMMM d, yyyy h:mm a zzz') : null,
        priority: task.priority || 'low',
        clientIp: task.clientIp,
        geolocation: task.geolocation,
        clientTimezone: task.clientTimezone
      };
    }

    async getAll() {
      try {
        const tasks = await Tasks.find();
        return tasks.map(this.formatTaskDates);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        throw new Error('Could not fetch tasks');
      }
    }
  
    async add(newTask, clientIp, geolocation) {
      try {
        const task = new Tasks({
          ...newTask,
          dueDate: newTask.dueDate ? new Date(newTask.dueDate) : null,
          priority: newTask.priority || 'low',
          clientIp,
          geolocation, 
          clientTimezone: this.clientTimezone
        });
        await task.save();
        return this.formatTaskDates(task);
      } catch (error) {
        console.error('Error adding task:', error);
        throw new Error('Could not add task');
      }
    }
  
    async replace(taskId, updatedTask, clientIp, geolocation) {
      try {
        const task = await Tasks.findByIdAndUpdate(
          taskId,
          { ...updatedTask, clientIp, geolocation, updatedAt: new Date() },
          { new: true }
        );
        if (!task) return null;
        return this.formatTaskDates(task);
      } catch (error) {
        console.error(`Error replacing task with id ${taskId}:`, error);
        throw new Error('Could not replace task');
      }
    }
  async update(taskId, updatedTask, clientIp, geolocation) {
    try {
    const task = await Tasks.findByIdAndUpdate(
      taskId,
      { 
      ...updatedTask, 
      clientIp, 
      geolocation, 
      updatedAt: new Date() 
      },
      { new: true }
    );
    if (!task) return null;
    return this.formatTaskDates(task);
    } catch (error) {
    console.error(`Error updating task with id ${taskId}:`, error);
    throw new Error('Could not update task');
    }
  }
  
    async delete(taskId) {
      try {
      const task = await Tasks.findByIdAndDelete(taskId);
      return !!task;
      } catch (error) {
      console.error(`Error deleting task with id ${taskId}:`, error);
      throw new Error('Could not delete task');
      }
    }
  };

  export default TaskRepository;