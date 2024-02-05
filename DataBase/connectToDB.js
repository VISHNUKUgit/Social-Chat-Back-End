// Import the Mongoose library for MongoDB interaction
const mongoose = require ('mongoose')
// Retrieve the MongoDB connection string from the environment variables
const connectionString  =  process.env.DataBase

// Connect to the MongoDB Atlas database using the retrieved connection string
mongoose.connect(connectionString)
    .then(()=>{
        // Log a success message if the connection is established
        console.log("Mongo-DB Atlas coonected with Social-chat Server");
    })
    .catch((error)=>{
        // Log an error message if the connection fails
        console.log("DataBase Connection failed ERROR:",error);
    });