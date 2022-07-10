const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    products: [{
        pro_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            required: true
        },
        productName:{
            type:String
        },
        price: {
            type: Number
        },
        quantity: {
            type: Number,
            default: 1

        },
        subtotal: {
            type: Number
        }

    }]
})
const cart = mongoose.model('cart', cartSchema)
module.exports = cart