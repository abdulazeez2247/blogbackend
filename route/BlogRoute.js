const express = require('express')
const { createBlogs, getallBlogs, getoneBlog, editoneBlog, deleteoneBlog } = require('../controller/BlogController')
const router = express.Router()

router.post('/api/blog' , createBlogs)
router.get('/api/getallblogs' , getallBlogs)
router.get('/api/getoneblog/:id' , getoneBlog)
router.put('/api/editoneblog/:id' , editoneBlog)
router.delete('/api/deleteoneblog/:id' , deleteoneBlog)

module.exports = router