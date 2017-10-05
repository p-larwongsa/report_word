module.exports = function(app) {
  var request = require('request');
  var fs = require('fs');
  var moment = require('moment');
  var multer  = require('multer');
  var options = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'+moment().format('MMMM'));
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  var upload = multer({storage: options});
  var form1 = app.models.Form1;
  var form2 = app.models.Form2;
  var rid_office = app.models.rid_office;
  var rid_agency = app.models.rid_agency;
  var uploads = app.models.Uploads;

/* ------------- Form ----------------- */

app.get('/formPage',function(req, res, next) {
  console.log(req.cookies);
  if(req.cookies['email']){
    var user = {};
    user.email = req.cookies['email'];
    user.username = req.cookies['username'];
    user.officeName = req.cookies['office_Name'];
    user.agencyName = req.cookies['agency_Name'];
    console.log("formPage Time : "+moment().locale('th').format('LLLL'));
    var date = moment().locale('th').format('DD MMMM YYYY')
    rid_office.find({},function(err,callback){
      var offices = callback;
      rid_agency.find({},function(err,callback){
        var agencys = callback;
        var page_form = "form";
        res.render('pages/form.html', {user:user, date:date, offices:offices, agencys:agencys, page_form:page_form});
      });  
    });
    
  }else{
    return res.sendStatus(401);
  }
});

app.get('/form',function(req, res, next) {
  console.log(req.query);
  var user = {};
  user.email = req.cookies['email'];
  user.username = req.cookies['username'];
  user.officeName = req.cookies['office_Name'];
  user.agencyName = req.cookies['agency_Name'];
  var date = moment().locale('th').format('DD MMMM YYYY');

    if(req.query.form == 'form1'){
      console.log('Form1'); 
      res.render('pages/form1.html', 
        { user : user ,
          date : date
        });

    }if(req.query.form == 'form2'){
      console.log('Form2');
      res.render('pages/form2.html', 
        { user : user ,
          date : date
        });
    }
});

app.get('/view_form',function(req, res, next) {
  var user = {};
    user.email = req.cookies['email'];
    user.username = req.cookies['username'];
    user.officeName = req.cookies['office_Name'];
    user.agencyName = req.cookies['agency_Name'];
  var view = req.query.view;
  if(req.cookies['access_token']){ 
    if(view == 'form1'){
      console.log('form1');
      form1.find({
        include: ['Uploads','rid_agency', 'rid_office']
      },function(err,data){
        var lists = data; 
        console.log(data);
        var page_form1 = "form1";
        res.render('pages/view_form1.html', {user:user, lists:lists, page_form1:page_form1});
      });

    }if(view == 'form2'){
        console.log('form2');
        form2.find({},function(err,data){
          var lists = data;
          var page_form2 = "form2";
          res.render('pages/view_form2.html', { user: user ,lists : lists, page_form2:page_form2});
        });
      }
    }else{
      return res.sendStatus(401);
    }
  });

/* --------- form 1 ----------- */

app.post('/filter_form1', function(req,res,next){
  var office_id = req.body.InputOfficeName;
  var agency_id = req.body.InputAgencyName;
  var user = {};
    user.email = req.cookies['email'];
    user.username = req.cookies['username'];
    user.officeName = req.cookies['office_Name'];
    user.agencyName = req.cookies['agency_Name'];
    console.log('filter_form1');
    console.log(req.body);

    if(req.cookies['access_token']){
      form1.find({
        where:{and: [
          {"office_id": office_id}, 
          {"agency_id" : agency_id}
        ]},
        include: ['Uploads','rid_agency', 'rid_office']
      },function(err,data){
        var lists = data; 
        console.log(data);
        res.render('pages/view_form1.html', {user:user, lists:lists});
      }); 
    }else{
      return res.sendStatus(401);
    }
});

app.post('/add_form1', upload.any(), function(req, res, next){
  console.log(req.files.length);
  //var date = moment().local('th').format('DD-MMMM-YYYY, h:mm:ss a'); 
  var office = req.body.InputOfficeName;
  var agency = req.body.InputAgencyName;
  var user = {};
    user.email = req.cookies['email'];
    user.username = req.cookies['username'];
    user.officeName = req.cookies['office_Name'];
    user.agencyName = req.cookies['agency_Name'];
  if(req.cookies['access_token']){
    var date = moment().local('th').format('DD-MMMM-YYYY, h:mm:ss a'); 
    //console.log(req.body);
    
    if(req.files.length == 0){
      console.log("photo 0 : "+req.files.length);
      console.log('no photo');
    var theForm1 = {
      "id" : req.body.id,
      "province" : req.body.province,
      "SPK_time" : req.body.SPK_time,
      "SPK_person" : req.body.SPK_person,
      "JMC_time" : req.body.JMC_time,
      "JMC_person" : req.body.JMC_person,
      "news" : req.body.InputNews,
      "date" : date,
      "form1_date" : req.body.reportTime,
      "user_edit" : req.cookies['username']
    }
    form1.upsert(theForm1, function(err, callback){ 
      console.log("add Form1 no photo : "+JSON.stringify(callback));
      rid_office.find({where:{"office_name":office}}, function(err,callback){
        var rid = {};
        rid.office = callback;
        rid_agency.find({where:{"agency_name":agency}}, function(err,callback){
          rid.agency = callback;
          console.log(rid);
          console.log("office id : "+rid.office[0].id);
          form1.find({
            where:{and: [
              {"office_id": rid.office[0].id}, 
              {"agency_id" : rid.agency[0].id}
            ]},
            include: ['Uploads','rid_agency', 'rid_office']
          },function(err,data){
            var lists = data; 
            console.log(data);
            res.render('pages/view_form1.html', {user:user, lists:lists});
          });
        });
      });
    });
  } // if files = 0
  if(req.files.length > 0){
      console.log("photo > 0 : "+req.files.length);
      console.log(req.files[0].originalname);
      var theForm1 = {
      "id" : req.body.id,
      "province" : req.body.province,
      "SPK_time" : req.body.SPK_time,
      "SPK_person" : req.body.SPK_person,
      "JMC_time" : req.body.JMC_time,
      "JMC_person" : req.body.JMC_person,
      "news" : req.body.InputNews,
      "date" : date,
      "form1_date" : req.body.date1,
      "user_edit" : req.cookies['username']
    };
    form1.upsert(theForm1, function(err, callback){ 
      var id = callback.id;
      console.log(id);
      var form1_id = id;
      for(var i = 0; i < req.files.length;i++){
        console.log(i);
        console.log(form1_id);
        var pack = {
          name : req.files[i].filename,
          path : "uploads/"+ moment().format('MMMM') + '/' + req.files[i].filename,
          form1_id : id
        }
      console.log(pack);
      uploads.upsert(pack,function(err,callback){
        console.log("add form1 have photo : "+callback);
        rid_office.find({where:{"office_name":office}}, function(err,callback){
          var rid = {};
          rid.office = callback;
          rid_agency.find({where:{"agency_name":agency}}, function(err,callback){
            rid.agency = callback;
            console.log(rid);
            console.log("office id : "+rid.office[0].id);
            form1.find({
              where:{and: [
                {"office_id": rid.office[0].id}, 
                {"agency_id" : rid.agency[0].id}
              ]},
              include: ['Uploads','rid_agency', 'rid_office']
            },function(err,data){
              var lists = data; 
              console.log(data);
              res.render('pages/view_form1.html', {user:user, lists:lists});
            });
          });
        });
      }); 
      }
   
      });
    }
  }else{
    return res.sendStatus(401);
  } 
});

app.post('/delete_form1', function(req, res){
  console.log("delete form1");
  console.log(req.body);
  var id = req.body.delId; 

  form1.destroyById(id,function(err){
    console.log(err);
    //var filter = { where: { "form1_id" : id}};
    uploads.find({ where:{"form1_id" : req.body.delId}}, function(err,callback){
      console.log(callback.length);
      console.log(callback);
      var imageObj = callback; 
      for(var i=0; i< imageObj.length; i++){
        fs.unlink("./"+callback[i].path, (err) => {
          if (err) {
              console.log("failed to delete local image:"+err);
          } else {
            console.log('successfully deleted local image');  
          }
        });
      }
      uploads.destroyAll({ "form1_id" : req.body.delId}, function(err,info){
        console.log(info);
        res.redirect('/view_form?view=form1');
      });                                    
    });  
  });
});

app.get('/chkform1', function(req,res) {
  console.log(req.query);
  var id = req.query.id; 
   form1.findById(id, {
      include: ['Uploads','rid_agency', 'rid_office']
    },function(err,data){
      console.log(data);
      res.send(data);
    });
});

/* -------------form 2----------------- */
app.post('/filter_form2', function(req,res,next){
  var office_id = req.body.InputOfficeName;
  var agency_id = req.body.InputAgencyName;
  var user = {};
    user.email = req.cookies['email'];
    user.username = req.cookies['username'];
    user.officeName = req.cookies['office_Name'];
    user.agencyName = req.cookies['agency_Name'];
    console.log('filter_form2');
    if(req.cookies['access_token']){
      form2.find({
        where:{and: [
          {"office_id": office_id}, 
          {"agency_id" : agency_id}
        ]},
        include: ['rid_agency', 'rid_office']
      },function(err,data){
        var lists = data; 
        console.log(data);
        res.render('pages/view_form2.html', {user:user, lists:lists});
      }); 
    }else{
      return res.sendStatus(401);
    }
});

app.post('/add_form2', function(req, res, next){
  var office = req.body.InputOfficeName;
  var agency = req.body.InputAgencyName;
  console.log(req.body);
  var date = moment().local('th').format('DD-MMMM-YYYY, h:mm:ss a'); 
  var user = {};
    user.email = req.cookies['email'];
    user.username = req.cookies['username'];
    user.officeName = req.cookies['office_Name'];
    user.agencyName = req.cookies['agency_Name'];
  if(req.cookies['access_token']){
    console.log('form2 was added');
    var theForm2 = {
      "id": req.body.id,
      "form2_date" : req.body.reportTime,
      "introName" : req.body.introName,
      "firstName" : req.body.firstName,
      "lastName" : req.body.lastName,
      "do" : req.body.Do,
      "dont" : req.body.Dont,
      "reason" : req.body.reason,
      "process1" : req.body.process1,
      "process2" : req.body.process2,
      "process3" : req.body.process3,
      "process4" : req.body.process4,
      "process5" : req.body.process5,
      "note" : req.body.note,
      "date" : date,
      "user_edit" : req.cookies['username']
    };

    form2.upsert(theForm2, function(err, callback) {
      rid_office.find({where:{"office_name":office}}, function(err,callback){
        var rid = {};
        rid.office = callback;
        rid_agency.find({where:{"agency_name":agency}}, function(err,callback){
          rid.agency = callback;
          console.log(rid);
          console.log("office id : "+rid.office[0].id);
          form2.find({
            where:{and: [
              {"office_id": rid.office[0].id}, 
              {"agency_id" : rid.agency[0].id}
            ]},
            include: ['rid_agency', 'rid_office']
          },function(err,data){
            var lists = data; 
            console.log(data);
            res.render('pages/view_form2.html', {user:user, lists:lists});
          });
        });
      });
    });
 
  }else{
    return res.sendStatus(401);
  }
});

app.get('/chkform2', function(req,res) {
  console.log(req.query);
  var id = req.query.id; 
  form2.findById(id,{
    include: ['rid_agency', 'rid_office']
  },function(err, callback){
    console.log(callback);
    var data = callback;
    res.send(data);
  });
});

app.post('/delete_form2', function(req, res){
  console.log(req.body);
  var id = req.body.Delid; 
  form2.destroyById(id,function(err){
    console.log(err);
    res.redirect('/view_form?view=form2');
  });
});

/*-------------------- */
app.post('/filter_WaterManagementInField', function(req,res,next){
  var office_id = req.body.InputOfficeName;
  var agency_id = req.body.InputAgencyName;
  var user = {};
    user.email = req.cookies['email'];
    user.username = req.cookies['username'];
    user.officeName = req.cookies['office_Name'];
    user.agencyName = req.cookies['agency_Name'];
    console.log('filter_WaterManagementInField');
    console.log(office_id);
    console.log(agency_id);
    /*if(req.cookies['access_token']){
      form2.find({
        where:{and: [
          {"office_id": office_id}, 
          {"agency_id" : agency_id}
        ]},
        include: ['rid_agency', 'rid_office']
      },function(err,data){
        var lists = data; 
        console.log(data);
        res.render('pages/view_form2.html', {user:user, lists:lists});
      }); 
    }else{
      return res.sendStatus(401);
    }*/
});

app.get('/img',function(req,res){
  res.render('pages/img.html');
});

}