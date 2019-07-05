const electron = require('electron');
const { app, BrowserWindow } = electron;
const path = require('path');

const child = require('child_process').spawn;
const process = require('process');
const fs = require('fs');
const isRunning = require('is-running')

const mapper_parametersFile = require(app.getAppPath() + "/res/json/mapper_parameters.json");
// const executablePath = app.getAppPath() + "/mapper/tos-mapper-otsu.exe";
const executablePath = app.getAppPath() + "/mapper/tos-mapper.exe";
const applicationPidFile = app.getAppPath() + "/mapper/application.pid";

// window 객체는 전역 변수로 유지. 이렇게 하지 않으면, 
// 자바스크립트 객체가 가비지 콜렉트될 때 자동으로 창이 닫힐 것입니다.
let mainWindow;
let optionWindow;
let childProcesser;;

app.disableHardwareAcceleration()

function processRun() {
  // let mapper_parameters = ["--user.x=848", "--user.y=26", "--user.width=232", "--user.height=31", "--user.tessdata=" + app.getAppPath() + "\\mapper\\tessdata"];
  let mapper_parameters = [

    "--user.x=" + mapper_parametersFile.x,
    "--user.y=" + mapper_parametersFile.y,
    "--user.width=" + mapper_parametersFile.width,
    "--user.height=" + mapper_parametersFile.height,
    "--user.tessdata=" + app.getAppPath() + mapper_parametersFile.tessdata

  ];
  console.log("mapper_parameters ->", mapper_parameters);

  childProcesser = child(executablePath, mapper_parameters);
  console.log("childProcesser.pid -> ", childProcesser.pid);

  while (true) {
    if (fs.existsSync(applicationPidFile)) {
      let jvmPid = fs.readFileSync(applicationPidFile, 'utf8');
      if (isRunning(jvmPid)) {
        fs.unlinkSync(applicationPidFile);
        break;
      }
    }
    if (childProcesser.pid == undefined) {

      break;
    }
  }
  if (childProcesser.pid == undefined) {
    console.log('ERRORORROROROR');
  }
}

function createMainWindow() {
 
    mainWindow = new BrowserWindow({
      width: 1220,
      height: 1030,
  
      webPreferences: {
        nodeIntegration: true,
        webviewTag: true
      }
    });
    mainWindow.loadFile("./res/html/main.html"); // and load the index.html of the app.
    mainWindow.setMenu(null);  // 메뉴창 제거


    // optionWindow = new BrowserWindow({
    //   width: 500,
    //   height: 150,
    //   webPreferences: {

    //   },
    //   // transparent: true,
    //   // frame: false
    // })
  // optionWindow.loadFile("./res/html/option.html");
  // optionWindow.setMenu(null);
  // optionWindow.hide();

  

  mainWindow.webContents.openDevTools();   // 개발자 도구를 엽니다.
  // optionWindow.webContents.openDevTools();

  mainWindow.on('close', function (e) { //   <---- Catch close event
    e.preventDefault();
    console.log("applicationPidFile Path ->", applicationPidFile);
    if (fs.existsSync(applicationPidFile)) {
      let jvmPid = fs.readFileSync(applicationPidFile, 'utf8');
      // the data is passed to the callback in the second argument
      console.log("jvmPid -> ", jvmPid);
      process.kill(jvmPid, 'SIGKILL');
      fs.unlinkSync(applicationPidFile);
    }
    mainWindow.loadFile('./res/html/shutdown.html');
    setTimeout(function () {
      mainWindow.destroy();
    }, 2000);
  });


  // 창이 닫힐 때 발생합니다
  mainWindow.on('closed', () => {
    // window 객체에 대한 참조해제. 여러 개의 창을 지원하는 앱이라면 
    // 창을 배열에 저장할 수 있습니다. 이곳은 관련 요소를 삭제하기에 좋은 장소입니다.

    mainWindow = null;

    // optionWindow.destroy();
  });

  // optionWindow.on('closed',() => {
  //   optionWindow = null;
  // });

}

// function createoptionWindow () {
 
//   let displays = electron.screen.getAllDisplays()
//   let externalDisplay = displays.find((display) => {
//     return display.bounds.x !== 0 || display.bounds.y !== 0
//   })
// }

// 이 메서드는 Electron이 초기화를 마치고 
// 브라우저 창을 생성할 준비가 되었을 때  호출될 것입니다.
// 어떤 API는 이 이벤트가 나타난 이후에만 사용할 수 있습니다.
app.on('ready', () => {

  processRun();
  createMainWindow();
  

});

app.on('will-quit', () => {
  //종료 직전에 수행되는 HOOK
});

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
  if (mainWindow === null) {
    createWindow()
  }
})

// 이 파일 안에 당신 앱 특유의 메인 프로세스 코드를 추가할 수 있습니다. 별도의 파일에 추가할 수도 있으며 이 경우 require 구문이 필요합니다.