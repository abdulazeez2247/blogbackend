const express = require('express')
const { createBlogs, getallBlogs, getoneBlog, editoneBlog, deleteoneBlog } = require('../controller/BlogController')
const { registerUser, verifyOtp, resendOTP, loginUser, forgotpassword, createnewpassword } = require('../controller/UserController')
const router = express.Router()

router.post('/blog' , createBlogs)
router.get('/getallblogs' , getallBlogs)
router.get('/getoneblog/:id' , getoneBlog)
router.put('/editoneblog/:id' , editoneBlog)
router.delete('/deleteoneblog/:id' , deleteoneBlog)
router.post('/register' , registerUser)
router.post('/verify' , verifyOtp)
router.post('/resend' , resendOTP)
router.post('/login' , loginUser)
router.post('/forgetpassword', forgotpassword)
router.post('/newpassword', createnewpassword )

module.exports = router