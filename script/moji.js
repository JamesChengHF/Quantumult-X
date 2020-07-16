const CookieName = '墨迹天气'
const signurlKey = `moji_signurl`
const signheaderKey = `moji_ck`
const params_key = `params_key`
const sun_key = `sun_key`
const sun_header_key = `sun_header_key`
const sy = init()
const signurlVal = sy.getdata(signurlKey)
const signheaderVal = sy.getdata(signheaderKey)
const params_val = sy.getdata(params_key)
const sun_val = sy.getdata(sun_key)
const sun_header_val = sy.getdata(sun_header_key)

let isGetCookie = typeof $request !== 'undefined'
if (isGetCookie) {
    GetCookie()
} else {
    all()
}

function GetCookie() {
    if ($request && $request.method != 'OPTIONS' && $request.url.match(/ucrating\/sign_in\/homepage/)) {
        const signurlVal = $request.url
        const params_val = signurlVal.split(`?`)[1]
        const signheaderVal = JSON.stringify($request.headers);
        sy.log(`signurlVal:${signurlVal}`)
        sy.log(`signheaderVal:${signheaderVal}`)
        if (signurlVal) sy.setdata(signurlVal,
            signurlKey)
        if (signheaderVal) sy.setdata(signheaderVal, signheaderKey)
        if (params_val) sy.setdata(params_val, params_key)
        sy.msg(CookieName, `获取信息: 成功`, ``)
    } else if ($request && $request.method != 'OPTIONS' && $request.url.match(/suncharge\/energyHarvesting/)) {
        const sun_val = $request.url
        const sun_header_val = JSON.stringify($request.headers);
        sy.log(`sun_val:${sun_val}`)
        sy.log(`sun_header_val:${sun_header_val}`)
        if (sun_val) sy.setdata(sun_val, sun_key)
        if (sun_header_val) sy.setdata(sun_header_val, sun_header_key)
        sy.msg(CookieName, `获取收集阳光信息: 成功`, ``)
    }
    sy.done()
}
async function all() {
    await getsign();
    await getenergy();
}

//签到
function getsign() {
    return new Promise((resolve, reject) => {
        let signurl = {
            url: `https://rtn.api.moji.com/ucrating/sign_in/do?${params_val}`,
            headers: JSON.parse(signheaderVal)
        }
        sy.post(signurl, (error, response, data) => {
            sy.log(`${CookieName}, data: ${data}`)
            let result = JSON.parse(data)
            if (result.status == 1) {
                signres = `签到成功🎉 连续签到 ${result.continuous_day_count} 天`
                detail = `获得收益: ${result.reward_yuan}元💰，总共：${result.total_reward}元💰`
                    //sy.msg(CookieName, signres, detail)
            } else if (result.status == 2) {
                signres = `已经签到过❌`
                detail = `不用重复签到`
                    //sy.msg(CookieName, signres, detail)
            } else {
                signres = `签到失败❌`
                detail = `说明: ` + result.err_tips
                    //sy.msg(CookieName, signres, detail)
                return
            }
            resolve()
        })
    })
}

function getenergy() {
    let infourl = {
        url: sun_val,
        headers: JSON.parse(sun_header_val)
    }
    sy.get(infourl, (error, response, data) => {
        //sy.log(`${CookieName}, 收益: ${data}`)
        let result = JSON.parse(data)
        sy.log(`${CookieName}, data: ${result}`)
        return
        //sy.msg(CookieName, signres, detail)
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