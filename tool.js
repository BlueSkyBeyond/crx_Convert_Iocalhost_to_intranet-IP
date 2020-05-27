function createByurl(){
    chrome.tabs.getSelected(function (tab) {
        currentUrl = tab.url;
         // 存储当前url
         chrome.storage.local.set({
            currentUrl: currentUrl
        })
        console.log("成功设置")
        initQrcode(currentUrl);
    })
}
function downQrcode() {
    let qrcodeImg = $("#qrcodeContent img").attr("src");
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
    $("#ipaddress").text(url);
    let qrcode = new QRCode("qrcodeContent", {
        render: "canvas",
        text: url,
        width: 128,
        height: 128,
        typeNumber:-1,
        colorDark: "#ffffff",
        colorLight: "#0050b3",
        correctLevel: QRCode.CorrectLevel.H 
    });
  
    // let canvas=document.getElementsByTagName("canvas")[0];
    // $("")
    // var img=converCanvasToUrl(canvas);
    // $("#qrcodeContent").append(img);
}
function converCanvasToUrl(canvas){
    var  image=new Image();
    image.src=canvas.toDataURL("image/png");
    return image;
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