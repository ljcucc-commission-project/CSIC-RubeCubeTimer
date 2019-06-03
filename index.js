// Import
var express = require("express")
    ,app = express()
    ,http = require("http").Server(app); //default in node.js
var open = require("open");
var io = require("socket.io")(http);
var fs = require("fs");

// Global variable
const pinPassword = getRandomInt(9999);
var config = JSON.parse(
  fs.readFileSync("./config.json")
);
var deviceList = {};
var teachersSocket = {};

(function(){
  app.use(
    express.static(__dirname+"/public")); //__dirname is default in node.js
  
  io.on('connection', function(socket){
    var personalConfig = {
      isTeacher:false,
      displayName: "Student unknow"
    }

    console.log("+connected: "+socket.id);

    var events = {
      identityReturn:function(e){
        if(!e.displayName){
          console.log("unknow connection!");
          return;
        }

        personalConfig.displayName = e.displayName;
        
        if(e.isTeacher){  //Teacher setup
          teacherOnline();
        }else{
          studentOnline();
        }
      },
      startTimer:e=>{
        console.log("timer started!");
        socket.broadcast.emit("timerStatus",true);
      },
      timerDone:e=>{
        if(typeof e != "string") return;
        deviceList[socket.id].time = e;
        updateStudentList();
      }
    };

    for(var index in events){
      if(events[index] && typeof events[index] == "function")
        socket.on(index,events[index]);
    }

    socket.emit("identityRequest",{
      passwordRequired: config.passwordRequired
    });
/*
    socket.on("identityReturn",e=>{
      personalConfig.displayName = e.displayName; //setup the display name

      if(e.isTeacher){  //Teacher setup
        teacherOnline();
      }else{
        studentOnline();
      }
    });*/

    socket.on("disconnect",e=>{
      if(socket.id in deviceList)
          deviceList[socket.id] = null;
      console.log("-disconnect: "+socket.id);

      updateStudentList();
    });

    function teacherOnline(){
      console.log("**Teacher online!");
      if (config.passwordRequired && e.password == pinPassword || !config.passwordRequired) {
        personalConfig.isTeacher = true;
        socket.emit("identityRequestFeedback", {
          authed: true
        });

        console.log("teacher is online: " + socket.id);
        teachersSocket[socket.id] = socket;
      } else {
        socket.emit("identityRequestFeedback", {
          authed: false
        });
      }
      updateStudentList();
    }
    function studentOnline(){
      console.log("Student online");
      deviceList[socket.id] = {
        id:socket.id,
        displayName:personalConfig.displayName
      };

      console.log("A student is online which called" + personalConfig.displayName);

      updateStudentList();
    }
  });

  http.listen(8080, ()=>{
    console.log("Server is running on port 8080.");
    console.log("PIN password is on: "+pinPassword);

    open("http://localhost:8080/dashboard.html");
  });

  function updateStudentList(){
    console.log("updateStudentList");

    for(var index in teachersSocket){
      var teacher = teachersSocket[index];
      teacher.emit("updateStudentsList", deviceList);
    }
  }

})();

// Else library
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
