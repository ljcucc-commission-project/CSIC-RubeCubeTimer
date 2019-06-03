var
  timerStatus = false,
  timerTimestamp = 0,
  timerForceStop = false,
  timerDsiplay,
  socket;

(function(){
  var deviceName;

  console.log(deviceName);

  window.addEventListener("load", e=>{
    var deviceNameDisplayElement = document.querySelector("#deviceName");

    // deviceNameDisplayElement.innerHTML = "崗位編號: "+deviceName;

    timerDsiplay = new Vue({
      el:"#timerDisplay",
      data:{
        time:"0.0"
      },
      mounted: function(){
        deviceName = prompt("請輸入崗位編號或名稱:");
  
        deviceNameDisplayElement.innerHTML = "崗位編號: "+deviceName;X
        
      }
    });

    socket = io();

    eventRegistered();
  });

  function eventRegistered(){
    socket.on("timerStatus",e=>{
      if(typeof e != "boolean") return;
      timerStatus = e;
      timerTimestamp = millis();
    });

    socket.on("identityRequest", e=>{
      socket.emit("identityReturn", {
          isTeacher: false,
          displayName:"崗位編號: "+deviceName,
          time:0
      });
    });
  }

})();

function draw(){
  
  if(timerStatus && !timerForceStop){
    Vue.set(timerDsiplay, "time", (( millis() - timerTimestamp) / 1000).toFixed(2) );
  }else{
    if(!timerDsiplay || timerTimestamp == 0 || timerForceStop) return;

    timerForceStop = true;
    Vue.set(timerDsiplay, "time", ((timerTimestamp) / 1000).toFixed(2) );
  }
  
}

function keyPressed(e){
  if(e.code != "Space") return; 
  timerTimestamp = millis() - timerTimestamp;
  timerStatus = false;
  sendDone();
  console.log(e);
}

function sendDone(){
  socket.emit("timerDone", (timerTimestamp/1000).toFixed(2));
}