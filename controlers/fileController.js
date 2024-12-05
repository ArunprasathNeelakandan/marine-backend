// // const multer = require('multer');
// // const path = require('path');
// // const fs = require('fs');


// // // Set up multer storage and file naming
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     const dir = './uploads';
// //     if (!fs.existsSync(dir)) {
// //       fs.mkdirSync(dir);
// //     }
// //     cb(null, dir);
// //   },
// //   filename: (req, file, cb) => {
// //     console.log(file)
// //     cb(null, file.originalname + path.extname(file.originalname));
// //   }
// // });

// // const upload = multer({ storage: storage });  // Multer middleware

// // // Handle the file upload logic
// // const uploadFile = (req, res) => {
// //   const {serialNumber} = req.body
// //   if (!req.file || !serialNumber) {
// //     return res.status(400).json({ message: 'Both ID and file are required.'  });
// //   }

// //   res.status(200).json({
// //     message: 'File uploaded successfully',
// //     serialNumber,
// //     file: req.file,
// //     serialNumber:`/uploads/${req.file.filename}`
// //   });
// // };


// // module.exports = {
// //   upload,
// //   uploadFile,
// //   getAllImages
// // };

// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const {initializeDbAndServer} = require('../db')

// const db = initializeDbAndServer()



// // In-memory storage for serial number and image mapping (for demonstration)


// // Set up multer storage and file naming
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const dir = './uploads';
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir);
//     }
//     cb(null, dir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));  // Unique file name
//   }
// });

// const upload = multer({ storage: storage });  // Multer middleware

// // Handle file upload and store serial number
// const uploadFile = (req, res) => {
//   const { serialNumber } = req.body;

//   if (!req.file || !serialNumber) {
//     return res.status(400).json({ message: 'Both serial number and file are required.' });
//   }

//   // Store the serialNumber and corresponding file name in an "image database"
//   imageDatabase[serialNumber] = req.file.filename;

//   res.status(200).json({
//     message: 'File uploaded successfully',
//     serialNumber,
//     file: req.file,
//     filePath: `/uploads/${req.file.filename}`,
//   });
// };

// const getAllImages = (req, res) => {
//   const uploadDir = path.join(__dirname, '../uploads');

//   // Read all files in the 'uploads' directory
//   fs.readdir(uploadDir, (err, files) => {
//       if (err) {
//           return res.status(500).send('Error reading the directory');
//       }

//       // Filter out non-image files if necessary
//       const imageFiles = files.filter(file => {
//           const extname = path.extname(file).toLowerCase();
//           return extname === '.jpg' || extname === '.jpeg' || extname === '.png' || extname === '.gif';
//       });

//       // Send the list of image files
//       res.json(imageFiles);
//   });
// };

// const sendImageBySerialNumber = (req, res) => {
//   const { serialNumber } = req.params;

//   // Check if the serial number exists in the image database
//   if (!imageDatabase[serialNumber]) {
//     return res.status(404).json({ message: 'Image not found for the provided serial number.' });
//   }

//   const filename = imageDatabase[serialNumber];
//   const filePath = path.join(__dirname, '../uploads', filename);

//   // Check if the file exists
//   fs.exists(filePath, (exists) => {
//     if (exists) {
//       // Send the image file to the client
//       res.sendFile(filePath);
//     } else {
//       // Respond with a 404 if the file doesn't exist
//       res.status(404).json({ message: 'Image file not found on the server.' });
//     }
//   });
// };


// module.exports = {
//   upload,
//   uploadFile,
//   getAllImages,
//   sendImageBySerialNumber,
// };const multer = require('multer');
const path = require('path');
const fs = require('fs');
const multer = require('multer')
const { initializeDbAndServer } = require('../db');  // Assuming `db` is initialized
const { query } = require('express');


// Set up multer storage and file naming
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir); // Create the 'uploads' directory if it doesn't exist
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));  // Unique file name
  }
});

const upload = multer({ storage: storage });  // Multer middleware


const uploadFile = async (req, res) => {
  const { serialNumber } = req.body;

  if (!req.file || !serialNumber) {
    return res.status(400).json({ message: 'Both serial number and file are required.' });
  }

  const fileName = req.file.filename;
  const filePath = `/uploads/${fileName}`;

  try {
    const db = await initializeDbAndServer()
    
    await db.run(
      'INSERT INTO images (serial_number, file_name, file_path) VALUES (?, ?, ?)',
      [serialNumber, fileName, filePath]
    );

    res.status(200).json({
      message: 'File uploaded successfully',
      serialNumber,
      file: req.file,
      filePath: filePath,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error storing image data in the database' });
  }
};


const getAllImages = async(req, res) => {
  // const uploadDir = path.join(__dirname, '../uploads');

  // fs.readdir(uploadDir, (err, files) => {
  //     if (err) {
  //         return res.status(500).send('Error reading the directory');
  //     }

      
  //     const imageFiles = files.filter(file => {
  //         const extname = path.extname(file).toLowerCase();
  //         return extname === '.jpg' || extname === '.jpeg' || extname === '.png' || extname === '.gif';
  //     });

  //     // Send the list of image files
  //     res.json(imageFiles);
  // });
  const db = await initializeDbAndServer()
  const quary = `SELECT * FROM images`
  const result = await db.all(quary)
  res.json(result)
};

// Get image by serial number
const sendImageBySerialNumber =async (req, res) => {
  const { serialNumber } = req.body;
  console.log(serialNumber)
  const db=await initializeDbAndServer()
  const quary = 'SELECT file_path FROM images WHERE serial_number = ?'
  const result = await db.get(quary,[serialNumber])
  

  res.json(result)
};

module.exports = {
  upload,
  uploadFile,
  getAllImages,
  sendImageBySerialNumber,
};
