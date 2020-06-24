const CookieName = '今日头条'
const signurlKey = `tt_signurl_news`
const infourlKey = `tt_info_news`
const boxkey = `tt_box_news`
const boxinfokey = `tt_box_info_news`
const signheaderKey = `tt_ck_news`
const infoheaderKey = `tt_infoheader_news`
const boxheaderkey = `tt_boxheader_news`
const sy = init()
const signurlVal = sy.getdata(signurlKey)
const infourlVal = sy.getdata(infourlKey)
const boxlurlVal = sy.getdata(boxkey)
const signheaderVal = sy.getdata(signheaderKey)
const infoheaderVal = sy.getdata(infoheaderKey)
const boxheaderVal = sy.getdata(boxheaderkey)
const boxinfoval = sy.getdata(boxinfokey)

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
        const boxurlval = $request.url
        const boxheaderVal = JSON.stringify($request.headers);
        sy.log(`boxurlval:${boxurlval}`)
        sy.log(`boxheaderVal:${boxheaderVal}`)
        if (boxurlval) sy.setdata(boxurlval,
            boxkey)
        if (boxheaderVal) sy.setdata(boxheaderVal, boxheaderkey)
        sy.msg(CookieName, `获取宝箱信息: 成功`, ``)
    }
}
async function all() {
    await signinfo();
    if (boxinfoval) {
        if (boxinfoval.data.current_time >= next_treasure_time) {
            await getbox();
        }
    } else {
        await getbox();
    }
    await getsign();
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
        sy.post(infourl, (error, response, data) => {
            sy.log(`${CookieName}, data: ${data}`)
            let result = JSON.parse(data)
            if (result.err_no == 0) {
                signcoin = `金币总计: ${result.data.score.amount}💰，`
                detail += '现金余额' + result.data.cash.amount
            }
            sy.msg(CookieName, signres, detail)
        })
        resolve()
    })
}

//开宝箱
function getbox() {
    return new Promise((resolve, reject) => {
        let boxurl = {
            url: boxurlval,
            headers: JSON.parse(boxheaderVal)
        }
        sy.post(boxurl, (error, response, data) => {
            sy.log(`${CookieName}, data: ${data}`)
            let result = JSON.parse(data)
            if (result.err_no == 0) {
                sy.setdata(boxinfoval, boxinfokey)
                boxres = `开宝箱成功🎉`
                detail = `获得收益: ${result.data.score_amount}金币💰，`
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