// app모듈과, BrowserWindow 모듈 할당
const {app, BrowserWindow} = require('electron');
let win;

app.on('ready', () =>{
    win = new BrowserWindow(
        {
            width : 1183
            , minWidth:1183
            , height :900
            , minHeight: 900
            , show: false
            , icon: __dirname + '/resources/installer/Icon.ico'
            , webPreferences :{ defaultFontSize : 14}
        }
    );
    // 창이 ready 상태가되면 보여주기
    win.once('ready-to-show', function(){
        win.show();
    });

    // 윈도우 창에 로드 할 html 페이지
    win.loadURL(`http://localhost:31234/static/index.html`); //작은 따옴표가 아닌  back stick 기호(tab키 위)
    //__dirname : node.js 전역변수이며, 현재 실행중인 코드의 파일 경로를 나타냄

    //개발자 도구 오픈
   win.webContents.openDevTools();
});