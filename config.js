'use strict'

var path = require('path')

var util = require('./libs/util')

var wechat_file = path.join(__dirname, './config/wechat.txt')

var wechat_ticket_file = path.join(__dirname, './config/wechat_ticket.txt')

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
        },
        getTicket: function() {
            return util.readFileAsync(wechat_ticket_file)
        },
        saveTicket: function(data) {
            data = JSON.stringify(data)

            return util.writeFileAsync(wechat_ticket_file, data)
        }
    }
}


module.exports = config
