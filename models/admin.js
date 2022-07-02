const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AdminSchema = new Schema({
    name: String,
    mobile: Number,
    email: String,
    password: String,

})
const Admin = mongoose.model('admin', AdminSchema)
module.exports = Admin