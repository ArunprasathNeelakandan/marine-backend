const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { initializeDbAndServer } = require("../db");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads";

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const uploadFile = async (req, res) => {
  const { serialNumber } = req.body;
  const fileName = req.file.filename;
  const filePath = `/uploads/${fileName}`;
  const fullPath = path.join(__dirname, `../${filePath}`);

  if (!req.file || !serialNumber) {
    return res
      .status(400)
      .json({ message: "Both serial number and file are required." });
  }

  try {
    const db = await initializeDbAndServer();

    const existingImage = await db.get(
      "SELECT * FROM images WHERE serial_number = ?",
      [serialNumber]
    );

    if (existingImage) {
      fs.unlink(fullPath, (deleteErr) => {
        if (deleteErr) console.error("Failed to delete file:", deleteErr);
      });
      return res.status(400).json({
        message: `Serial number ${serialNumber} already exists in the database.`,
      });
    }

    await db.run(
      "INSERT INTO images (serial_number, file_name, file_path) VALUES (?, ?, ?)",
      [serialNumber, fileName, filePath]
    );

    res.status(200).json({
      message: "File uploaded successfully",
      serialNumber,
      file: req.file,
      filePath: filePath,
    });
  } catch (err) {
    console.error(err);

    res
      .status(500)
      .json({ message: "Error storing image data in the database" });
  }
};

const getAllImages = async (req, res) => {
  const db = await initializeDbAndServer();
  const quary = `SELECT * FROM images`;
  const result = await db.all(quary);
  res.status(200).json(result);
};

const sendImageBySerialNumber = async (req, res) => {
  const { serialNumber } = req.body;
  if (!serialNumber) {
    return res.status(400).json({ message: "serial nuber not found" });
  }
  const db = await initializeDbAndServer();
  const quary = "SELECT file_path FROM images WHERE serial_number = ?";
  const result = await db.get(quary, [serialNumber]);

  res.json(result);
};

const deleteImageBySerialNumber = async (req, res) => {
  const { serialNumber } = req.body;
  console.log(serialNumber);

  const db = await initializeDbAndServer();
  const query = `SELECT file_path FROM images WHERE serial_number = ?`;
  const deleteDbQuery = `DELETE FROM images WHERE serial_number = ?`;

  // Correctly await and extract file_path
  const fileData = await db.get(query, [serialNumber]);

  // Check if the file was found in the database
  if (!fileData) {
    return res.status(404).json({ message: "Image not found" });
  }

  const file_path = fileData.file_path;

  const fullPath = path.join(__dirname, `..${file_path}`); // Ensure the correct file path is used
  await db.run(deleteDbQuery, [serialNumber]);

  // Attempt to delete the file
  fs.unlink(fullPath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
      return res.status(500).json({ error: "Failed to delete file" });
    }

    res.json({ message: "File deleted successfully" });
  });
};

module.exports = {
  upload,
  uploadFile,
  getAllImages,
  sendImageBySerialNumber,
  deleteImageBySerialNumber,
};
