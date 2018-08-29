'use strict'

var Koa = require('koa')

var path = require('path')

var wechat = require('./wechat/g')

var util = require('./libs/util')

var wechat_file = path.join(__dirname, './config/wechat.txt')



var config = {
    wechat: {
        appID: 'wx1274f3236ceab422',
        appSecret: '62681f0caad7b800e52cf1b59ce36bf7',
        token: 'shenma',
        getAccessToken: function () {
            return util.readFileAsync(wechat_file)
        },
        saveAccessToken: function (data) {
            data = JSON.stringify(data)
            return util.writeFileAsync(wechat_file, data)
        }
    }
}



var app = new Koa()

app.use(wechat(config.wechat))

app.listen(1234)


console.log('Listening 1234')

