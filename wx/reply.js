
'use strict'

var path = require('path')

var config = require('../config')

var Wechat = require('../wechat/wechat')

var menu = require('./menu')



var wechatApi = new Wechat(config.wechat)

/**
 *  先删除菜单 -- 再重新生成菜单
 */
wechatApi.deleteMenu().then(function() {
    return wechatApi.createMenu(menu)
})
    .then(function(msg) {
        console.log('msg', msg)
    })


/**
 *   业务层回复机制
 * @param next
 * @returns {IterableIterator<*>}
 */
exports.reply = function* (next) {
    var message  =  this.weixin

    if(message.MsgType === 'event') {

        if(message.Event === 'subscribe') {
            if(message.EventKey) {
                console.log('扫二维码进来： ' + message.EventKey + ' ' + message.ticket)
            }

            this.body = '哈哈， 你订阅了这个号\r\n'
        }

        else if(message.Event === 'unsubscribe') {
            console.log('取消关注')

            this.body = ''
        }

        else if (message.Event === 'LOCATION') {
            this.body = '您上报的位置是： ' + message.Latitude + '/' + message.Longitude + '-' + message.Precision
        }
        else if (message.Event === 'SCAN') {
            console.log('关注后扫二维码' + message.EventKey + ' ' + message.Ticket)

            this.body = '看到你扫了一下哦'
        }
        else if (message.Event === 'VIEW') {
            this.body = '您点击了菜单中的链接 ： ' + message.EventKey
        }
        else if (message.Event === 'scancode_push') {
            console.log(message.ScanCodeInfo.ScanType)
            console.log(message.ScanCodeInfo.ScanResult)
            this.body = '您点击了菜单中 ： ' + message.EventKey
        }
        else if (message.Event === 'scancode_waitmsg') {
            console.log(message.ScanCodeInfo.ScanType)
            console.log(message.ScanCodeInfo.ScanResult)
            this.body = '您点击了菜单中 ： ' + message.EventKey
        }
        else if (message.Event === 'pic_sysphoto') {
            console.log(message.SendPicsInfo.PicList)
            console.log(message.SendPicsInfo.Count)
            this.body = '您点击了菜单中 ： ' + message.EventKey
        }
        else if (message.Event === 'pic_photo_or_album') {
            console.log(message.SendPicsInfo.PicList)
            console.log(message.SendPicsInfo.Count)
            this.body = '您点击了菜单中 ： ' + message.EventKey
        }
        else if (message.Event === 'pic_weixin') {
            console.log(message.SendPicsInfo.PicList)
            console.log(message.SendPicsInfo.Count)
            this.body = '您点击了菜单中 ： ' + message.EventKey
        }
        else if (message.Event === 'location_select') {
            console.log(message.SendLocationInfo.Location_X)
            console.log(message.SendLocationInfo.Location_Y)
            console.log(message.SendLocationInfo.Scale)
            console.log(message.SendLocationInfo.Label)
            console.log(message.SendLocationInfo.Poiname)
            this.body = '您点击了菜单中 ： ' + message.EventKey
        }
        else if(message.Event === 'CLICK') {
            this.body = '您点击了菜单' + message.EventKey
        }

    }
    else if(message.MsgType === 'text') {
        var content = message.Content
        var reply = '你说的 ' + message.Content + ' 太复杂了'

        if(content === '1') {
            reply = '天下第一'
        } else if(content === '2') {
            reply = '天下第二'
        } else if(content === '3') {
            reply = '天下第三'
        } else if(content === '4') {
            reply = [{
                title: '大牛的自我修养',
                description: '多睡觉',
                picUrl: 'http://img.zcool.cn/community/0117e2571b8b246ac72538120dd8a4.jpg@1280w_1l_2o_100sh.jpg',
                url: 'https://jsonp999.cn'
            }]
        } else if(content === '5') {
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname , '../logo.png') )

            reply= {
                type: 'image',
                mediaId: data.media_id
            }
        } else if(content === '6') {
            var data = yield wechatApi.uploadMaterial('video', path.join(__dirname , '../1.mp4') )

            reply= {
                type: 'video',
                title: '宝贝',
                description: '聪明的小宝宝',
                mediaId: data.media_id
            }
        } else if(content === '7') { // music
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname , '../logo.png') )

            reply= {
                type: 'music',
                title: '宝贝唱歌',
                description: '聪明的小宝宝',
                thumbMediaId: data.media_id,
                musicUrl: 'http://mpge.5nd.com/2015/2015-9-12/66325/1.mp3'
            }
        } else if(content === '8') {
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname , '../logo.png'), {type: 'image'})

            reply= {
                type: 'image',
                mediaId: data.media_id
            }
        } else if(content === '9') {
            var data = yield wechatApi.uploadMaterial('video', path.join(__dirname , '../1.mp4'), {type: 'video', description: '{"title": "Really a nice place", "introduction": "Never think it so easy"}'})

            reply= {
                type: 'video',
                title: '宝贝',
                description: '聪明的小宝宝',
                mediaId: data.media_id
            }
        }

        else if (content === '10') {
            var picData = yield wechatApi.uploadMaterial('image', path.join(__dirname, '../logo.png'), {})

            var media = {
                articles: [{
                    title: 'tututu4',
                    thumb_media_id: picData.media_id,
                    author: 'Scott',
                    digest: '没有摘要',
                    show_cover_pic: 1,
                    content: '没有内容',
                    content_source_url: 'https://github.com'
                }, {
                    title: 'tututu5',
                    thumb_media_id: picData.media_id,
                    author: 'Scott',
                    digest: '没有摘要',
                    show_cover_pic: 1,
                    content: '没有内容',
                    content_source_url: 'https://github.com'
                }]
            }

            data = yield wechatApi.uploadMaterial('news', media, {})
            data = yield wechatApi.fetchMaterial(data.media_id, 'news', {})

            console.log(data)

            var items = data.news_item
            var news = []

            items && items.forEach(function(item) {
                news.push({
                    title: item.title,
                    decription: item.digest,
                    picUrl: picData.url,
                    url: item.url
                })
            })

            reply = news
        }


        else if (content === '11') {
            var counts = yield wechatApi.countMaterial()

            console.log(JSON.stringify(counts))

            var results = yield [
                wechatApi.batchMaterial({
                    type: 'image',
                    offset: 0,
                    count: 10
                }),
                wechatApi.batchMaterial({
                    type: 'video',
                    offset: 0,
                    count: 10
                }),
                wechatApi.batchMaterial({
                    type: 'voice',
                    offset: 0,
                    count: 10
                }),
                wechatApi.batchMaterial({
                    type: 'news',
                    offset: 0,
                    count: 10
                })
            ]

            console.log(JSON.stringify(results))

            reply = '1'
        }

        else if (content === '12') {
            var group = yield wechatApi.createGroup('wechat2')

            console.log('新分组 wechat2')
            console.log(group)

            var groups = yield wechatApi.fetchGroups()
            //
            console.log('加了 wechat 后的分组列表')
            console.log(groups)

            var group2 = yield wechatApi.checkGroup(message.FromUserName)

            console.log('查看自己的分组')

            console.log(group2)

            var result = yield wechatApi.moveGroup(message.FromUserName, 102)
            console.log('移动到  102')
            console.log(result)

            var groups2 = yield wechatApi.fetchGroups()

            console.log('移动后的分组列表')
            console.log(groups2)

            var result2 = yield wechatApi.moveGroup([message.FromUserName], 105)
            console.log('批量移动到  119')
            console.log(result2)

            var groups3 = yield wechatApi.fetchGroups()

            console.log('批量移动后的分组列表')
            console.log(groups3)

            var result3 = yield wechatApi.updateGroup(105, 'wechat105')

            console.log('105 wechat2 改名 wechat105')
            console.log(result3)

            var groups4 = yield wechatApi.fetchGroups()

            console.log('改名后的分组列表')
            console.log(groups4)

            var result4 = yield wechatApi.deleteGroup(106)

            console.log('删除 106 tututu 分组')

            console.log(result4)


            var groups5 = yield wechatApi.fetchGroups()

            console.log('删除 106 后分组列表')
            console.log(groups5)


            reply = JSON.stringify(group2)
        }

        else if (content === '13') {
            var user = yield wechatApi.fetchUsers(message.FromUserName, 'en')

            console.log(user)

            var openIds = [
                {
                    openid: message.FromUserName,
                    lang: 'en'
                }
            ]

            var users = yield wechatApi.fetchUsers(openIds)

            console.log(users)

            reply = JSON.stringify(user)
        }

        else if (content === '14') {
            var userlist = yield wechatApi.listUsers()

            console.log(userlist)

            reply = userlist.total
        }

        else if (content === '15') {
            var mpnews = {
                media_id: '‌XPIoNp51OvkV5R5lbi9gGXb8xUSlcRxAf9N8uIQafUcQSKh_FT1eJU_dZiBvqO63'
            }
            var text = {
                'content': 'Hello Wechat'
            }

            var msgData = yield wechatApi.sendByGroup('mpnews', mpnews, 105)

            console.log(msgData)
            reply = 'Yeah!'
        }

        else if (content === '16') {
            var mpnews = {
                media_id: '‌XPIoNp51OvkV5R5lbi9gGXb8xUSlcRxAf9N8uIQafUcQSKh_FT1eJU_dZiBvqO63'
            }
            // var text = {
            //   'content': 'Hello Wechat'
            // }

            var msgData = yield wechatApi.previewMass('mpnews', mpnews, 'oSEWM1oQnOOI1Z1nU_TBs3xijcMw')

            console.log(msgData)
            reply = 'Yeah!'
        }

        else if (content === '17') {
            var msgData = yield wechatApi.checkMass('6588741928851818315')

            console.log(msgData)
            reply = 'Yeah hah!'
        }

        else if (content === '18') {
            // var tempQr = {
            //   expire_seconds: 400000,
            //   action_name: 'QR_SCENE',
            //   action_info: {
            //     scene: {
            //       scene_id: 123
            //     }
            //   }
            // }

            // var permQr = {
            //   action_name: 'QR_LIMIT_SCENE',
            //   action_info: {
            //     scene: {
            //       scene_id: 123
            //     }
            //   }
            // }

            // var permStrQr = {
            //   action_name: 'QR_LIMIT_STR_SCENE',
            //   action_info: {
            //     scene: {
            //       scene_str: 'abc'
            //     }
            //   }
            // }

            //var qr1 = yield wechatApi.createQrcode(tempQr)
            //var qr2 = yield wechatApi.createQrcode(permQr)
            //var qr3 = yield wechatApi.createQrcode(permStrQr)


            reply = 'Yeah hah!'
        }

        else if (content === '19') {
            var longUrl = 'http://www.imooc.com/'

            var shortData = yield wechatApi.createShorturl(null, longUrl)

            reply = shortData.short_url
        }

        else if (content === '20') {
            var semanticData = {
                query: '寻龙诀',
                city: '杭州',
                category: 'movie',
                uid: message.FromUserName
            }

            var _semanticData = yield wechatApi.semantic(semanticData)


            reply = JSON.stringify(_semanticData)
        }


        this.body = reply
    }

    yield next
}