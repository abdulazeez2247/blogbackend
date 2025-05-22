const mongoose  = require("mongoose");

const blogSchema = mongoose.Schema(
    {
        author:{
            type:String,
            required:[true, 'please enter name of author'],
        },
        title:{
            type:String,
            required:[true, 'please enter the title of the blog'],
        },
        image:{
            type:String,
            required:[true, 'please enter the description'],
        },
        content:{
            type:String,
            required:[true, 'please enter content'],
        },
    },
    {
        timestamps:true
    }
)
const Blog = mongoose.model('blog' ,blogSchema)
module.exports = Blog