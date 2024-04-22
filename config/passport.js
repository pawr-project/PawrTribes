// load all the things we need
var TwitterStrategy = require('passport-twitter').Strategy;
var GitHubStrategy = require('passport-github').Strategy;
var RedditStrategy = require('passport-reddit').Strategy;
var DiscordStrategy = require('passport-discord').Strategy;

// load up the user model
var User = require('../models/user');

// load the auth variables
var configAuth = require('./auth'); // use this one for testing


module.exports = function (passport) {

  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  // =========================================================================
  // TWITTER =================================================================
  // =========================================================================
  /*
  passport.use(new TwitterStrategy(configAuth.twitterAuth,
    function (req, token, tokenSecret, profile, done) {

      // asynchronous
      process.nextTick(function () {

        console.log('TWITTER - ', profile);

        // check if the user is already logged in
        if (!req.user) {

          User.findOne({ 'twitter.id': profile.id }, function (err, user) {
            if (err)
              return done(err);

            if (user) {
              // if there is a user id already but no token (user was linked at one point and then removed)
              if (!user.twitter.token) {
                user.twitter.token = token;
              }

              user.twitter.username = profile.username;
              user.twitter.displayName = profile.displayName;
              user.twitter.avatar = (profile.photos[0].value || '');

              user.save(function (err) {
                if (err)
                  return done(err);

                return done(null, user);
              });

            } else {
              // if there is no user, create them
              var newUser = new User();

              newUser.twitter.id = profile.id;
              newUser.twitter.token = token;
              newUser.twitter.username = profile.username;
              newUser.twitter.displayName = profile.displayName;
              newUser.twitter.avatar = (profile.photos[0].value || '');

              newUser.save(function (err) {
                if (err)
                  return done(err);

                return done(null, newUser);
              });
            }
          });

        } else {
          // user already exists and is logged in, we have to link accounts
          var user = req.user; // pull the user out of the session

          user.twitter.id = profile.id;
          user.twitter.token = token;
          user.twitter.username = profile.username;
          user.twitter.displayName = profile.displayName;
          user.twitter.avatar = (profile.photos[0].value || '');

          user.save(function (err) {
            if (err)
              return done(err);

            return done(null, user);
          });
        }

      });

    }));
  */
  // =========================================================================
  // GitHub ==================================================================
  // =========================================================================
  console.log(configAuth);
  passport.use(new GitHubStrategy(configAuth.githubAuth,
    function (req, token, refreshToken, profile, done) {

      // asynchronous
      process.nextTick(function () {

        console.log('GITHUB - ', profile);

        // check if the user is already logged in
        if (!req.user) {

          console.log(profile);

          User.findOne({ 'github.id': profile.id }, function (err, user) {
            if (err)
              return done(err);

            if (user) {

              // if there is a user id already but no token (user was linked at one point and then removed)
              if (!user.github.token) {
                user.github.token = token;
              }

              user.github.displayName = profile.displayName;
              user.github.username = profile.username;
              user.github.avatar = (profile.photos[0].value || '');

              user.save(function (err) {
                if (err)
                  return done(err);

                return done(null, user);
              });
            } else {
              var newUser = new User();

              newUser.github.id = profile.id;
              newUser.github.token = token;
              newUser.github.displayName = profile.displayName;
              newUser.github.username = profile.username;
              newUser.github.avatar = (profile.photos[0].value || '');

              newUser.save(function (err) {
                if (err)
                  return done(err);

                return done(null, newUser);
              });
            }
          });

        } else {
          // user already exists and is logged in, we have to link accounts
          var user = req.user; // pull the user out of the session

          user.github.id = profile.id;
          user.github.token = token;
          user.github.displayName = profile.displayName;
          user.github.username = profile.username;
          user.github.avatar = (profile.photos[0].value || '');

          user.save(function (err) {
            if (err)
              return done(err);

            return done(null, user);
          });

        }

      });

    }));

    // =========================================================================
    // Reddit ==================================================================
    // =========================================================================
  /*
    passport.use(new RedditStrategy(configAuth.redditAuth,
      function (req, token, refreshToken, profile, done) {
  
        // asynchronous
        process.nextTick(function () {

          console.log('REDDIT - ', profile);
  
          // check if the user is already logged in
          if (!req.user) {
  
            console.log('REDDIT - not logged in');
  
            User.findOne({ 'reddit.id': profile.id }, function (err, user) {
              if (err)
                return done(err);
  
              if (user) {
                console.log('REDDIT - User found');
  
                // if there is a user id already but no token (user was linked at one point and then removed)
                if (!user.reddit.token) {
                  console.log('REDDIT - User has no token');
                  user.reddit.token = token;
                }

                console.log(user.reddit.avatar);

                user.reddit.name = profile.name;
                user.reddit.avatar = (profile._json.icon_img || '').replace(/&amp;/g, '&');

                console.log(user.reddit.avatar);

                user.save(function (err) {
                  if (err)
                    return done(err);

                  return done(null, user);
                });

              } else {
                console.log('REDDIT - User not found');
                var newUser = new User();
  
                newUser.reddit.id = profile.id;
                newUser.reddit.token = token;
                newUser.reddit.name = profile.name;
                newUser.reddit.avatar = (profile._json.icon_img || '').replace(/&amp;/g, '&');
  
                newUser.save(function (err) {
                  if (err)
                    return done(err);
  
                  return done(null, newUser);
                });
              }
            });
  
          } else {
            console.log('REDDIT - User is logged in');
            // user already exists and is logged in, we have to link accounts
            var user = req.user; // pull the user out of the session
  
            user.reddit.id = profile.id;
            user.reddit.token = token;
            user.reddit.name = profile.name;
            user.reddit.avatar = (profile._json.icon_img || '').replace(/&amp;/g, '&');
  
            user.save(function (err) {
              if (err)
                return done(err);
  
              return done(null, user);
            });
  
          }
  
        });
  
      }));
    */
      // =========================================================================
      // Discord =================================================================
      // =========================================================================
  /*
      passport.use(new DiscordStrategy(configAuth.discordAuth,
        function (req, token, refreshToken, profile, done) {
    
          // asynchronous
          process.nextTick(function () {

            console.log('DISCORD - ', profile);
    
            // check if the user is already logged in
            if (!req.user) {
    
              console.log('DISCORD - not logged in');
    
              User.findOne({ 'discord.id': profile.id }, function (err, user) {
                if (err)
                  return done(err);
    
                if (user) {
                  console.log('DISCORD - User found');
    
                  // if there is a user id already but no token (user was linked at one point and then removed)
                  if (!user.discord.token) {
                    console.log('DISCORD - User has no token');
                    user.discord.token = token;
                  }

                  user.discord.username = profile.username;
                  user.discord.discriminator = profile.discriminator;
                  user.discord.avatar = profile.avatar;
                  user.discord.email = profile.email;
  
                  user.save(function (err) {
                    if (err)
                      return done(err);
  
                    return done(null, user);
                  });
                } else {
                  console.log('DISCORD - User not found');
                  var newUser = new User();
    
                  newUser.discord.id = profile.id;
                  newUser.discord.token = token;
                  newUser.discord.username = profile.username;
                  newUser.discord.discriminator = profile.discriminator;
                  newUser.discord.avatar = profile.avatar;
                  newUser.discord.email = profile.email;
    
                  newUser.save(function (err) {
                    if (err)
                      return done(err);
    
                    return done(null, newUser);
                  });
                }
              });
    
            } else {
              console.log('DISCORD - User is logged in');
              // user already exists and is logged in, we have to link accounts
              var user = req.user; // pull the user out of the session
    
              user.discord.id = profile.id;
              user.discord.token = token;
              user.discord.username = profile.username;
              user.discord.discriminator = profile.discriminator;
              user.discord.avatar = profile.avatar;
              user.discord.email = profile.email;
    
              user.save(function (err) {
                if (err)
                  return done(err);
    
                return done(null, user);
              });
    
            }
    
          });
    
        }));
  */
};
