const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        min: [3, 'Must be at least 3, got {VALUE}']
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
    picture:{
        type: String,
        default: 'default_profile_picture.jpg'
    }
   

});

const users = mongoose.model('users', userSchema);

module.exports = users;