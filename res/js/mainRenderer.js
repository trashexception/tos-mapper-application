// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const $ = window.jQuery = require("jquery");
const bootstrap = require("bootstrap");

const Class_Map = require("./Class_Map.js");

var check = $("#slider");
check.click(function () {
    check.toggle();
    stopAndGo();
});

var webview = document.querySelector("#webview");
webview.addEventListener("dom-ready", () => { //webview의 로딩이 끝나면
    console.log("webview ready", webview);
    let google_ad_css = "\
          div[class^='google_ad'] { \
            display: none; \
          } \
          div[id^='google_ad'] { \
            display: none; \
          } \
        ";
    //webview에 css string을 injection 한다.
    webview.insertCSS(google_ad_css);
});

const intervalTime = 450  //milliseconds
var intervalId;
function stopAndGo() {
    if ($("#slider").is(":checked") == true) {
        intervalId = setInterval(getData, intervalTime);
    } else {
        clearInterval(intervalId);
    }
}

var candidates = [];
var lastKey = null;
var init = "";
function getData() {
    console.log("get data");
    let url_api = "http://localhost:31234/api/map/information";
    // url_api = "../json/test.json";
    $.ajax({
        url: url_api,
        dataType: 'json',
        success: function (data) {
            console.log(data)
            $('#ocrImage > img').attr("src", data.image);
            if (data.code == 0) {
                $('#ocrMapName').html("read_Ocr" + "[" + data.informations[0].ocrMapName + "]");
                $('#distance').html("dist." + "(" + data.informations[0].editDistance + ")");
                $('#recomendName').html("recomend" + "<" + data.informations[0].realName + ">");
                candidates.push(data.informations);
                if (candidates.length >= 3) {
                    var flatcandidates = candidates.flat();
                    var map = new Map();
                    for (var i = 0; i < flatcandidates.length; i++) {
                        var key = flatcandidates[i].realName + "###" + flatcandidates[i].url;
                        if (flatcandidates[i].editDistance >= flatcandidates[i].realName.length)
                            continue;
                        console.log(key);
                        if (map.containsKey(key)) {
                            map.put(key, map.get(key) + 1);
                        }
                        else
                            map.put(key, 1);
                        console.log(key + " " + map.get(key) + 1)
                    }
                    var maxCount = 0;
                    var maxKey = null;
                    var keys = map.keys();
                    for (var i = 0; i < keys.length; i++) {
                        if (maxCount <= map.get(keys[i])) {
                            maxCount = map.get(keys[i]);
                            maxKey = keys[i];
                        }
                    }
                    if (maxCount > 0 && lastKey != maxKey && maxCount >= 3) {
                        var keyArr = maxKey.split("###");
                        var key = keyArr[0];
                        var url = keyArr[1];
                        $('#webview').attr('src', url);
                        $('#realName').html(key);
                        lastKey = maxKey;
                    }
                    candidates = []
                }
            } else {
                candidates = []
            }
        },
        error: function (e) {
            console.log(e);
        }
    })
}

$(document).ready(function () {
    stopAndGo();
});