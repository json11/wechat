'use strict'

var Koa = require('koa')

var path = require('path')

var ejs = require('ejs')

var heredoc = require('heredoc')

var crypto = require('crypto')

var wechat = require('./wechat/g')

var util = require('./libs/util')

var config = require('./config')

var reply = require('./wx/reply')

var Wechat = require('./wechat/wechat')

var app = new Koa()

var tpl = heredoc(function (){/*
    <!DOCTYPE html>
    <html>
        <head>
            <title>搜电影</title>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1">
        </head>
        <body>
            <h1>点击标题，开始录音翻译</h1>
            <p id="title"></p>
            <div id="director"></div>
            <div id="year"></div>
            <div id="poster"></div>
            <script src="https://bank-static-stg.pingan.com.cn/app_js/common/vconsole/1.0.0/vconsole.js"></script>
            <script src="http://zeptojs.com/zepto-docs.min.js"></script>
            <script src="http://res.wx.qq.com/open/js/jweixin-1.1.0.js"></script>

            <script>
                wx.config({
                    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                    appId: 'wx1274f3236ceab422', // 必填，公众号的唯一标识
                    timestamp: '<%= timestamp%>', // 必填，生成签名的时间戳
                    nonceStr: '<%= noncestr%>', // 必填，生成签名的随机串
                    signature: '<%=signature %>',// 必填，签名
                    jsApiList: [
                        'onMenuShareTimeline',
                        'onMenuShareAppMessage',
                        'startRecord',
                        'stopRecord',
                        'onVoiceRecordEnd',
                        'translateVoice'
                    ] // 必填，需要使用的JS接口列表
                })

                wx.ready(function(){
                    // 检测sdk 接口权限
                     wx.checkJsApi({
                        jsApiList: ['onVoiceRecordEnd'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
                        success: function(res) {
                            console.log(res)
                        }
                    })

                    // 分享接口
                    var shareContent = {
                        title: 'sousoussou',
                        desc: '我搜出来了啥',
                        link: 'http://wechat.t.imooc.io/nodeport',
                        imgUrl: 'http://static.mukewang.com/static/img/common/logo.png',
                        success: function() {

                          window.alert('分享ZHONGYU成功')
                        },
                        cancel: function() {
                          window.alert('分享失败')
                        }
                      }

                    wx.onMenuShareAppMessage(shareContent)
                    var slides
                    var isRecording = false


                     $('#poster').on('tap', function() {
                        wx.previewImage(slides)
                      })

                    $('h1').on('tap', function() {
                        if(!isRecording) {
                            isRecording = true

                            wx.startRecord({
                                cancel: function() {
                                    window.alert('那就不能搜了哦')
                                }
                            })

                            return
                        }
                        isRecording = false

                        wx.stopRecord({
                            success: function (res) {
                                var localId = res.localId

                                wx.translateVoice({
                                    localId: localId, // 需要识别的音频的本地Id，由录音相关接口获得
                                    isShowProgressTips: 1, // 默认为1，显示进度提示
                                    success: function (res) {
                                        var result = res.translateResult


                                        window.alert(result)

                                        $.ajax({
                                            type: 'get',
                                            url: 'https://api.douban.com/v2/movie/search?q=' + result,
                                            dataType: 'jsonp',
                                            jsonp: 'callback',
                                            success: function(data) {
                                                 console.log('搜出来的结果',data)

                                                var subject = data.subjects[0]


                                                $('#title').html(subject.title)
                                                $('#year').html(subject.year)
                                                $('#director').html(subject.directors[0].name)
                                                $('#poster').html('<img src= " ' + subject.images.large + ' " />')

                                                shareContent = {
                                                  title: subject.title,
                                                  desc: '我搜出来了 ' + subject.title,
                                                  link: 'https://github.com',
                                                  imgUrl: subject.images.large,
                                                  success: function() {
                                                    window.alert('分享2222成功')
                                                  },
                                                  cancel: function() {
                                                    window.alert('分享失败')
                                                  }
                                                }


                                                slides = {
                                                  current: subject.images.large,
                                                  urls: [subject.images.large],
                                                }

                                                data.subjects.forEach(function(item) {
                                                  slides.urls.push(item.images.large)
                                                })

                                                wx.onMenuShareAppMessage(shareContent)


                                            }
                                        })
                                    }
                                });

                            }
                        })

                    })
                });

            </script>
        </body>
    </html>
*/});

var createNonce = function() {
    return Math.random().toString(32).substr(2,15)
}

var createTimestamp = function() {
    return parseInt(new Date().getTime() / 1000 , 10) + ''
}

var _sign = function (noncestr, ticket, timestamp, url) {
    var params = [
        'noncestr=' + noncestr,
        'jsapi_ticket=' + ticket,
        'timestamp=' + timestamp,
        'url=' + url
    ]

    var str = params.sort().join('&')

    var shasum = crypto.createHash('sha1')

    shasum.update(str)

    return shasum.digest('hex')

}

function sign(ticket, url) {
    var noncestr = createNonce()
    var timestamp = createTimestamp()

    var signature = _sign(noncestr, ticket, timestamp, url)

    console.log(ticket)
    console.log(url)

    return {
        noncestr : noncestr,
        timestamp : timestamp,
        signature : signature,
    }
}

app.use(function* (next) {
    if(this.url.indexOf('/movie') > -1) {
        var wechatApi = new Wechat(config.wechat)

        var data = yield wechatApi.fetchAccessToken()
        var accessToken = data.access_token
        var ticketData = yield wechatApi.fetchTicket(accessToken)
        var ticket = ticketData.ticket

        var url = this.href.replace(':8000', '')
        var params = sign(ticket, url)

        console.log(params)

        this.body = ejs.render(tpl, params)

        return next
    }

    yield next
})

/// 传入中间件
app.use(wechat(config.wechat, reply.reply) )

app.listen(1234)


console.log('Listening 1234')

