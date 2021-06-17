//const Like = require("../models/like");
const Comment = require("./../models/comment");
const Post = require("./../models/post");
// module.exports.create = async function (req, res) {
//   try {
//     let post = await Post.findById(req.body.post);
//     if (post) {
//       let comment = await Comment.create({
//         content: req.body.content,
//         post: req.body.post,
//         user: req.user._id,
//       });

//       post.comments.push(comment);
//       post.save();

//       if (req.xhr) {
//         comment = await comment.populate("user", "name").execPopulate();
//         return res.status(200).json({
//           data: {
//             comment: comment,
//           },
//           message: "post created",
//         });
//       }

//       // req.flash("success", "comment added");
//       res.redirect("/");
//     }
//   } catch (err) {
//     // req.flash("error", "error in comment add");
//     console.log("Error", err);
//     return;
//   }
// };
module.exports.create = function (req, res) {
  Post.findById(req.body.post, function (err, post) {
    if (post) {
      Comment.create(
        {
          content: req.body.content,
          post: req.body.post,
          user: req.user._id,
        },
        function (err, comment) {
          if (err) {
            console.log("err in creating comment");
            return;
          }
          post.comments.push(comment);
          post.save();
          res.redirect("/");
        }
      );
    }
  });
};
// module.exports.destroy = async function (req, res) {
//   try {
//     let comment = await Comment.findById(req.params.id);

//     if (comment.user == req.user.id) {
//       let postId = comment.post;
//       comment.remove();
//       let post = await Post.findByIdAndUpdate(postId, {
//         $pull: { comments: req.params.id },
//       });
//       await Like.deleteMany({ likeable: comment._id, onModel: "Comment" });
//       if (req.xhr) {
//         return res.status(200).json({
//           data: {
//             comment_id: req.params.id,
//           },
//           message: "post created",
//         });
//       }
//       //req.flash("success", "comment removed");
//       return res.redirect("back");
//     } else {
//       return res.redirect("back");
//     }
//   } catch (err) {
//     // req.flash("error", "error in comment removal");
//     console.log("Error", err);
//     return;
//   }
// };

module.exports.destroy = function (req, res) {
  Comment.findById(req.params.id, function (err, comment) {
    if (comment.user == req.user.id) {
      let postId = comment.post;
      comment.remove();
      Post.findByIdAndUpdate(
        postId,
        { $pull: { comments: req.params.id } },
        function (err, post) {
          return res.redirect("back");
        }
      );
    } else {
      return res.redirect("back");
    }
  });
};