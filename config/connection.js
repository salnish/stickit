const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/stickit", {
    useNewUrlParser: true
}).then(() => {
    console.log('connection Successfull okkk')
}).catch((e) => {
    console.log('No Connection');
    console.log(e);
})