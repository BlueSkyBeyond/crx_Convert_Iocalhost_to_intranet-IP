let localhostIp = "";
let currentUrl = "";
let defaultSelectedId = 0;
let prevId = 0;
let isCreate = false;
// window.onload= function(){
//     // debugger
//     console.log("拓展页面加载了")
createByurl();
//     // if(this.localStorage.getItem("hasCreate")==(null||undefined)){
//     //  createRightMenu();
//     // }

// }
if (!localStorage.getItem("isCreate")) {
    createRightMenu();
} else {

}

document.querySelector(".toolList").addEventListener("click", function (e) {
    console.log(e.target.attributes["defaultid"].value, "点击的对象是")
    console.log(e, "obj");
    let clickIndex = e.target.attributes["defaultid"].value;
    if (clickIndex == 0) {
        createByurl();
    }
    if (clickIndex == 1) {
        createByIp()
    }
    if (clickIndex == 3) {
        downQrcode();
    }
})
$(`.toolList button[defaultId=${defaultSelectedId}]`).addClass("selected");
$(".toolList button").click(function () {
    prevId = defaultSelectedId;
    defaultSelectedId = $(this).attr("defaultId");
    $(`.toolList button[defaultId=${defaultSelectedId}]`).addClass("selected");
    $(`.toolList button[defaultId=${prevId}]`).removeClass("selected");
    if (defaultSelectedId == 2) {
        $(".showInput").addClass("show")
    } else {
        $(".showInput").removeClass("show")
    }
})

$('#userInput').on('keypress', function (ev) {
    if (ev.keyCode == 13) {
        let inputValue = $("#userInput").val();
        if (inputValue.substr(0, 7).toLowerCase() == "http://" || inputValue.substr(0, 8).toLowerCase() == "https://") {
            inputValue = inputValue;
        } else {
            inputValue = "http://" + inputValue;
        }
        initQrcode(inputValue);
    }
})

function createRightMenu() {
    chrome.contextMenus.create({
        type: 'normal',
        title: '将选中的内容生成二维码',
        id: 'createQRcodeBySeleted',
        contexts: ['all'],
        onclick: function (infor, tab) {
            let userSelectedText = infor.selectionText;
            console.log("用户选择的内容", userSelectedText);
            chrome.runtime.openOptionsPage(function () {
                console.log("打开特定页面..")
            })
        }
    }, function (res) {
        localStorage.setItem("isCreate", true);
    })
}


function createByurl() {
    chrome.tabs.getSelected(function (tab) {
        currentUrl = tab.url;
        initQrcode(currentUrl);
    })
}

function downQrcode() {
    let qrcodeImg = $("#qrcodeContent img").attr("src");
    console.log(qrcodeImg);
    let a = document.createElement("a");
    let defaultEvent = new MouseEvent("click");
    a.href = qrcodeImg;
    a.download = "toQrcode";
    a.dispatchEvent(defaultEvent);

}

function createByIp() {

    getIPs(function (result) {
        let replaceTemplate = "localhost";
        if (currentUrl.match("127.0.0.1") != null) {
            replaceTemplate = "127.0.0.1"
        }
        initQrcode(currentUrl.replace(replaceTemplate, result)); //127.0.0.1  localhost替换成本地ip
    })


}

function initQrcode(url) {
    $("#qrcodeContent").html(""); //清空
    let qrcode = new QRCode("qrcodeContent", {
        text: url,
        width: 160,
        height: 160,
        colorDark: "#ffffff",
        colorLight: "#0050b3",
        correctLevel: QRCode.CorrectLevel.H
    });
}
//get the IP addresses associated with an account
function getIPs(callback) {
    var ip_dups = {};

    //compatibility for firefox and chrome
    var RTCPeerConnection = window.RTCPeerConnection ||
        window.mozRTCPeerConnection ||
        window.webkitRTCPeerConnection;
    var useWebKit = !!window.webkitRTCPeerConnection;

    //bypass naive webrtc blocking using an iframe
    if (!RTCPeerConnection) {
        //NOTE: you need to have an iframe in the page right above the script tag
        //
        //<iframe id="iframe" sandbox="allow-same-origin" style="display: none"></iframe>
        //<script>...getIPs called in here...
        //
        var win = iframe.contentWindow;
        RTCPeerConnection = win.RTCPeerConnection ||
            win.mozRTCPeerConnection ||
            win.webkitRTCPeerConnection;
        useWebKit = !!win.webkitRTCPeerConnection;
    }

    //minimal requirements for data connection
    var mediaConstraints = {
        optional: [{
            RtpDataChannels: true
        }]
    };

    var servers = {
        iceServers: [{
            urls: "stun:stun.services.mozilla.com"
        }],
        sdpSemantics: 'plan-b'
    };
    //配置google的SDP格式（分为火狐:Unified Plan 以及谷歌自己定义的plan-b ）
    //　如果Public IP无法解析，请更换stun服务器：stun:stun.l.google.com:19302
    //具体参考 https://www.cnblogs.com/thinking-better/p/10386950.html 这位老哥。
    //construct a new RTCPeerConnection
    var pc = new RTCPeerConnection(servers, mediaConstraints);

    function handleCandidate(candidate) {
        //match just the IP address
        var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
        var ip_addr = ip_regex.exec(candidate)[1];

        //remove duplicates
        if (ip_dups[ip_addr] === undefined)
            callback(ip_addr);
        ip_dups[ip_addr] = true;
    }

    //listen for candidate events
    pc.onicecandidate = function (ice) {

        //skip non-candidate events
        if (ice.candidate)
            handleCandidate(ice.candidate.candidate);
    };

    //create a bogus data channel
    pc.createDataChannel("");

    //create an offer sdp
    pc.createOffer(function (result) {

        //trigger the stun server request
        pc.setLocalDescription(result, function () {}, function () {});

    }, function () {});

    //wait for a while to let everything done
    //read candidate info from local description
    setTimeout(function () {
        var lines = pc.localDescription.sdp.split('\n');

        lines.forEach(function (line) {
            if (line.indexOf('a=candidate:') === 0)
                handleCandidate(line);
        });
    }, 1000);

}