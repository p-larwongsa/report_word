module.exports = function(app) {
  var request = require('request');
  var users = app.models.user;
  
  const CLIENT_ID = "70114818671-0eh6dgjq1fbl1s4j26a3unhukpvi7ars.apps.googleusercontent.com";
  const CLIENT_SECRET = "RX-GqHqsEWRMk1fmLnv-h7iT";
  const REDIRECT_URL = "http://localhost:3000/auth/google/callback";
 
 app.get('/', function(req, res) {
    //console.log(req.cookies);
    var user = {};
    user.email = req.cookies['email'];
    user.username = req.cookies['username'];
    user.officeName = req.cookies['office_Name'];
    user.agencyName = req.cookies['agency_Name'];
    if(!req.cookies['access_token']){
      res.render('pages/index.html');
    }else{
      res.render('pages/index.html', { user : user });
    }
  });
  

  app.get('/login', function(req, res, next) {
  var google = require('googleapis');
  var OAuth2 = google.auth.OAuth2;
  var plus = google.plus('v1');

  var oauth2Client = new OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
  );

  var scopes = [
      "https://www.googleapis.com/auth/userinfo.email"
    ];

  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
    scope: scopes, // If you only need one scope you can pass it as a string
  });

  //res.render('pages/index', { url: url });
  console.log(url);
  res.redirect(url);
});

// google callback 
app.get('/auth/google/callback', function(req, res, next) {
  console.log(req.query);
  //var thecode=req.query.code;
  var code = req.query.code;
  var google = require('googleapis');
  var OAuth2 = google.auth.OAuth2;

  var oauth2Client = new OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
  );

  oauth2Client.getToken(code, function (err, tokens) {
  // Now tokens contains an access_token and an optional refresh_token. Save them.
  console.log('get_token : '+tokens);
  var accessToken = tokens.access_token;
  console.log('acctoken : '+accessToken);

  var url="https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token="+accessToken;
  request(url, function (error, response, body){
      console.log('error:', error); // Print the error if one occurred 
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
      console.log('body:', body); 

  var body_obj=JSON.parse(body);

  var emp_gmail = body_obj.email;
  var url_emp = "http://flowto.rid.go.th/api/Empemails/getaccount/"+emp_gmail;
  request(url_emp, function (error, response, body){
      console.log('error:', error); // Print the error if one occurred 
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
      console.log('body:', body);
      // don't have email in Emp_email
      if(response && response.statusCode != 200){
        res.redirect('/')
      }else{    // have email in Emp_email
        var emp_data = JSON.parse(body);
        //console.log(emp_data.Account.email);

        var data = emp_data.Account.email.split('@');
        var username = data[0];
        //console.log(username);
      
        var newUser = {};
        newUser.email=emp_data.Account.email;
        newUser.username= username; //split email
        newUser.password="owlahedwig";

        var filter={
          where:{"email":emp_data.Account.email} 
        };

        users.find(filter, function(err, theUser) {
          if(err) {
            console.log("nothing user")
          }else{
            if(theUser.length>0){ // have account
              users.login(newUser, function (err, accessToken) {
                console.log('user_token : '+JSON.stringify(accessToken.id)); 
                console.log(accessToken.id);      // => GOkZRwg... the access token
                console.log(accessToken.ttl);     // => 1209600 time to live
                console.log(accessToken.created); // => 2013-12-20T21:10:20.377Z
                console.log(accessToken.userId);

              res.cookie('access_token',accessToken.id);
              res.cookie('username', newUser.username);
              res.cookie('email', newUser.email);
              res.cookie('userId', accessToken.userId);
              res.cookie('office_Name', emp_data.Account.ORG_NAME);
              res.cookie('agency_Name', emp_data.Account.ORG_NAME1);
              res.redirect('/');
              }); // login
            }else{ // not have account
              users.create(newUser, function(err, user) {
                  console.log(user);
                users.login(newUser, function (err, accessToken) {
                  console.log('user_token : '+JSON.stringify(accessToken.id)); 
                  console.log(accessToken.id);      // => GOkZRwg... the access token
                  console.log(accessToken.ttl);     // => 1209600 time to live
                  console.log(accessToken.created); // => 2013-12-20T21:10:20.377Z
                  console.log(accessToken.userId);  
                
                res.cookie('access_token',accessToken.id);
                res.cookie('username', newUser.username);
                res.cookie('email', newUser.email);
                res.cookie('userId', accessToken.userId);
                res.cookie('office_Name', emp_data.Account.ORG_NAME);
                res.cookie('agency_Name', emp_data.Account.ORG_NAME1);
                res.redirect('/');
                }); // login
              }); // create
            }
          } // bigger else
        }); // user filter
      }
      }); // request
});
    }); // google get token
  });  // google callback

  //test login and check email
  app.get('/user', function(req, res, next) {
      var newUser = {};
        newUser.email="irrigation.wag@gmail.com";
        newUser.username= "irrigation.wag"; //split email
        newUser.password="owlahedwig";

        var filter={
          where:{"email":"irrigation.wag@gmail.com"} 
        };

        users.find(filter, function(err, theUser) {
          if(err) {
            console.log("nothing user")
          }else{
            if(theUser.length>0){ // have account
              users.login(newUser, function (err, accessToken) {
                console.log('user_token : '+JSON.stringify(accessToken.id)); 
                console.log(accessToken.id);      // => GOkZRwg... the access token
                console.log(accessToken.ttl);     // => 1209600 time to live
                console.log(accessToken.created); // => 2013-12-20T21:10:20.377Z
                console.log(accessToken.userId);

              res.cookie('access_token',accessToken.id);
              res.cookie('username', newUser.username);
              res.cookie('email', newUser.email);
              res.cookie('userId', accessToken.userId);
              res.redirect('/');
              }); // login
            }else{ // not have account
              users.create(newUser, function(err, user) {
                  console.log(user);
                users.login(newUser, function (err, accessToken) {
                  console.log('user_token : '+JSON.stringify(accessToken.id)); 
                  console.log(accessToken.id);      // => GOkZRwg... the access token
                  console.log(accessToken.ttl);     // => 1209600 time to live
                  console.log(accessToken.created); // => 2013-12-20T21:10:20.377Z
                  console.log(accessToken.userId);  
                
                res.cookie('access_token',accessToken.id);
                res.cookie('username', newUser.username);
                res.cookie('email', newUser.email);
                res.cookie('userId', accessToken.userId);
                res.redirect('/');
                }); // login
              }); // create
            }
          } // bigger else
        }); // user filter
  }); // get /user

 //log a user out
  app.get('/logout', function(req, res, next) {
    console.log('accessToken : '+req.accessToken);
    console.log('ck-acctk : '+req.cookies['access_token']);
    if (!req.cookies['access_token']) {
      return res.sendStatus(401);
    }else{
      res.clearCookie('access_token');
      res.clearCookie('username');
      res.clearCookie('email');
      res.clearCookie('userId');
      res.clearCookie('office_Name');
      res.clearCookie('agency_Name');
      users.logout(req.cookies['access_token'], function(err) {
        if (err) return next(err);
        res.redirect('https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://localhost:3000/'); //on successful logout, redirect
      }); // logout loopback
    } // else
  }); //get logout

app.get('/img', function(req,res){
  res.render('pages/img.html');
});

app.get('/date', function(req,res){
  res.render('pages/date.html');
});

app.get('/date2', function(req,res){
  res.render('pages/date2.html');
});

}