const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

// Path to your database file
const dbPath = path.join(__dirname, 'marine.db');

let db;

const initializeDbAndServer = async() => {
    try {
        db = await open({
            filename:dbPath,
            driver:sqlite3.Database
        })
        return db
        
    } catch (error) {
        console.log(error)
    }
}

initializeDbAndServer()


module.exports = { db,initializeDbAndServer };

// Export the database connection and initialization function
