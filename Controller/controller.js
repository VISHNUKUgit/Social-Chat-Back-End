const messages = require("../DataBase/Model/messageModel");
const users = require("../DataBase/Model/userModel");
const jwt = require('jsonwebtoken')
exports.register = async (req, res) => {
    console.log("inside register controller");
    const { username, email, password } = req.body;
    try {
        const existingUser = await users.findOne({ email });
        if (existingUser) {
            // If a user with the email already exists, return a status 406 (Not Acceptable)
            return res.status(406).json("Account already exists. Please Login...");
        } else {
            // If the email is not in use, create a new user instance and save it to the database   
            const newUser = new users({
                username,
                email,
                password
            });
            await newUser.save();

            // Return a status 200 (OK) and the newly created user
            return res.status(200).json(newUser);
        }
    } catch (error) {
        // Handle specific error types
        if (error.name === 'MongoServerError') {
            // Database error, e.g., duplicate key violation
            return res.status(400).json("Database error. Please check your input and try again.");
        } else if (error instanceof NetworkError) {
            // Network error
            return res.status(500).json("Network error. Please try again later.");
        } else {
            // Unexpected server error
            console.error("Unexpected server error:", error);
            return res.status(500).json("Unexpected server error. Please contact support.");
        }
    }
};


// Controller function for user login
exports.login = async (req, res) => {
    console.log("inside LOGIN controller");
    // Destructure the email and password from the request body
    const { email, password } = req.body;

    try {
        // Find a user with the provided email and password in the database
        const existingUser = await users.findOne({ email, password });


        if (existingUser !== null && existingUser !== undefined) {
            const token = jwt.sign({ userid: existingUser._id }, "ss9876")
            res.status(200).json({ existingUser, token })


        } else {
            // If no matching user is found, return a status 404 (Not Found) with an error message
            res.status(404).json("Incorrect email or password");
        }
    } catch (error) {
        // Handle specific error types
        if (error.name === 'MongoServerError') {
            // Database error, e.g., connection issues or query failures
            res.status(500).json("Database error. Please try again later.");
        } else if (error instanceof NetworkError) {
            // Network error
            res.status(500).json("Network error. Please try again later.");
        } else {
            // If an unexpected error occurs during the login process, return a status 500 (Internal Server Error) with a generic error message
            console.error("Unexpected error during login:", error);
            res.status(500).json("Internal Server Error. Please try again later.");
        }
    }
};





exports.getAllUsers = async (req, res) => {
  console.log("inside getAllUsers controller");
  const searchValue = req.query.search;
  const mainUser = req.payload
// console.log(mainUser);
  const query = {
    username: { $regex: searchValue, $options: "i" }
  };

  try {
    const allExistingUsers = await users.find(query);

    // Fetch last messages for each user
    const usersWithLastMessages = await Promise.all(
      allExistingUsers.map(async (user) => {
        const lastMessage = await messages.findOne({
          $or: [
            { $and: [ { sender: user._id }, { recipient: mainUser } ] },
            { $and: [ { sender: mainUser }, { recipient: user._id } ] }
          ]
        }).sort({ timestamp: -1 }).limit(1);

        const unreadMessageCount = await messages.countDocuments({
                    recipient: mainUser,
                    sender: user._id,
                    read: false
                  });    

        return {
          _id: user._id,
          username: user.username,
          email: user.email,
          lastMessage: lastMessage || null,
          unreadMessageCount: unreadMessageCount
        };
      })
    );

    if (usersWithLastMessages.length > 0) {
      res.status(200).json(usersWithLastMessages);
    } else {
      res.status(404).json([]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

