const asyncHandler = require("express-async-handler");
const CommunityPost = require("../models/communityPostModel");

// Create a post
const createPost = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const image = req.file?.path;
  const userId = req.user.id;

  if (!text && !image) {
    res.status(400);
    throw new Error("Post must have text or image.");
  }

  const post = await CommunityPost.create({
    user: userId,
    text,
    image,
  });

  res.status(201).json({ success: true, data: post });
});

// Get all posts
const getPosts = asyncHandler(async (req, res) => {
  const posts = await CommunityPost.find()
    .populate("user", "name profileImage")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: posts });
});

// Like or Unlike a post
const likePost = asyncHandler(async (req, res) => {
  const post = await CommunityPost.findById(req.params.postId);
  if (!post) {
    res.status(404);
    throw new Error("Post not found.");
  }

  const userId = req.user.id;
  const liked = post.likes.includes(userId);

  if (liked) {
    post.likes.pull(userId);
  } else {
    post.likes.push(userId);
  }

  await post.save();
  res.status(200).json({ success: true, liked: !liked, likesCount: post.likes.length });
});

// Add a comment
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) {
    res.status(400);
    throw new Error("Comment text is required.");
  }

  const post = await CommunityPost.findById(req.params.postId);
  if (!post) {
    res.status(404);
    throw new Error("Post not found.");
  }

  post.comments.push({
    user: req.user.id,
    text,
  });

  await post.save();
  res.status(201).json({ success: true, data: post.comments });
});

// Get comments of a post
const getComments = asyncHandler(async (req, res) => {
  const post = await CommunityPost.findById(req.params.postId)
    .populate("comments.user", "name profileImage");

  if (!post) {
    res.status(404);
    throw new Error("Post not found.");
  }

  res.status(200).json({ success: true, data: post.comments });
});

module.exports = {
  createPost,
  getPosts,
  likePost,
  addComment,
  getComments,
};
