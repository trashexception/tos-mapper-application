// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const remote = require('electron').remote;
const { BrowserWindow, Menu, net } = remote;

let optionWindow;

var createOptionWindow = () => {

  // const request = net.request({
  //   method: "POST",
  //   protocol: "http",
  //   hostname: "localhost",
  //   port: 31234,
  //   path: "/api/application/position"
  // });

  const request = net.request("http://localhost:31234/api/application/position");
  let responseDataSet = {
    code: 1,
    message: "",
    data: {
      x: 0.0,
      width: 0.0,
      y: 0.0,
      height: .0
    }
  };

  request.on('response', (response) => {
    console.log(`STATUS: ${response.statusCode}`);
    
    response.on('error', (error) => {
      console.log(`ERROR: ${JSON.stringify(error)}`);
    });

    response.on('data', (chunk) => {
      console.log("data ->", JSON.parse(chunk));
      responseDataSet = JSON.parse(chunk);
    
      // create Window, if application is running
      switch (responseDataSet.code) {
        case 1:
          alert(responseDataSet.message);
          optionWindow.destroy();
          break;
        case 0:
          // alert(responseDataSet.message);
          optionWindow = new BrowserWindow({
            x: responseDataSet.data.x,
            y: responseDataSet.data.y,
            width: responseDataSet.data.width,
            height: responseDataSet.data.height,
            webPreferences: {

            },
            alwaysOnTop: true,
            modal: true,
            resizable: true,
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
    
    
    });

  });
  request.end();

 
  

  

}

// define template
const template = [
  {
    label: '옵션',
    submenu: [
      {
        label: '맵 이름 영역지정',
        click: function () {
          createOptionWindow();
        },
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);



