import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { nanoid } from "nanoid";
import dotenv from "dotenv";
import QRCode from "qrcode";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- DB CONNECTION ----------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connected Successfully!"))
  .catch((err) => console.log("DB Connection Failed!", err));

// ---------------- SCHEMA ----------------
const urlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortUrl: { type: String, required: true, unique: true }, // store only nano id
  qrCodeImg: { type: String, required: true },
  clicks: { type: Number, default: 0 },
});

const Url = mongoose.model("Url", urlSchema);

// ---------------- HELPER FUNCTION ----------------
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// ---------------- API ROUTES ----------------

// CREATE SHORT URL
app.post("/api/short", async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ message: "URL is required!" });
    }

    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ message: "Invalid URL format!" });
    }

    // Check duplicate
    const existing = await Url.findOne({ originalUrl });

    if (existing) {
      return res.status(200).json({
        message: "Short URL already exists",
        shortUrl: process.env.APP_URL + existing.shortUrl,
        qrCodeImg: existing.qrCodeImg,
      });
    }

    // Generate new
    const shortUrlCode = nanoid(Number(process.env.DEFAULT_SHORT_URL_LENGTH));
    const fullShortUrl = process.env.APP_URL + shortUrlCode;
    const qrCodeImg = await QRCode.toDataURL(fullShortUrl);

    const newUrl = new Url({
      originalUrl,
      shortUrl: shortUrlCode,
      qrCodeImg,
    });

    await newUrl.save();

    return res.status(200).json({
      message: "Short URL Generated",
      shortUrl: fullShortUrl,
      qrCodeImg,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong, please check console!",
    });
  }
});

// REDIRECT SHORT URL
app.get("/:shortUrl", async (req, res) => {
  try {
    const { shortUrl } = req.params;

    const url = await Url.findOne({ shortUrl });

    if (!url) {
      return res.status(404).json({ error: "URL not found!" });
    }

    url.clicks++;
    await url.save();

    return res.redirect(url.originalUrl);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error occurred",
    });
  }
});

// ---------------- SERVER ----------------
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
