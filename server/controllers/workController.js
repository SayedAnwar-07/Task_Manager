const Work = require("../models/Work");
const Task = require("../models/Task");
const cloudinary = require("../config/cloudinary");

// helper: upload single file buffer to Cloudinary
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
  const { title, description, timeRange } = req.body;
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
    images,
    createdBy: req.user._id,
  });

  res.status(201).json(work);
};

// @desc Get all works for a task
// @route GET /api/tasks/:taskId/works
// @access Private
const getWorksByTask = async (req, res) => {
  const { taskId } = req.params;

  const works = await Work.find({ task: taskId })
    .populate("createdBy", "name email")
    .populate("task", "title");
  res.json(works);
};

// @desc Get single work
// @route GET /api/works/:id
// @access Private
const getWorkById = async (req, res) => {
  const work = await Work.findById(req.params.id)
    .populate("createdBy", "name email")
    .populate("task", "title");
  if (!work) return res.status(404).json({ message: "Work not found" });
  res.json(work);
};

// @desc Update work (only creator)
// @route PUT /api/works/:id
// @access Private
// Body can include removeImagePublicIds: [string] to delete some images
const updateWork = async (req, res) => {
  const work = await Work.findById(req.params.id);
  if (!work) return res.status(404).json({ message: "Work not found" });

  if (work.createdBy.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Only the creator can update this work" });
  }

  const { title, description, timeRange, removeImagePublicIds } = req.body;

  if (title !== undefined) work.title = title;
  if (description !== undefined) work.description = description;
  if (timeRange !== undefined) work.timeRange = timeRange;

  // remove selected images
  if (removeImagePublicIds && Array.isArray(removeImagePublicIds)) {
    for (const publicId of removeImagePublicIds) {
      await cloudinary.uploader.destroy(publicId);
    }
    work.images = work.images.filter(
      (img) => !removeImagePublicIds.includes(img.publicId)
    );
  }

  // add new images (append)
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await uploadFromBuffer(file);
      work.images.push({ url: result.secure_url, publicId: result.public_id });
    }
  }

  const updatedWork = await work.save();
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

  // delete images from Cloudinary
  for (const img of work.images) {
    await cloudinary.uploader.destroy(img.publicId);
  }

  await work.deleteOne();
  res.json({ message: "Work deleted" });
};

module.exports = {
  createWork,
  getWorksByTask,
  getWorkById,
  updateWork,
  deleteWork,
};
