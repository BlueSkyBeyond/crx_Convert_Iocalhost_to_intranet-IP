createRightMenu();
function createRightMenu() {
    chrome.contextMenus.create({
        type: 'normal',
        title: '将选中的内容生成二维码',
        id: 'createQRcodeBySeleted',
        contexts: ['all'],
        onclick: function (infor, tab) {
            chrome.storage.local.set({
                userSelected: infor.selectionText
            })
            window.open(chrome.runtime.getURL('options.html'));
        }
    }, function (res) {
    })
}