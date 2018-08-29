

wx.config({
    debug : true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
    appId : 'wx1274f3236ceab422', // 必填，公众号的唯一标识
    timestamp : '1533871852', // 必填，生成签名的时间戳
    nonceStr : '1180916672', // 必填，生成签名的随机串
    signature : 'c459ed93503193d6693647ad4900c9aae223e912',// 必填，签名
    jsApiList : [
        "checkJsApi",
        "onMenuShareTimeline",
        "onMenuShareAppMessage",
        "onMenuShareQQ",
        "onMenuShareQZone",
        "scanQRCode",
        "onMenuShareWeibo"]
    // jsApiList : [ 'onMenuShareQQ' ]
    // 必填，需要使用的JS接口列表
});


document.getElementById('ocr').onclick= function () {
    wx.scanQRCode({
        // 默认为0，扫描结果由微信处理，1则直接返回扫描结果
        needResult : 1,
        scanType: ["qrCode","barCode"],///"qrCode","barCode"
        desc : 'scanQRCode desc',
        success : function(res) {
            //扫码后获取结果参数赋值给Input
            console.log('扫描结果--', res);
        }
    });
}