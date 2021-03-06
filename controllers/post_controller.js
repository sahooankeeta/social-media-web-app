const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");
const Notification = require("../models/notification");
const Followers = require("../models/followers");
const Following = require("../models/following");
const dotenv = require("dotenv");
const path = require("path");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const fs = require("fs");

//create a new post
module.exports.create = async function (req, res) {
  try {
    let urls = [];

    for (const file of req.files) {
      let response = await cloudinary.uploader.upload(file.path);
      urls.push({ imgId: response.public_id, imgUrl: response.secure_url });
      fs.unlinkSync(file.path);
    }
    if (urls) {
      let post = await Post.create({
        caption: req.body.caption,
        user: req.user._id,
        images: urls,
      });
    }
    req.flash("success", "New Post Created !!");
    //return;
    return res.redirect("/");
  } catch (err) {
    req.flash("error", "Error in creating post");
    console.log("err in creating post", err);
    return res.redirect("/");
  }
};
//delete a post
module.exports.destroy = async function (req, res) {
  try {
    //find post to be deleted
    let post = await Post.findById(req.params.id);
    //remove post image
    if (post.user == req.user.id) {
      for (image of post.images) {
        await cloudinary.uploader.destroy(image.imgId);
      }
      post.remove();
      //delete associated comments of post
      await Comment.deleteMany({ post: req.params.id });
      if (req.xhr) {
        return res.status(200).json({
          data: {
            post_id: req.params.id,
          },
          message: "Post deleted",
        });
      }

      req.flash("success", "post deleted");
      return res.redirect("back");
    }
  } catch (err) {
    return res.redirect("back");
  }
};
//control post like action
module.exports.toggleLike = async function (req, res) {
  try {
    let postId = req.params.id;
    let deleted = false;

    //add like if not present already
    let post = await Post.updateOne(
      { _id: postId, likes: { $ne: req.user.id } },
      {
        $push: { likes: req.user.id },
      }
    );

    if (!post.nModified) {
      if (!post.ok) {
        return res.status(500).send({ error: "Could not vote on the post." });
      }
      // Nothing was modified in the previous query meaning that the user has already liked the post
      // Remove the user's like
      const postDislikeUpdate = await Post.updateOne(
        { _id: postId },
        {
          $pull: { likes: req.user.id },
        }
      );
      deleted = true;
      if (!postDislikeUpdate.nModified) {
        return res.status(500).send({ error: "Could not vote on the post." });
      }
    }
    if (!deleted) {
      post = await Post.findById(postId).populate("user");

      if (req.user.username !== post.user.username) {
        //send notification that user has liked a post
        await Notification.create(
          {
            sender: req.user.id,
            receiver: post.user._id,
            notificationMsg: "has liked your post",
            notificationInfo: post.images[0].imgUrl,
            notificationType: "like",
          },
          (err, not) => {
            if (err) {
              return res.redirect("back");
            }
          }
        );
      }
    } else {
      post = await Post.findById(postId).populate("senderId");

      await Notification.findOneAndDelete(
        {
          sender: req.user.id,
          receiver: post.user._id,
          notificationInfo: post.images[0].imgUrl,
          notificationType: "like",
        },
        (err, not) => {
          if (err) {
            return res.redirect("back");
          }
        }
      );
    }

    return res.status(200).json({
      message: "request succesful",
      data: {
        deleted: deleted,
      },
    });
  } catch (err) {
    return res.redirect("back");
  }
};
//view the selected post
module.exports.view = async function (req, res) {
  try {
    let post = await Post.findById(req.params.id)
      .populate("user")
      .populate({
        path: "comments",
        populate: {
          path: "user",
        },
      });
    let users = await User.find({ _id: { $ne: req.user.id } });
    let nots = await Notification.find({ receiverId: req.user.id }).sort(
      "-createdAt"
    );
    let followers = await Followers.find({ user: post.user });
    let following = await Following.find({ user: post.user });
    followers = followers[0].followers;
    following = following[0].following;

    return res.render("post-view", {
      title: "post",
      post_view: post,
      all_users: users,
      notifications: nots,
      followers: followers,
      following: following,
    });
  } catch (err) {
    return res.redirect("back");
  }
};
