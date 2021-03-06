//console.log("runnung");
const forgotPassword = document.querySelector(".forgot-password");
const search = document.querySelector(".header-search");

if (search) {
  search.addEventListener("submit", function (e) {
    e.preventDefault();
  });
}

if (forgotPassword) {
  forgotPassword.addEventListener("click", function () {
    document.querySelector(".resetForm").classList.toggle("hide");
    document.querySelector(".signIn-form").classList.toggle("hide");
    document.querySelector(".overlay-signup a").innerHTML = "sign in";
    document.querySelector(".overlay-signup a").href = "/users/sign-in";
  });
}
document.addEventListener("click", function (e) {
  if (e.target.getAttribute("class") == "post-stats-comment") {
    let comment = e.target.parentNode.parentNode.parentNode.nextElementSibling;

    comment.querySelector(".emojionearea-editor").focus();
  }
});
