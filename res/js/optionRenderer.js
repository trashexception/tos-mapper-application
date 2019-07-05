const $ = require('jquery');

function initDraw (canvas) {
    console.log("window.innerWidth", window.innerWidth, "window.innerHeight", window.innerHeight)
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var ctx = canvas.getContext('2d');
    //Variables
    var canvasx = $(canvas).offset().left;
    var canvasy = $(canvas).offset().top;
    var start_mousex = start_mousey = 0;
    var mousex = mousey = 0;
    var mousedown = false;
    
    //Mousedown
    $(canvas).mousedown(function(e) {
        if (mousedown)
            return;
        start_mousex = parseInt(e.clientX);
        start_mousey = parseInt(e.clientY);
        mousedown = true;
    });
    
    //Mouseup
    $(canvas).mouseup( function(e) {
        mousedown = false;
    });
    
    //Mousemove
    $(canvas).on('mousemove', function(e) {
        mousex = parseInt(e.clientX);
        mousey = parseInt(e.clientY);
        if(mousedown) {
            ctx.clearRect(0,0,canvas.width,canvas.height); //clear canvas
            // ctx.beginPath();
            var width = mousex-start_mousex;
            var height = mousey-start_mousey;
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 1;
            ctx.strokeRect(start_mousex,start_mousey,width,height);
            console.log(start_mousex,start_mousey,width,height)
           
            // ctx.stroke();
        }
        //Output
        // console.log('current: '+mousex+', '+mousey+'<br/>last: '+last_mousex+', '+last_mousey+'<br/>mousedown: '+mousedown);
    });

















    // var mouse = {
    //     x: 0,
    //     y: 0,
    //     startX: 0,
    //     startY: 0
    // };

    // function setMousePosition(e) {
    //     var ev = e || window.event; //Moz || IE
    //     if (ev.pageX) { //Moz
    //         mouse.x = ev.pageX + window.pageXOffset;
    //         mouse.y = ev.pageY + window.pageYOffset;
    //     } else if (ev.clientX) { //IE
    //         mouse.x = ev.clientX + document.body.scrollLeft;
    //         mouse.y = ev.clientY + document.body.scrollTop;
    //     }
    // };

    // var element = null;
    // canvas.onmousemove = function (e) {
    //     setMousePosition(e);
    //     if (element !== null) {
    //         element.style.width = Math.abs(mouse.x - mouse.startX) + 'px';
    //         element.style.height = Math.abs(mouse.y - mouse.startY) + 'px';
    //         element.style.left = (mouse.x - mouse.startX < 0) ? mouse.x + 'px' : mouse.startX + 'px';
    //         element.style.top = (mouse.y - mouse.startY < 0) ? mouse.y + 'px' : mouse.startY + 'px';
    //     }
    // }

    // canvas.addEventListener("click", (e) => {
    //     if (element !== null) {
    //         element = null;
    //         canvas.style.cursor = "default";

    //         canvas.removeEventListener("click",this);
    //         console.log("finsihed.");
    //     } else {
    //         console.log("begun.");
    //         mouse.startX = mouse.x;
    //         mouse.startY = mouse.y;
    //         element = document.createElement('div');
    //         element.className = 'rectangle'
    //         element.style.left = mouse.x + 'px';
    //         element.style.top = mouse.y + 'px';
    //         canvas.appendChild(element)
    //         canvas.style.cursor = "crosshair";
    //     }

    // });

}