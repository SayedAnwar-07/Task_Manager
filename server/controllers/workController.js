const Work = require("../models/Work");
const Task = require("../models/Task");
const cloudinary = require("../config/cloudinary");
const { createNotification } = require("../utils/notifications");

// Upload helper
const uploadFromBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const b64 = Buffer.from(file.buffer).toString("base64");
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    cloudinary.uploader
      .upload(dataURI, { folder: "task-manager/works" })
      .then(resolve)
      .catch(reject);
  });
};

// @desc Create work under task
// @route POST /api/tasks/:taskId/works
// @access Private
const createWork = async (req, res) => {
  const { title, description, timeRange, shareUrl } = req.body;
  const { taskId } = req.params;

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  const task = await Task.findById(taskId);
  if (!task) return res.status(404).json({ message: "Task not found" });

  let images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await uploadFromBuffer(file);
      images.push({ url: result.secure_url, publicId: result.public_id });
    }
  }

  const work = await Work.create({
    task: taskId,
    title,
    description,
    timeRange,
    shareUrl,
    images,
    createdBy: req.user._id,
  });

  // Notify ALL assigned users
  const notifyUsers = task.assignedUsers;

  if (notifyUsers.length > 0) {
    await createNotification({
      userIds: notifyUsers,
      message: `New work added under task: ${task.title} - ${title}`,
      type: "work",
      link: `/tasks/${task._id}`,
    });
  }

  res.status(201).json(work);
};

// @desc Get all works for a task
// @route GET /api/tasks/:taskId/works
// @access Private
const getWorksByTask = async (req, res) => {
  const taskId = req.params.taskId;

  if (!taskId) return res.status(400).json({ message: "Task ID is required" });

  const works = await Work.find({ task: taskId })
    .populate("createdBy", "name email display_image")
    .populate("task", "title");

  res.json(works);
};

// @desc Get single work
// @route GET /api/works/:id
// @access Private
const getWorkById = async (req, res) => {
  const work = await Work.findById(req.params.id)
    .populate("createdBy", "name email display_image")
    .populate("task", "title");

  if (!work) return res.status(404).json({ message: "Work not found" });

  res.json(work);
};

// @desc Update work (only creator)
// @route PUT /api/works/:id
// @access Private
const updateWork = async (req, res) => {
  const work = await Work.findById(req.params.id);
  if (!work) return res.status(404).json({ message: "Work not found" });

  if (work.createdBy.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Only the creator can update this work" });
  }

  const { title, description, timeRange, shareUrl, removeImagePublicIds } =
    req.body;

  if (title !== undefined) work.title = title;
  if (description !== undefined) work.description = description;
  if (timeRange !== undefined) work.timeRange = timeRange;
  if (shareUrl !== undefined) work.shareUrl = shareUrl;

  // Remove images
  let removeIds = [];
  if (removeImagePublicIds) {
    try {
      removeIds = JSON.parse(removeImagePublicIds);
    } catch (err) {
      return res
        .status(400)
        .json({ message: "Invalid removeImagePublicIds format" });
    }
  }

  if (removeIds.length > 0) {
    for (const pid of removeIds) {
      await cloudinary.uploader.destroy(pid);
    }
    work.images = work.images.filter(
      (img) => !removeIds.includes(img.publicId)
    );
  }

  // Add new images
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await uploadFromBuffer(file);
      work.images.push({ url: result.secure_url, publicId: result.public_id });
    }
  }

  const updatedWork = await work.save();

  // Notify assigned users
  const parentTask = await Task.findById(work.task);
  const notifyUsers = parentTask.assignedUsers;

  if (notifyUsers.length > 0) {
    await createNotification({
      userIds: notifyUsers,
      message: `Work updated under task: ${parentTask.title} - ${work.title}`,
      type: "work",
      link: `/tasks/${parentTask._id}`,
    });
  }

  res.json(updatedWork);
};

// @desc Delete work (only creator)
// @route DELETE /api/works/:id
// @access Private
const deleteWork = async (req, res) => {
  const work = await Work.findById(req.params.id);
  if (!work) return res.status(404).json({ message: "Work not found" });

  if (work.createdBy.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Only the creator can delete this work" });
  }

  for (const img of work.images) {
    await cloudinary.uploader.destroy(img.publicId);
  }

  const parentTask = await Task.findById(work.task);

  await work.deleteOne();

  const notifyUsers = parentTask.assignedUsers;

  if (notifyUsers.length > 0) {
    await createNotification({
      userIds: notifyUsers,
      message: `A work was deleted under task: ${parentTask.title} - ${work.title}`,
      type: "work",
      link: `/tasks/${parentTask._id}`,
    });
  }

  res.json({ message: "Work deleted" });
};

module.exports = {
  createWork,
  getWorksByTask,
  getWorkById,
  updateWork,
  deleteWork,
};
