const { app, BrowserWindow } = require('electron')
var child = require('child_process').spawn;
var process = require('process');
var fs = require('fs');
//var _ = require('lodash');
//var deasync = require('deasync');
var psnode = require('ps-node');
var executablePath = app.getAppPath() + "/mapper/tos-mapper.exe";
var parameters = ["--user.x=1130", "--user.y=27", "--user.width=300", "--user.height=31", "--user.tessdata=" + app.getAppPath() + "/mapper/tessdata"];
var childProcesser;

// window 객체는 전역 변수로 유지. 이렇게 하지 않으면, 
// 자바스크립트 객체가 가비지 콜렉트될 때 자동으로 창이 닫힐 것입니다.
let win

function createWindow() {
  childProcesser = child(executablePath, parameters);
  
  console.log('tt: ' +childProcesser.pid);
  while (true) {
    if (fs.existsSync(app.getAppPath() + "/mapper/application.pid")) {
      break;
    }
    if (childProcesser.pid == undefined)
      break;

  }
  if (childProcesser.pid == undefined){
    console.log('ERRORORROROROR');
  }
  // 브라우저 창을 생성합니다.
  win = new BrowserWindow({
    width: 1280,
    height: 1024,

    webPreferences: {
      nodeIntegration: true,
      webviewTag: true
    }
  });

  // and load the index.html of the app.
  win.loadFile('index.html');
  // 개발자 도구를 엽니다.
  win.webContents.openDevTools();

  // psnode.lookup({
  //   command: 'java',
  //   arguments: 'tessdata',
  // }, function (err, resultList) {
  //   if (err) {
  //     throw new Error(err);
  //   }
  //   resultList.forEach(function (process) {
  //     if (process) {
  //       console.log('PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments);
  //       ppid = process.pid;
  //     }
  //   });
  // });

  win.on('close', function (e) { //   <---- Catch close event
    e.preventDefault();
    console.log(app.getAppPath() + "/mapper/application.pid");
    if (fs.existsSync(app.getAppPath() + "/mapper/application.pid")){
      var data = fs.readFileSync(app.getAppPath() + "/mapper/application.pid",'utf8');
      // the data is passed to the callback in the second argument
      console.log(data);
      process.kill(data,'SIGKILL');
      fs.unlinkSync(app.getAppPath() + "/mapper/application.pid");
    }
    win.loadFile('shutdown.html');
    setTimeout(function () {
      win.destroy();
    }, 2000);
  });


  // 창이 닫힐 때 발생합니다
  win.on('closed', () => {
    // window 객체에 대한 참조해제. 여러 개의 창을 지원하는 앱이라면 
    // 창을 배열에 저장할 수 있습니다. 이곳은 관련 요소를 삭제하기에 좋은 장소입니다.
    // console.log('TTTTTTT : ' + ppid);
    // if (ppid != -1){
    //   psnode.kill(ppid,'SIGKILL',function(err){
    //     if (err) {
    //       throw new Error( err );
    //     }
    //     else {
    //       console.log( 'Process %s has been killed!', pid );
    //     }
    //   });

    // childProcesser.stdin.end();
    // childProcesser.stdout.destroy();
    // childProcesser.stderr.destroy();
    // childProcesser.kill(-childProcesser.pid);
    console.log('window closed');
    win = null;
  }
  );





  win.setMenu(null);
}

// 이 메서드는 Electron이 초기화를 마치고 
// 브라우저 창을 생성할 준비가 되었을 때  호출될 것입니다.
// 어떤 API는 이 이벤트가 나타난 이후에만 사용할 수 있습니다.
app.on('ready', createWindow)

app.on('will-quit', () => {
  // // win.loadFile('shutdown.html');
  // console.log('will quit end');
  // var request = require('sync-request');
  // var res = request('GET', 'http://localhost:31234/api/shutdown', {
  //   timeout: 1000,
  //   socketTimeout: 1000,
  //   retry: false,
  // });
  // console.dir(res);
  // console.log(res.getBody());
  // childProcesser.kill();
  console.log('will quit real end');
})





// 모든 창이 닫혔을 때 종료.
app.on('window-all-closed', () => {
  // macOS에서는 사용자가 명확하게 Cmd + Q를 누르기 전까지는
  // 애플리케이션이나 메뉴 바가 활성화된 상태로 머물러 있는 것이 일반적입니다.
  if (process.platform !== 'darwin') {
    app.quit();
  }
})
app.on('activate', () => {
  // macOS에서는 dock 아이콘이 클릭되고 다른 윈도우가 열려있지 않았다면
  // 앱에서 새로운 창을 다시 여는 것이 일반적입니다.
  if (win === null) {
    createWindow()
  }
})

// 이 파일 안에 당신 앱 특유의 메인 프로세스 코드를 추가할 수 있습니다. 별도의 파일에 추가할 수도 있으며 이 경우 require 구문이 필요합니다.