const express = require('express')
const { register, login, getAllUsers, googleAuth } = require('../Controller/controller')
const jwtMiddleware = require('../Middleware/jwtMiddleware')
const { getUsersMessages } = require('../Controller/messageController')
const router  = new express.Router()


// API endpoint for user registration
router.post('/user/register',register)

// API endpoint for user login
router.post('/user/login',login)

// API endpoint for googleAuth
router.post('/user/googleAuth',googleAuth)

// API endpoint for user login
router.get('/existingusers',jwtMiddleware,getAllUsers)

// API endpoint for users messages
router.get('/users/messages',jwtMiddleware,getUsersMessages)




module.exports = router;
