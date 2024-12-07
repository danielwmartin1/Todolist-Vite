import mongoose from 'mongoose';
import { formatInTimeZone } from 'date-fns-tz';

// Helper function to check if a date is valid
function isValidate(date) {
  return date instanceof Date && !isNaN(date);
}

// Define the Task schema
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  dueDate: { type: Date, set: (date) => isValidate(date) ? new Date(date) : date },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, set: (date) => date && isValidate(date) ? new Date(date) : date },
  updatedAt: { type: Date, default: Date.now },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  geolocation: { type: Map, of: mongoose.Schema.Types.String }, // Store geolocation as a map of strings
  serverTimezone: { type: String, default: 'UTC' },
});

// Middleware to update the updatedAt field
TaskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Middleware to update the updatedAt field
TaskSchema.pre('findOneAndUpdate', function(next) {
  this._update.updatedAt = new Date();
  next();
});

// Add a toJSON method to format dates before sending to frontend
TaskSchema.methods.toJSON = function() {
  const obj = this.toObject();
  const format = 'MMMM d, yyyy h:mm a zzz';
  const dueDateFormat = 'MMMM d, yyyy'
  obj.createdAt = formatInTimeZone(this.createdAt, 'UTC', format);
  obj.dueDate = this.dueDate ? formatInTimeZone(this.dueDate, dueDateFormat) : null;
  obj.completedAt = this.completedAt ? formatInTimeZone(this.completedAt, 'UTC', format) : null;
  obj.updatedAt = formatInTimeZone(this.updatedAt, 'UTC', format);
  obj.priority = this.priority;
  obj.clientIp = this.clientIp;
  obj.geolocation = this.geolocation;
  return obj;
};

// Create a model from the schema
const Tasks = mongoose.model('Tasks', TaskSchema);

export default Tasks;