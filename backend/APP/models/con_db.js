const mongoose = require('mongoose');
const constants = require('../../constant')

let uri = "mongodb+srv://healthy:password@ceuhealthy.j4pmifm.mongodb.net/database?retryWrites=true&w=majority&appName=ceuhealthy"

uri = uri.replace('password', constants.PASSWORD)
uri = uri.replace('database', constants.DB_NAME)

const connectDB = () => {
    mongoose.connect(uri)
        .then((result) => {
            console.log("Success")
        })
        .catch((e) => {
            console.log(e.message)
        })
}

module.exports = {
    connectDB
};