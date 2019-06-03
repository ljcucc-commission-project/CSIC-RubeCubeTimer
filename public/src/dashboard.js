(function(){
  var vue = {
    deviceList:{},
    openDialog:{},
    timerHeader:{}
  };
  var socket;
  var openDialogElement;
  var loaded = false;
  window.addEventListener("load",onload);

  function onload(){
    socket = io();
    openDialogElement = document.querySelector('dialog');

    eventRegistered();

    vue.deviceList = new Vue({
      el: '#device_list',
      data: {
        list: [],
        str:"hi"
      },
      mounted:()=>{
        console.log("component is running...");
      }
    });

    vue.timerHeader = new Vue({
      el:"#timerHeader",
      methods:{
        timerToggler:()=>{
          socket.emit("startTimer", true);
        }
      }
    });

    loaded = true;
  }

  function eventRegistered(){
    //When server request to client to get identity
    socket.on("identityRequest", e => {
      console.log("identityRequest");
      var password = "";
      if (e.passwordRequired) {
        password = prompt("驗證碼請求:")
      }
      socket.emit("identityReturn", {
        isTeacher: true,
        password,
        displayName:"Teacher"
      });
    });

    socket.on("identityRequestFeedback", e => {
      AuthedDisplay(e.authed);
    });

    socket.on("updateStudentsList",e=>{
      updateStudentsList(e);
    });
  }

  

  function AuthedDisplay(result){
    // Change content
    // Vue.set(vue.openDialog,"title", "驗證失敗");
    // Vue.set(vue.openDialog,"description", "因為您輸入的驗證碼不正確，導致您無法登錄。請在您的Terminal中查看驗證碼。");

    if(result) return;
    openDialogElement.querySelector(".title").innerHTML = "驗證失敗";
    openDialogElement.querySelector(".description").innerHTML = "因為您輸入的驗證碼不正確，導致您無法取得權限，接下來您的所有動作都是無效的，不過您可以透過重新載入來重新輸入驗證碼。請在您的Terminal中查看驗證碼。";

    // Registered when first dialog show
    if (! openDialogElement.showModal) {
      dialogPolyfill.registerDialog(openDialogElement);
    }

    openDialogElement.querySelector('.close').onclick = e => {
      openDialogElement.close();
    };

    console.log(openDialogElement)
    openDialogElement.showModal();
  }

  function updateStudentsList(studentsList){
    console.log("updateStudentList");
    console.log(studentsList)

    var list = [];
    for(var index in studentsList){
      var item = studentsList[index];

      if(!item) continue;

      list.push({
        id:item.displayName,
        time:item.time,
        status:true
      });

      Vue.set(vue.deviceList, "list", list);
    }
  }
  
})();
