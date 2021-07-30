const passport = require("passport");
const googleStrategy = require("passport-google-oauth").OAuth2Strategy;
const crypto = require("crypto");
const User = require("../models/user");
const nodeMailer = require("../config/nodemailer");
//tell passport to use new strategy for google auth login
passport.use(
  new googleStrategy(
    {
      clientID:
        "512567201790-5t41oi6a6prpn4gumgj6q8shs14on8pk.apps.googleusercontent.com",
      clientSecret: "u2hkaQOB0SJtZyISj0E6vWsI",
      callbackURL: "http://localhost:8000/users/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      //find user
      User.findOne({ email: profile.emails[0].value }).exec(function (
        err,
        user
      ) {
        if (err) {
          console.log("eoor is strategr");
          return;
        }

        if (user) {
          return done(null, user);
        } else {
          //if user not found,create user and set it as logged in user
          User.create(
            {
              name: profile.displayName,
              username: profile.displayName.replace(/ /g, ""),
              email: profile.emails[0].value,
              password: crypto.randomBytes(20).toString("hex"),
            },
            function (err, user) {
              if (err) {
                console.log("error in strategy", err);
                return;
              }
              //if new user created send confirmation mail
              nodeMailer.transporter.sendMail(
                {
                  from: "noreply@hello.com",
                  to: user.email,
                  subject: "Welcome To Instagram-Clone",
                  html: "<h1>enjoy your experiance :)</h1>",
                },
                (err, info) => {
                  if (err) {
                    console.log("err in sending mail", err);
                    return;
                  }

                  return;
                }
              );
              return done(null, user);
            }
          );
        }
      });
    }
  )
);

module.exports = passport;
