class ToggleFollow {
  constructor(toggleElement) {
    this.toggler = toggleElement;
    this.toggleFollow();
  }

  toggleFollow() {
    $(this.toggler).click(function (e) {
      e.preventDefault();
      let self = this;
      //console.log("preventing default");

      $.ajax({
        type: "POST",
        url: $(self).attr("href"),
      })
        .done(function (data) {
          let followersCount = parseInt($(self).attr("data-followers"));

          if (data.data.unfollowed == true) {
            followersCount -= 1;
            $(self).html("follow");
          } else {
            followersCount += 1;

            if ($(self).html() == "confirm") {
              $(self)
                .closest(".notification-item")
                .children(".notification-content")
                .children(".notification-text")
                .html("has started following you");
              $(self).closest(".notification-info").remove();
            } else $(self).html("unfollow");
          }
          $(self).attr("data-followers", followersCount);
          if (window.location.href.indexOf("profile") > -1) {
            $(self)
              .parent()
              .next()
              .children(".stat-followers")
              .children(".followers-unit")
              .html(followersCount);
          }
        })
        .fail(function (errData) {
          //console.log("error in completing the request");
        });
    });
  }
}
