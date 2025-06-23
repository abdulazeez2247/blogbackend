const express = require('express')
const mongodb = require('mongodb')
const mongoose = require('mongoose')
const Blog = require('../model/blogmodel')
const router = require('../route/BlogRoute')
const dotenv = require('dotenv').config()
const cors = require('cors')
const app = express()
const port = 5000


app.use(express.json())
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const allowedOrigins = ["http://localhost:5173" , "https://staticblog-seven.vercel.app"]

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use('/api' , router)

app.get('/', (req, res)=>{
    res.send('This is the homepage')
})

mongoose.connect(process.env.MONGODB_URL).then(()=>{
    console.log('mongodb connected succesfully');
    app.listen(port, ()=>{
        console.log(`server is running on port ${port}`);
    })
    
})
.catch((error)=>{
    console.log('message' ,error.message);
    
})
