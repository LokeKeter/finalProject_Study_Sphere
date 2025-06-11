const Task = require("../models/Task");

async function createTask(data) {
  return await new Task(data).save();
}

async function getTasksByTeacher(teacherId) {
  return await Task.find({ teacherId });
}

async function toggleTask(id) {
  const task = await Task.findById(id);
  if (!task) throw new Error("Task not found");
  task.completed = !task.completed;
  return await task.save();
}

async function deleteTask(id) {
  const deleted = await Task.findByIdAndDelete(id);
  if (!deleted) throw new Error("Task not found");
  return deleted;
}

module.exports = {
  createTask,
  getTasksByTeacher,
  toggleTask,
  deleteTask,
};
