const electron = require('electron');
const { app, BrowserWindow, Menu, dialog, net } = electron;

const child = require('child_process').spawn;
const process = require('process');
const fs = require('fs');
const isRunning = require('is-running')

const mapper_parametersJson = require(app.getAppPath() + "/res/json/mapper_parameters.json");
const mapper_executablePath = app.getAppPath() + "/mapper/tos-mapper.exe";
const mapper_applicationPidFile = app.getAppPath() + "/mapper/application.pid";

let mapper_parameters = [
  "--user.x=" + mapper_parametersJson.x,
  "--user.y=" + mapper_parametersJson.y,
  "--user.width=" + mapper_parametersJson.width,
  "--user.height=" + mapper_parametersJson.height,
  "--user.tessdata=" + app.getAppPath() + mapper_parametersJson.tessdata
];

let mapper_API_applicationPosition = {
  url: "http://localhost:31234/api/application/position",
  api: {},
}

// window 객체는 전역 변수로 유지. 이렇게 하지 않으면, 
// 자바스크립트 객체가 가비지 콜렉트될 때 자동으로 창이 닫힐 것입니다.
let mainWindow = null;
let optionWindow = null;
let childProcesser;;

// app.disableHardwareAcceleration() // 하드웨어가속 disable

function processRun() {

  console.log("mapper_parameters ->", mapper_parameters);
  childProcesser = child(mapper_executablePath, mapper_parameters);
  console.log("childProcesser.pid -> ", childProcesser.pid);

  while (true) {
    if (fs.existsSync(mapper_applicationPidFile)) {
      let jvmPid = fs.readFileSync(mapper_applicationPidFile, 'utf8');
      if (isRunning(jvmPid)) {
        fs.unlinkSync(mapper_applicationPidFile);
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

  mainWindow.webContents.openDevTools();   // 개발자 도구를 엽니다.

  mainWindow.on('close', function (e) { //   <---- Catch close event
    e.preventDefault();
    console.log("mapper_applicationPidFile Path ->", mapper_applicationPidFile);
    if (fs.existsSync(mapper_applicationPidFile)) {
      let jvmPid = fs.readFileSync(mapper_applicationPidFile, 'utf8');
      // the data is passed to the callback in the second argument
      console.log("jvmPid -> ", jvmPid);
      process.kill(jvmPid, 'SIGKILL');
      fs.unlinkSync(mapper_applicationPidFile);
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
    if (optionWindow != null) {
      optionWindow.destroy();
    };
  });

  // define template
  const template = [
    {
      label: '옵션',
      submenu: [
        {
          label: '맵 이름 영역지정',
          click: async function () {
            await runMapperApiApplicationPosition();
            createOptionWindow();
          },
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function runMapperApiApplicationPosition(param) {
  return new Promise((resolve, reject) => {
    let request = net.request(mapper_API_applicationPosition.url);

    request.on('response', (response) => {
      console.log(`STATUS: ${response.statusCode}`);

      response.on('error', (error) => {
        console.log(`ERROR: ${JSON.stringify(error)}`);
        reject(Error(`ERROR: ${JSON.stringify(error)}`));
      });

      response.on('data', (chunk) => {
        mapper_API_applicationPosition.api = JSON.parse(chunk);
        console.log("data ->", mapper_API_applicationPosition.api);

        resolve("done");
      });
    });
    request.end();
  });
};

function createOptionWindow() {
  //FOR TEST
  // mapper_API_applicationPosition.api = {
  //   code: 0,
  //   message: "트오세를 켜지 않았습니다.",
  //   data: {
  //     x: 30,
  //     y: 30,
  //     width: 1280,
  //     height: 960,
  //   }
  // }


  // create Window, if application is running
  switch (mapper_API_applicationPosition.api.code) {
    case 1:
      console.log(mapper_API_applicationPosition.api.message);
      let dialogOption = {
        type: "info",
        buttons: ["확인"],
        title: "",
        message: mapper_API_applicationPosition.api.message,
      }

      dialog.showMessageBox(null, dialogOption);

      break;
    case 0:
      optionWindow = new BrowserWindow({
        x: mapper_API_applicationPosition.api.data.x,
        y: mapper_API_applicationPosition.api.data.y,
        width: mapper_API_applicationPosition.api.data.width,
        height: mapper_API_applicationPosition.api.data.height,
        webPreferences: {
          nodeIntegration: true,
          webviewTag: true
        },
        alwaysOnTop: false,
        resizable: false,
        transparent: true,
        frame: false
      });
      optionWindow.loadFile("./res/html/option.html");
      optionWindow.setMenu(null);

      optionWindow.webContents.openDevTools();

      optionWindow.on("closed", function (e) {
        optionWindow = null;
      });

      break;
  }
}


// 이 메서드는 Electron이 초기화를 마치고 
// 브라우저 창을 생성할 준비가 되었을 때  호출될 것입니다.
// 어떤 API는 이 이벤트가 나타난 이후에만 사용할 수 있습니다.
app.on('ready', async () => {
  await processRun();
  createMainWindow();
  // createOptionWindow();

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