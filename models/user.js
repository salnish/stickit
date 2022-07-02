const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
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
    block: Boolean,
    address: [{
        fname: String,
        lname: String,
        house: String,
        locality:String,
        towncity: String,
        district: String,
        state: String,
        pincode: Number,
        email: String,
        mobile: String
    }],

    created_at: { type: Date, required: true, default: Date.now }
})
const User = mongoose.model('user', UserSchema)
module.exports = User
