const CookieName = '今日头条'
const signurlKey = `tt_signurl_news`
const infourlKey = `tt_info_news`
const boxkey = `tt_box_news`
const signheaderKey = `tt_ck_news`
const infoheaderKey = `tt_infoheader_news`
const boxheaderkey = `tt_boxheader_news`
const sy = init()
const signurlVal = sy.getdata(signurlKey)
const infourlVal = sy.getdata(infourlKey)
const boxurlVal = sy.getdata(boxkey)
const signheaderVal = sy.getdata(signheaderKey)
const infoheaderVal = sy.getdata(infoheaderKey)
const boxheaderVal = sy.getdata(boxheaderkey)

const url_par = `?device_id=2647276587339464&device_platform=iphone&aid=35&os_version=13.5.1&update_version_code=7381&tma_jssdk_version=1.48.1.8&sid=&version_code=7.3.8&install_id=3667623378427758&app_name=news_article_lite&device_type=iPhone%20XR`

let isGetCookie = typeof $request !== 'undefined'
if (isGetCookie) {
    GetCookie()
} else {
    all()
}

function GetCookie() {
    if ($request && $request.method != 'OPTIONS' && $request.url.match(/task\/sign_in\/\?.*/)) {
        const signurlVal = $request.url
        const signheaderVal = JSON.stringify($request.headers);
        sy.log(`signurlVal:${signurlVal}`)
        sy.log(`signheaderVal:${signheaderVal}`)
        if (signurlVal) sy.setdata(signurlVal,
            signurlKey)
        if (signheaderVal) sy.setdata(signheaderVal, signheaderKey)
        sy.msg(CookieName, `获取签到地址: 成功`, ``)
    } else if ($request && $request.method != 'OPTIONS' && $request.url.match(/user\/info/)) {
        const infourlVal = $request.url
        const infoheaderVal = JSON.stringify($request.headers);
        sy.log(`infourlVal:${infourlVal}`)
        sy.log(`infoheaderVal:${infoheaderVal}`)
        if (infourlVal) sy.setdata(infourlVal,
            infourlKey)
        if (infoheaderVal) sy.setdata(infoheaderVal, infoheaderKey)
        sy.msg(CookieName, `获取信息Cookie: 成功`, ``)
    } else if ($request && $request.method != 'OPTIONS' && $request.url.match(/task\/open_treasure_box/)) {
        const boxurlVal = $request.url
        const boxheaderVal = JSON.stringify($request.headers);
        sy.log(`boxurlval:${boxurlVal}`)
        sy.log(`boxheaderVal:${boxheaderVal}`)
        if (boxurlVal) sy.setdata(boxurlVal,
            boxkey)
        if (boxheaderVal) sy.setdata(boxheaderVal, boxheaderkey)
        sy.msg(CookieName, `获取宝箱信息: 成功`, ``)
    }
    sy.done()
}
async function all() {
    await getsign();
    await getbox();
    await signinfo();
}

//签到
function getsign() {
    return new Promise((resolve, reject) => {
        let signurl = {
            url: signurlVal,
            headers: JSON.parse(signheaderVal)
        }
        sy.post(signurl, (error, response, data) => {
            sy.log(`${CookieName}, data: ${data}`)
            let result = JSON.parse(data)
            if (result.err_no == 0) {
                signres = `签到成功🎉`
                detail = `获得收益: ${result.data.score_amount}金币💰，`
            } else if (result.err_tips == "已经完成过") {
                signres = `已经签到过❌`
                detail = `不用重复签到`
                    //sy.msg(CookieName, signres, detail)
            } else {
                signres = `签到失败❌`
                detail = `说明: ` + result.err_tips
                sy.msg(CookieName, signres, detail)
                return
            }
            resolve()
        })
    })
}

function signinfo() {
    return new Promise((resolve, reject) => {
        let infourl = {
            url: infourlVal,
            headers: JSON.parse(infoheaderVal)
        }
        sy.get(infourl, (error, response, data) => {
            sy.log(`${CookieName}, 收益: ${data}`)
            let result = JSON.parse(data)
            if (result.err_no == 0) {
                signcoin = `金币总计: ${result.data.score.amount}💰，`
                cashdetail += '现金余额' + result.data.cash.amount
                sy.msg(CookieName, signcoin, cashdetail)
            } else {
                return
            }
            //sy.msg(CookieName, signres, detail)
            resolve()
        })
    })
}

//开宝箱
function getbox() {
    return new Promise((resolve, reject) => {
        let boxurl = {
            url: boxurlVal,
            headers: JSON.parse(boxheaderVal)
        }
        sy.post(boxurl, (error, response, data) => {
            sy.log(`${CookieName}, 宝箱: ${data}`)
            let result = JSON.parse(data)
            if (result.err_no == 0) {
                boxres = `开宝箱成功🎉`
                detail = `获得收益: ${result.data.score_amount}金币💰，${signcoin} ${cashdetail}`
            } else {
                boxres = `开宝箱失败❌`
                detail = `说明: ` + result.err_tips
                sy.msg(CookieName, boxres, detail)
                return
            }
            resolve()
        })
    })
}

//游戏签到
function getGameSign() {
    return new Promise((resolve, reject) => {
        let signurl = {
            url: "https://i.snssdk.com/ttgame/game_farm/reward/sign_in" + url_par + "&watch_ad=0",
            headers: JSON.parse(signheaderVal)
        }
        sy.post(signurl, (error, response, data) => {
            let result = JSON.parse(data)
            if (result.status_code == 0) {
                signres = `签到成功🎉`
                detail = `获得收益: ${result.data.score_amount}金币💰，`
            }
            resolve()
        })
    })
}

//游戏宝箱
function open_box() {
    return new Promise((resolve, reject) => {
        let signurl = {
            url: "https://i.snssdk.com/ttgame/game_farm/box/open" + url_par,
            headers: JSON.parse(signheaderVal)
        }
        sy.post(signurl, (error, response, data) => {
            let result = JSON.parse(data)
            if (result.box_num > 0) {
                open_box()
            }
            resolve()
        })
    })
}

//浇水
function land_water() {
    return new Promise((resolve, reject) => {
        let signurl = {
            url: "https://i.snssdk.com/ttgame/game_farm/land_water" + url_par,
            headers: JSON.parse(signheaderVal)
        }
        sy.post(signurl, (error, response, data) => {
            let result = JSON.parse(data)
            if (result.data.water > 0) {
                land_water()
            }
            resolve()
        })
    })
}

//领取
function daily_task() {
    return new Promise((resolve, reject) => {
        let signurl = {
            url: "https://i.snssdk.com/ttgame/game_farm/daily_task/list" + url_par,
            headers: JSON.parse(signheaderVal)
        }
        sy.post(signurl, (error, response, data) => {
            let result = JSON.parse(data)
            if (result.status_code == 0) {
                var step;
                for (step = 0; step < result.data.length; step++) {
                    if (result.data[step]["status"] == 1) {
                        task_reward(result.data[step]["task_id"])
                    }
                }
            }
            resolve()
        })
    })
}

function task_reward(task_id) {
    return new Promise((resolve, reject) => {
        let signurl = {
            url: "https://i.snssdk.com/ttgame/game_farm/reward/task" + url_par + "&task_id=" + task_id,
            headers: JSON.parse(signheaderVal)
        }
        sy.post(signurl, (error, response, data) => {
            let result = JSON.parse(data)
            resolve()
        })
    })
}

function init() {
    isSurge = () => {
        return undefined === this.$httpClient ? false : true
    }
    isQuanX = () => {
        return undefined === this.$task ? false : true
    }
    getdata = (key) => {
        if (isSurge()) return $persistentStore.read(key)
        if (isQuanX()) return $prefs.valueForKey(key)
    }
    setdata = (key, val) => {
        if (isSurge()) return $persistentStore.write(key, val)
        if (isQuanX()) return $prefs.setValueForKey(key, val)
    }
    msg = (title, subtitle, body) => {
        if (isSurge()) $notification.post(title, subtitle, body)
        if (isQuanX()) $notify(title, subtitle, body)
    }
    log = (message) => console.log(message)
    get = (url, cb) => {
        if (isSurge()) {
            $httpClient.get(url, cb)
        }
        if (isQuanX()) {
            url.method = 'GET'
            $task.fetch(url).then((resp) => cb(null, {}, resp.body))
        }
    }
    post = (url, cb) => {
        if (isSurge()) {
            $httpClient.post(url, cb)
        }
        if (isQuanX()) {
            url.method = 'POST'
            $task.fetch(url).then((resp) => cb(null, {}, resp.body))
        }
    }
    done = (value = {}) => {
        $done(value)
    }
    return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done }
}