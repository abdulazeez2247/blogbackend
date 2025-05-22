const express = require('express')
const mongodb = require('mongodb')
const mongoose = require('mongoose')
const Blog = require('./model/blogmodel')
const router = require('./route/BlogRoute')
const dotenv = require('dotenv').config()
const cors = require('cors')
const app = express()
const port = 5000



app.use(express.json())
app.use(cors(
    {
        origin:"http://localhost:5173"
    }
))
app.use(router)

app.get('/', (req, res)=>{
    res.send('This is the homepage')

})
mongoose.connect(process.env.mongodb_url).then(()=>{
    console.log('mongodb connected succesfully');
    app.listen(port, ()=>{
        console.log(`server is running on port ${port}`);
    })
    
})
.catch((error)=>{
    console.log(error);
    
})
