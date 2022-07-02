const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new Schema({
    productName: String,
    price: Number,
    description: String,
    discount: Number,
    dimension: String,
    stock: Number,
    Sub_Category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sub_category',
        require: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        require: true,
    },
    image: String,
    productType: {
        type: String,
        default: "New Arrival"
    }

})
const Product = mongoose.model('product', productSchema)
module.exports = Product