const Task = require("../models/Task");
const Work = require("../models/Work");
const cloudinary = require("../config/cloudinary");

// @desc Create task
// @route POST /api/tasks
// @access Private
const createTask = async (req, res) => {
  const { title, description, status, startDate, deadline, assignedUsers } =
    req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  const task = await Task.create({
    title,
    description,
    status: status || "pending",
    startDate,
    deadline,
    assignedUsers: assignedUsers || [],
    createdBy: req.user._id,
  });

  res.status(201).json(task);
};

// @desc Get all tasks for logged-in user (created or assigned)
// @route GET /api/tasks
// @access Private
const getTasks = async (req, res) => {
  try {
    const { search, status } = req.query;

    // Base: user created OR assigned
    let query = {
      $or: [{ createdBy: req.user._id }, { assignedUsers: req.user._id }],
    };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (status) {
      query.status = status;
    }

    const tasks = await Task.find(query)
      .populate("createdBy", "name email display_image")
      .populate("assignedUsers", "name email display_image")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Get single task
// @route GET /api/tasks/:id
// @access Private
const getTaskById = async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate("createdBy", "name email display_image")
    .populate("assignedUsers", "name email display_image");

  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
};

// @desc Update task (only creator)
// @route PUT /api/tasks/:id
// @access Private
const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });

  if (task.createdBy.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Only the creator can update this task" });
  }

  const { title, description, status, startDate, deadline, assignedUsers } =
    req.body;

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (startDate !== undefined) task.startDate = startDate;
  if (deadline !== undefined) task.deadline = deadline;
  if (assignedUsers !== undefined) task.assignedUsers = assignedUsers;

  const updatedTask = await task.save();
  res.json(updatedTask);
};

// @desc Delete task (only creator) + delete works and images
// @route DELETE /api/tasks/:id
// @access Private
const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });

  if (task.createdBy.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Only the creator can delete this task" });
  }

  // delete related works & their images
  const works = await Work.find({ task: task._id });
  for (const work of works) {
    for (const img of work.images) {
      await cloudinary.uploader.destroy(img.publicId);
    }
    await work.deleteOne();
  }

  await task.deleteOne();
  res.json({ message: "Task and related works deleted" });
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
