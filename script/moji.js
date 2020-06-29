const CookieName = '墨迹天气'
const signurlKey = `moji_signurl`
const signheaderKey = `moji_ck`
const sy = init()
const signurlVal = sy.getdata(signurlKey)
const signheaderVal = sy.getdata(signheaderKey)

let isGetCookie = typeof $request !== 'undefined'
if (isGetCookie) {
    GetCookie()
} else {
    all()
}

function GetCookie() {
    if ($request && $request.method != 'OPTIONS' && $request.url.match(/ucrating\/sign_in\/do/)) {
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
    sy.done()
}
async function all() {
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
            if (result.status == 1) {
                signres = `签到成功🎉 连续签到 ${result.continuous_day_count} 天`
                detail = `获得收益: ${result.reward_yuan}元💰，总共：${result.total_reward}元💰`
            } else if (result.status == 2) {
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