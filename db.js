const mongoose = require('mongoose');
const mongoUrl = "mongodb://localhost:27017/inotebook?readPreference=primary&appname=MongoDB%20Compass&ssl=false";

const connectTOMongo = () => {
    mongoose.connect(mongoUrl, () => {
        console.log("connect to mongodb successfully")
    });

}
module.exports = connectTOMongo;