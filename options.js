
    let that=this;
    chrome.storage.local.get(["userSelected"],function(res){
        that.initQrcode(res.userSelected);
        chrome.storage.local.clear(function(){
            chrome.storage.local.get(["userSelected"],function(res){
            })
        })
    });





