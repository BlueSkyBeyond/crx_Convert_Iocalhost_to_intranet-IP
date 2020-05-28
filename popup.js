let localhostIp = "";
let currentUrl = "";
let defaultSelectedId = 0;
let prevId = 0;
document.querySelector(".toolList").addEventListener("click", function (e) {
    let clickIndex = e.target.attributes["defaultid"].value;
    if (clickIndex == 0) {
        createByurl();
    }
    if (clickIndex == 1) {
        createByIp();
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



window.onload = function () {
    createByurl();
}
let clipboard = new ClipboardJS('.copy');
clipboard.on('success', function (e) {
    $(".operateState").addClass("showState");
    setTimeout(() => {
        $(".operateState").removeClass("showState").addClass("hiddenState");
        
    }, 1200);
    e.clearSelection();
});