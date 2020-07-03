const CookieName = '火山极速版'
const signurlKey = `hotsoon_signurl`
const infourlKey = `hotsoon_info`
const boxkey = `hotsoon_box`
const signheaderKey = `hotsoon_ck`
const infoheaderKey = `hotsoon_infoheader`
const boxheaderkey = `hotsoon_boxheader`
const farmheaderKey = `hotsoon_headerkey`
const farmparamKey = `hotsoon_param`
const sy = init()
const signurlVal = sy.getdata(signurlKey)
const infourlVal = sy.getdata(infourlKey)
const boxurlVal = sy.getdata(boxkey)
const signheaderVal = sy.getdata(signheaderKey)
const infoheaderVal = sy.getdata(infoheaderKey)
const boxheaderVal = sy.getdata(boxheaderkey)
const farmheaderVal = sy.getdata(farmheaderKey)
const farmparamVal = sy.getdata(farmparamKey)

const domin_sns = "https://i-hl.snssdk.com"

let isGetCookie = typeof $request !== 'undefined'
if (isGetCookie) {
    GetCookie()
} else {
    all()
}

function GetCookie() {
    if ($request && $request.method != 'OPTIONS' && $request.url.match(/task\/sign_in/)) {
        const signurlVal = $request.url
        const signheaderVal = JSON.stringify($request.headers);
        sy.log(`signurlVal:${signurlVal}`)
        sy.log(`signheaderVal:${signheaderVal}`)
        if (signurlVal) sy.setdata(signurlVal,
            signurlKey)
        if (signheaderVal) sy.setdata(signheaderVal, signheaderKey)
        sy.msg(CookieName, `获取签到地址: 成功`, ``)
    } else if ($request && $request.method != 'OPTIONS' && $request.url.match(/task\/done\/treasure_task/)) {
        const boxurlVal = $request.url
        const boxheaderVal = JSON.stringify($request.headers);
        sy.log(`boxurlval:${boxurlVal}`)
        sy.log(`boxheaderVal:${boxheaderVal}`)
        if (boxurlVal) sy.setdata(boxurlVal,
            boxkey)
        if (boxheaderVal) sy.setdata(boxheaderVal, boxheaderkey)
        sy.msg(CookieName, `获取宝箱信息: 成功`, ``)
    } else if ($request && $request.method != 'OPTIONS' && $request.url.match(/game_farm\/box\/open/)) {
        const farmurlVal = $request.url
        const farmparamVal = farmurlVal.split(`?`)[1]
        const farmheaderVal = JSON.stringify($request.headers);
        sy.log(`farmheaderVal:${farmheaderVal}`)
        sy.log(`farmparamVal:${farmparamVal}`)
        if (farmheaderVal) sy.setdata(farmheaderVal, farmheaderKey)
        if (farmparamVal) sy.setdata(farmparamVal, farmparamKey)
        sy.msg(CookieName, `获取农场信息: 成功`, ``)
    }
    sy.done()
}
async function all() {
    await getsign();
    await getbox();
    await getGameSign();
    await open_box();
    await land_water();
    await daily_task();
    await task_reward();
    await game_farm_list();
    await signinfo();
}

//签到
function getsign() {
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
        }
    })
}

function signinfo() {
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
    })
}

//开宝箱
function getbox() {
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
        }
    })
}

//游戏签到
function getGameSign() {
    let signurl = {
        url: "https://i.snssdk.com/ttgame/game_farm/reward/sign_in" + url_par + "&watch_ad=0",
        headers: JSON.parse(signheaderVal)
    }
    sy.get(signurl, (error, response, data) => {
        let result = JSON.parse(data)
        sy.log(`${CookieName}, 游戏签到: ${data}`)
        if (result.status_code == 0) {
            signres = `签到成功🎉`
            detail = `获得收益: ${result.data.score_amount}金币💰，`
        }
    })
}

//游戏宝箱
function open_box() {
    let signurl = {
        url: domin_sns + "/ttgame/game_farm/box/open" + farmparamVal,
        headers: JSON.parse(signheaderVal)
    }
    sy.get(signurl, (error, response, data) => {
        let result = JSON.parse(data)
        sy.log(`${CookieName}, 游戏宝箱: ${data}`)
        if (result.status_code == 0) {
            if (result.data.box_num > 0) {
                open_box()
            }
        }
    })
}

//浇水
function land_water() {
    let signurl = {
        url: domin_sns + "/ttgame/game_farm/land_water" + url_par,
        headers: JSON.parse(signheaderVal)
    }
    sy.get(signurl, (error, response, data) => {
        let result = JSON.parse(data)
        sy.log(`${CookieName}, 浇水: ${result.data.water}`)
        if (result.data.water > 0) {
            var step;
            for (step = 0; step < result.data.water / 10; step++) {
                land_water()
            }
        }
        if (result.data.info.length > 0) {
            let land_rows = result.data.info
            for (let _u = 0; _u < land_rows.length; _u++) {
                if (land_rows[_u]["status"] == "False" &&
                    land_rows[_u]["unlock_able"] == "True") {
                    unblock_land(land_rows[_u]["land_id"])
                }
            }
        }
    })
}

//解锁土地
function unblock_land(land_id) {
    let signurl = {
        url: domin_sns + "/ttgame/game_farm/land/unlock" + url_par + "&land_id=" + land_id,
        headers: JSON.parse(signheaderVal)
    }
    sy.get(signurl, (error, response, data) => {
        let result = JSON.parse(data)
        sy.log(`${CookieName}, 解锁土地: ${data}`)
    })
}

//领取
function daily_task() {
    let signurl = {
        url: domin_sns + "/ttgame/game_farm/daily_task/list" + url_par,
        headers: JSON.parse(signheaderVal)
    }
    sy.get(signurl, (error, response, data) => {
        let result = JSON.parse(data)
        sy.log(`${CookieName}, 任务领取: ${data}`)
        if (result.status_code == 0) {
            var step;
            for (step = 0; step < result.data.length; step++) {
                if (result.data[step]["status"] == 1) {
                    task_reward(result.data[step]["task_id"])
                }
            }
        }
    })
}

function task_reward(task_id) {
    let signurl = {
        url: domin_sns + "/ttgame/game_farm/reward/task" + url_par + "&task_id=" + task_id,
        headers: JSON.parse(signheaderVal)
    }
    sy.get(signurl, (error, response, data) => {
        let result = JSON.parse(data)
        sy.log(`${CookieName}, 任务领取: ${data}`)
    })
}

//三餐礼包
function game_farm_list() {
    let signurl = {
        url: domin_sns + "/ttgame/game_farm/gift/list" + url_par,
        headers: JSON.parse(signheaderVal)
    }
    sy.get(signurl, (error, response, data) => {
        let result = JSON.parse(data)
        sy.log(`${CookieName}, 三餐礼包: ${data}`)
        if (result.status_code == 0) {
            var step;
            for (step = 0; step < result.data.length; step++) {
                if (result.data[step]["status"] == 1) {
                    game_farm_reward(result.data[step]["task_id"])
                }
            }
        }
    })
}

function game_farm_reward() {
    let signurl = {
        url: domin_sns + "/ttgame/game_farm/reward/gift" + url_par + "&gift_id=" + task_id,
        headers: JSON.parse(signheaderVal)
    }
    sy.get(signurl, (error, response, data) => {
        let result = JSON.parse(data)
        sy.log(`${CookieName}, 三餐领取: ${data}`)
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