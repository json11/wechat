'use strict'

/**
 *  将此模块封装成中间件
 */

var sha1 = require('sha1')

var getRawBody = require('raw-body')

var Wechat = require('./wechat')

var path = require('path')

var util = require('./util')

/**
 *  保存日志
 */

var tUtil = require('../libs/util')

var wechat_req_file = path.join(__dirname, '../config/req.txt')
var wechat_resp_file = path.join(__dirname, '../config/resp.txt')


module.exports= function(opts) {

    var wechat = new Wechat(opts)

    // 返回一个generate 函数
    return function *(next) {
        console.log(this.query)

        var that = this

        var token = opts.token

        var signature = this.query.signature

        var nonce = this.query.nonce

        var timestamp = this.query.timestamp

        var echostr = this.query.echostr;

        var str = [token, timestamp, nonce].sort().join('')

        var sha = sha1(str)

        if(this.method === 'GET') {
            if (sha === signature) {
                this.body = echostr + ''
            } else {
                this.body = 'wrong'
            }
        }
        else if(this.method == 'POST') {
            if(sha !== signature) {
                this.body = 'wrong'

                return false
            }

            var data = yield getRawBody(this.req, {
                length: this.length,
                limit: '1mb',
                encoding: this.charset,
            })

            // console.log(data.toString())


            var content = yield util.parseXMLAsync(data)

            console.log(content)

            var message = util.formatMessage(content.xml)

            console.log(message)

            tUtil.writeFileAsync(wechat_req_file, JSON.stringify(message));



            this.weixin = message

            /// 暂停这里 将逻辑交给业务层 由外层来决定如何解析回复 外层控制器handler
            yield handler.call(this, next)

            /// 外层已经处理完了
            /// 这里是真正的回复
            wechat.reply.call(this)
        }

    }
}


