Create Note
const Note = require("../models/note.model");

const createNote = async (req, res) => {
  try {
    const { id } = req.query;

    const note = await Note.create({
      ...req.body,
      userId: id,
    });

    res.status(201).json({
      message: "Note created successfully",
      note,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

Update Note
const updateNote = async (req, res) => {
  try {
    const { id } = req.query;
    const { noteId } = req.params;

    const note = await Note.findOne({
      _id: noteId,
      userId: id,
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found or you are not the owner",
      });
    }

    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      message: "Note updated successfully",
      note: updatedNote,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

Replace Entire Note
const replaceNote = async (req, res) => {
  try {
    const { id } = req.query;
    const { noteId } = req.params;

    const note = await Note.findOne({
      _id: noteId,
      userId: id,
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found or you are not the owner",
      });
    }

    const replacedNote = await Note.findByIdAndUpdate(
      noteId,
      {
        title: req.body.title,
        content: req.body.content,
        userId: id,
      },
      {
        new: true,
        overwrite: true,
        runValidators: true,
      }
    );

    res.json({
      message: "Note replaced successfully",
      note: replacedNote,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

Update Titles of All User Notes
const updateAllTitles = async (req, res) => {
  try {
    const { id } = req.query;
    const { title } = req.body;

    const result = await Note.updateMany(
      { userId: id },
      {
        $set: {
          title,
        },
      },
      {
        runValidators: true,
      }
    );

    res.json({
      message: "All notes titles updated successfully",
      result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

Delete Single Note
const deleteNote = async (req, res) => {
  try {
    const { id } = req.query;
    const { noteId } = req.params;

    const note = await Note.findOneAndDelete({
      _id: noteId,
      userId: id,
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found or you are not the owner",
      });
    }

    res.json({
      message: "Note deleted successfully",
      note,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

Pagination + Sort
const getPaginatedNotes = async (req, res) => {
  try {
    const { id } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 3;

    const skip = (page - 1) * limit;

    const notes = await Note.find({ userId: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      page,
      limit,
      notes,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

Get Note By ID
const getNoteById = async (req, res) => {
  try {
    const { id } = req.query;
    const { noteId } = req.params;

    const note = await Note.findOne({
      _id: noteId,
      userId: id,
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    res.json({
      note,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

Get Note By Content
const getNoteByContent = async (req, res) => {
  try {
    const { id, content } = req.query;

    const note = await Note.findOne({
      userId: id,
      content,
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    res.json({
      note,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

Note With User Information
const getNotesWithUser = async (req, res) => {
  try {
    const { id } = req.query;

    const notes = await Note.find({ userId: id })
      .select("title userId createdAt")
      .populate("userId", "email");

    res.json({
      notes,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

Aggregation + Search By Title
const aggregateNotes = async (req, res) => {
  try {
    const { id, title } = req.query;

    const matchStage = {
      userId: new mongoose.Types.ObjectId(id),
    };

    if (title) {
      matchStage.title = {
        $regex: title,
        $options: "i",
      };
    }

    const notes = await Note.aggregate([
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          title: 1,
          content: 1,
          createdAt: 1,
          "user.name": 1,
          "user.email": 1,
        },
      },
    ]);

    res.json({
      notes,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

Delete All User Notes
const deleteAllNotes = async (req, res) => {
  try {
    const { id } = req.query;

    const result = await Note.deleteMany({
      userId: id,
    });

    res.json({
      message: "All notes deleted successfully",
      result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

Notes Routes
const express = require("express");

const router = express.Router();

const {
  createNote,
  updateNote,
  replaceNote,
  updateAllTitles,
  deleteNote,
  getPaginatedNotes,
  getNoteById,
  getNoteByContent,
  getNotesWithUser,
  aggregateNotes,
  deleteAllNotes,
} = require("../controllers/note.controller");

router.post("/", createNote);

router.patch("/:noteId", updateNote);

router.put("/replace/:noteId", replaceNote);

router.patch("/all", updateAllTitles);

router.delete("/:noteId", deleteNote);

router.get("/paginate-sort", getPaginatedNotes);

router.get("/note-by-content", getNoteByContent);

router.get("/note-with-user", getNotesWithUser);

router.get("/aggregate", aggregateNotes);

router.get("/:noteId", getNoteById);

router.delete("/", deleteAllNotes);

module.exports = router;

app.js
const express = require("express");
const mongoose = require("mongoose");

const userRoutes = require("./routes/user.routes");
const noteRoutes = require("./routes/note.routes");

const app = express();

app.use(express.json());

mongoose
  .connect("YOUR_MONGODB_CONNECTION_STRING")
  .then(() => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.log(error);
  });

app.use("/users", userRoutes);
app.use("/notes", noteRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
