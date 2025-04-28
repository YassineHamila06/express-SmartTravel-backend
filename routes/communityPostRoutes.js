const express = require('express');
const router = express.Router();
const {
    createPost,
    getPosts,
    likePost,
    addComment,
    getComments,
} = require('../controllers/communityPostController');
const validateToken = require("../controllers/middleware/validateTokenhandller");
const { uploadCommunityPostImage } = require("../controllers/middleware/uploadMiddleware");

router.post('/add', validateToken, uploadCommunityPostImage.single('image'), createPost);
router.get('/get', getPosts);
router.patch("/:postId/like", validateToken, likePost);
router.post("/:postId/comment", validateToken, addComment);
router.get("/:postId/comments", getComments);

module.exports = router;
