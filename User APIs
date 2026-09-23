1- User Schema
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
      min: 18,
      max: 60,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
2-Note Schema + Custom Validator
const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,

      validate: {
        validator: function (value) {
          return value !== value.toUpperCase();
        },
        message: "Title must not be entirely uppercase",
      },
    },

    content: {
      type: String,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Note", noteSchema);

Signup
const User = require("../models/user.model");

const signup = async (req, res) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    const user = await User.create(req.body);

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

Login

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

Update User
const updateUser = async (req, res) => {
  try {
    const { id } = req.query;
    const { email, password, ...updates } = req.body;

    if (password) {
      return res.status(400).json({
        message: "Password cannot be updated",
      });
    }

    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: id },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "Email already exists",
        });
      }

      updates.email = email;
    }

    const user = await User.findByIdAndUpdate(
      id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

Delete User
const deleteUser = async (req, res) => {
  try {
    const { id } = req.query;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "User deleted successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

Get User
const getUser = async (req, res) => {
  try {
    const { id } = req.query;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

User Routes
const express = require("express");

const router = express.Router();

const {
  signup,
  login,
  updateUser,
  deleteUser,
  getUser,
} = require("../controllers/user.controller");

router.post("/signup", signup);
router.post("/login", login);
router.patch("/:id", updateUser);
router.delete("/", deleteUser);
router.get("/", getUser);

module.exports = router;

