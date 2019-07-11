const remote = require("electron").remote;
const { app, dialog } = remote;
const userdata = require("./userdataReadWrite.js");

const $ = window.jQuery = require("jquery");
const bootstrap = require("bootstrap");

let dialogOption_notSaved = {
    type: "info",
    title: "",
    message: "지정된 영역이 없습니다.",
    button: ["확인"],
}

let mapnameSelection;
let mapnameRectangle = {
    temp: {
        x: null,
        y: null,
        width: null,
        height: null,
    },
    adjust: {
        x: null,
        y: null,
        width: null,
        height: null,
    },
    saved: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    }
}



async function initFiles() {
    let userdataPath = await userdata.setUserDataPath(app.getAppPath() + "/userdata");

    let hasStorage = await userdata.checkStorage("selection_mapname");
    if (!hasStorage) {
        await userdata.setStorage("selection_mapname", mapnameRectangle.saved);
    }
    mapnameSelection = await userdata.getStorage("selection_mapname");
    mapnameRectangle.saved = mapnameSelection;
    mapnameRectangle.temp = mapnameSelection;
}

function initButtons() {
    let btn_close = $("#btn_close");

    $(btn_close).on("click", (e) => {
        let window = remote.getCurrentWindow();
        window.close();
    });

    $(btn_save).on("click", (e) => {
        if (mapnameRectangle.temp.x == null || mapnameRectangle.temp.y == null || (mapnameRectangle.temp.width == null || mapnameRectangle.temp.width == 0) || (mapnameRectangle.temp.height == null || mapnameRectangle.temp.height == 0)) {
            console.log("not saved");
            dialog.showMessageBox(null, dialogOption_notSaved);
        } else {
            if (mapnameRectangle.temp.width > 0) {
                mapnameRectangle.adjust.x = mapnameRectangle.temp.x;
                mapnameRectangle.adjust.width = mapnameRectangle.temp.width * 1;
            } else {
                mapnameRectangle.adjust.x = mapnameRectangle.temp.x + mapnameRectangle.temp.width;
                mapnameRectangle.adjust.width = mapnameRectangle.temp.width * -1;
            }

            if (mapnameRectangle.temp.height > 0) {
                mapnameRectangle.adjust.y = mapnameRectangle.temp.y;
                mapnameRectangle.adjust.height = mapnameRectangle.temp.height * 1;
            } else {
                mapnameRectangle.adjust.y = mapnameRectangle.temp.y + mapnameRectangle.temp.height;
                mapnameRectangle.adjust.height = mapnameRectangle.temp.height * -1;
            }
            mapnameRectangle.saved = mapnameRectangle.adjust;
        }
        console.log(mapnameRectangle);
        userdata.setStorage("selection_mapname", mapnameRectangle.saved);
    });
}

function initDraw(canvas) {
    console.log("window.innerWidth", window.innerWidth, "window.innerHeight", window.innerHeight)
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    //Canvas
    let canvasx = $(canvas).offset().left;
    let canvasy = $(canvas).offset().top;
    let ctx = canvas.getContext("2d");
    //Variables
    let start_mousex = 0;
    let start_mousey = 0;
    let mousex = 0;
    let mousey = 0;
    let mousedown = false;
    let width;
    let height;

    //canvas ready
    $(canvas).ready((e) => {
        console.log("mapnameRectangle.saved =>", mapnameRectangle.saved);

        if ((mapnameSelection.width == 0 || mapnameSelection.height == 0) || (mapnameSelection.width === undefined || mapnameSelection.height === undefined)) {
            console.log("not saved");
            dialog.showMessageBox(null, dialogOption_notSaved);
        }

        ctx.strokeStyle = "red";
        ctx.lineWidth = 1;
        ctx.strokeRect(mapnameRectangle.saved.x, mapnameRectangle.saved.y, mapnameRectangle.saved.width, mapnameRectangle.saved.height);

    });

    //Mousedown
    $(canvas).on("mousedown", (e) => {
        start_mousex = parseInt(e.clientX - canvasx);
        start_mousey = parseInt(e.clientY - canvasy);
        mousedown = true;
    });
    //Mouseup
    $(canvas).on("mouseup", (e) => {
        mousedown = false;
    });

    //Mousemove
    $(canvas).on("mousemove", (e) => {
        mousex = parseInt(e.clientX - canvasx);
        mousey = parseInt(e.clientY - canvasy);
        if (mousedown) {
            ctx.clearRect(0, 0, canvas.width, canvas.height); //clear canvas
            ctx.beginPath();
            width = mousex - start_mousex;
            height = mousey - start_mousey;
            ctx.rect(start_mousex, start_mousey, width, height);
            ctx.strokeStyle = "red";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        //Output
        // console.log(mousex, mousey, mousedown, start_mousex, start_mousey, width, height);

        //temporary save rectange
        mapnameRectangle.temp.x = start_mousex;
        mapnameRectangle.temp.y = start_mousey;
        mapnameRectangle.temp.width = width;
        mapnameRectangle.temp.height = height;
    });
}

$(document).ready(async () => {
    await initFiles();
    await initButtons();
    await initDraw($("#canvas")[0]);

});