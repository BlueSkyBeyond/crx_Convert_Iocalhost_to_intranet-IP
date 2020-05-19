console.log("这是我嵌入的js内容","ky")
chrome.runtime.onMessage.addListener(function(res) {
    console.log("props",res);
    $("#qrcodeContent").html(res);
});