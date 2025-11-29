import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { nanoid } from "nanoid";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// DB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connected successfully!"))
  .catch((err) => console.log("DB Connection Failed!", err));

// Schema definition
const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: String,
  clicks: { type: Number, default: 0 },
});

const Url = mongoose.model("Url", urlSchema);

// API Endpoints

// 1. to create a short url
app.post("/api/short", async (req, res) => {
  try {
    const { originalUrl } = req.body;

    // Check if empty
    if (!originalUrl) {
      return res.status(400).json({ message: "URL is required!" });
    }

    // URL Validation function
    const isValidUrl = (url) => {
      try {
        new URL(url);
        return true;
      } catch (err) {
        return false;
      }
    };

    // Validate URL format
    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ message: "Invalid URL format!" });
    }

    // Prevent duplicate entries
    const existing = await Url.findOne({ originalUrl });
    if (existing) {
      return res.status(200).json({
        message: "Short URL already exists",
        url: existing,
      });
    }

    // Generate short URL
    const shortUrl = nanoid(process.env.DEFAULT_SHORT_URL_LENGTH);

    const url = new Url({ originalUrl, shortUrl });
    await url.save();

    return res.status(200).json({ message: "Short URL Generated", url });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong, please check console for more info!",
    });
  }
});

// 2. to redirect the click

app.get("/:shortUrl", async (req, res) => {
  try {
    const { shortUrl } = req.params;
    const url = await Url.findOne({ shortUrl });
    if (url) {
      console.log("This is the url:", url);
      url.clicks++;
      await url.save();
      return res.redirect(url.originalUrl);
    } else {
      return res.redirect(404).json({ error: "Url not found!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong, please check console for more info!",
    });
  }
});

// Backend server startup
app.listen(process.env.DEFAULT_PORT, () =>
  console.log(`Backend server running on port ${process.env.DEFAULT_PORT}`)
);
