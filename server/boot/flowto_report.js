module.exports = function(app) {
  var request = require('request');
  var fs = require('fs');
  var moment = require('moment');
  var reports =  app.models.Report;
  var projects =  app.models.Project;

/* ------------ Flowto Project ----------- */

app.get('/projectPage',function(req, res, next) {
  console.log(req.cookies);
  console.log('cookies_accTK : '+req.cookies['access_token']);
  console.log('cookies_username : '+req.cookies['username']);
  var user = {};
    user.email = req.cookies['email'];
    user.username = req.cookies['username'];
    user.officeName = req.cookies['office_Name'];
    user.agencyName = req.cookies['agency_Name'];
    if(!req.cookies['access_token']){
      return res.sendStatus(401);
    }else{

      projects.find({},function(err,data){
        var lists = data;
        console.log(lists);
        res.render('pages/project.html', { user: user ,lists : lists});   
      });      
    }
});

app.post('/add',function(req, res, next) {
  console.log(req.body.name);
  console.log(req.body.action);
  console.log(req.body);

  if(!req.cookies['access_token']){
    return res.sendStatus(401);
  }else{
     //var date = moment().format().replace(/T/, ' ');      // replace T with a space
    var date = moment().format();               
    console.log(date);
    var theProject = {
      "name" : req.body.name,
      "project_date" : date,
      "user_id" : req.cookies['userId']
    };
    projects.upsert(theProject, function(err, callback) {
      //console.log(callback);
      res.redirect('/projectPage');  
    });
  }
});  // post data to report model (/add)
 
app.get('/chkdelete',function(req, res, next) {
  console.log(req.query.id);
  var id =  req.query.id;
 
  projects.findById(id, function(err, callback) {
    console.log(callback);
    res.send(callback);
    console.log('delete');
  });
});

app.post('/delete',function(req, res, next) {
  projects.destroyById(req.body.delid, function(err, callback) {
    console.log(callback);
    console.log('Delete');
    res.redirect('/projectPage'); 
  });

});

app.get('/TheProject',function(req, res, next) {
  console.log(req.query.id); 
  var id =  req.query.id; // project id
  projects.findById(id, function(err, callback) {
    console.log(callback);
    var data = callback;
    var user = {};
    user.email = req.cookies['email'];
    user.username = req.cookies['username'];
    user.officeName = req.cookies['office_Name'];
    user.agencyName = req.cookies['agency_Name'];
    
    var filter={
          where:{"projectId": data.id}
        };
    var projectId = data.id;
    var projectName = data.name
    reports.find(filter, function(err, data) {
      console.log("TheProject"+JSON.stringify(data));
      console.log(req.cookies);
      var RPobj = {};
      RPobj.meta= {projectId : projectId};
      RPobj.data = data;
      RPobj.name = {projectName : projectName}
      res.render('pages/report.html', {user: user , RPobj : RPobj});
    });

  });
});

/*-------- Flowto Report ----------*/

app.post('/addReport',function(req, res, next) {
  console.log(req.body);
  if(!req.cookies['access_token']){
    return res.sendStatus(401);
  }else{
    var date = moment().format();
    var theReport = {
      "title" : req.body.title,
      "user_id" : req.cookies['userId'],
      "projectId" : req.body.project_id,
      "created" : date
    };
    reports.upsert(theReport, function(err, callback) {
      console.log(callback);
      res.redirect('/TheProject?id='+callback.projectId);  
    });
  }
});  // post data to report model (/add)
 
app.get('/chkdelRP',function(req, res, next) {
  console.log(req.query.id);
  var id =  req.query.id;
 
  reports.findById(id, function(err, callback) {
    console.log(callback);
    res.send(callback);
    console.log('delete');
  });
});

app.post('/deleteReport',function(req, res, next) {
  console.log("deleteReport pro_id "+req.body.pro_id);
  reports.destroyById(req.body.delid, function(err){
    if(err){
      console.log("err "+err);
    }else{
      console.log('Delete');
      res.redirect('/TheProject?id='+req.body.pro_id); 
    }  
  }); 
});

app.get('/modify',function(req, res, next) {
  console.log(req.query.id);
  var id =  req.query.id;
  reports.findById(id, function(err, callback) {
    console.log(callback);
    var data = callback;   
    var user = {};
    user.email = req.cookies['email'];
    user.username = req.cookies['username'];
    user.officeName = req.cookies['office_Name'];
    user.agencyName = req.cookies['agency_Name'];

    console.log(req.cookies);
    if(req.cookies['userId'] != data.user_id){
      console.log("userId is loggin in : "+ req.cookies['userId']);
      console.log("userId was created : "+data.user_id);
      // ให้ alert ว่า ไม่สามารถแก้ไขได้เนื่องจากไม่ใช่เจ้าของรายงานนี้
      res.redirect('/TheProject?id='+data.projectId);  
    }else{
      res.render('pages/modify.html', {user: user , data : data});
    }   
  });
});

app.post('/cksave',function(req, res) {
  console.log(req.body);
  var data = req.body.description;

//var date = moment().format();
  var theReport = {
    "id" : req.body.RP_id,
    "user_id" : req.cookies['userId'],
    "projectId" : req.body.project_id,
    "description" : data
  };
  console.log(theReport);
  reports.upsert(theReport, function(err, callback) {
    console.log(callback);
    res.redirect('/TheProject?id='+callback.projectId);  
    //res.redirect('/projectPage');
  });

});

app.get('/view_report', function(req, res) {
  console.log(req.query.id);
  var id =  req.query.id;
  var user = {};
  user.email = req.cookies['email'];
  user.username = req.cookies['username'];
  user.officeName = req.cookies['office_Name'];
  user.agencyName = req.cookies['agency_Name'];

  reports.findById(id, function(err, callback) {
    console.log('view_report ' + callback);
    var RBbody = callback;
  
    res.render('pages/view_report.html', { user : user, RBbody : RBbody});
  });
});


}