const mongoose = require('mongoose');
const constants = require('../../constant')

let uri = "mongodb+srv://mariano2120398:password@cluster0.tgrsfzq.mongodb.net/database?retryWrites=true&w=majority"
uri = uri.replace('password', constants.PASSWORD)
uri = uri.replace('database', constants.DB_NAME)

const connectDB = () => {
    mongoose.connect(uri)
    .then((result)=>{
        console.log("Success")
    })
    .catch((e)=>{
        console.log(e.message)
    })
}

module.exports = {
    connectDB
};