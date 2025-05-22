const Blog = require("../model/blogmodel");

const createBlogs = async (req,res) =>{
    try {
            const newblog =await Blog.create(req.body)
            return res.status(201).json({newblog})
        } catch (error) {
            return res.status(500).json({message:error.message})
        }
}
const getallBlogs = async (req,res) =>{
    try {
        const newblog = await Blog.find()
        return res.status(200).json({newblog})
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}
const getoneBlog = async (req,res) =>{
    try {
            const {id} = req.params;
            const newblog = await Blog.findById(id)
            if (!Blog) {
                return res.status(404).json({message: 'Blog not found'})
            }
            return res.status(200).json({newblog})
        } catch (error) {
            return res.status(500).json({message:error.message})
        }
}
const editoneBlog = async (req,res) =>{
    try {
            const {id} = req.params;
            const newblog = await Blog.findByIdAndUpdate(id, req.body)
            if (!Blog) {
                return res.status(404).json({message: 'Blog not found'})
            }
            return res.status(200).json({newblog})
        } catch (error) {
            return res.status(500).json({message: error.message})
        }
}
const deleteoneBlog = async (req,res) =>{
    try {
            const {id} = req.params;
            const newblog = await Blog.findByIdAndDelete(id)
            if (!Blog) {
                return res.status(404).json({message: 'Blog not found'})            
            }
            return res.status(200).json({newblog})
        } catch (error) {
            return res.status(500).json({message: error.message})
        }
}
module.exports = {createBlogs, getallBlogs, getoneBlog, editoneBlog, deleteoneBlog}