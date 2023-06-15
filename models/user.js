const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    dishId: {
        type: Array,
        required: true
    }
});

module.exports = mongoose.model('User', UserSchema)