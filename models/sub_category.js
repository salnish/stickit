const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Sub_categorySchema = new Schema({
    Sub_category: String,
    categoryId: {
        Sub_category: String,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category'
    },
    categoryName: String
})
const Sub_category = mongoose.model('Sub_category', Sub_categorySchema)
module.exports = Sub_category