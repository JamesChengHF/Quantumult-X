const $ = API("jrtt", true); // API("APP") --> 无log输出

const CookieName = '今日头条'
const signurlKey = `tt_signurl_news`
const infourlKey = `tt_info_news`
const signheaderKey = `tt_ck_news`
const infoheaderKey = `tt_infoheader_news`
const sy = init()
const signurlVal = sy.getdata(signurlKey)
const infourlVal = sy.getdata(infourlKey)
const signheaderVal = sy.getdata(signheaderKey)
const infoheaderVal = sy.getdata(infoheaderKey)

let isGetCookie = typeof $request !== 'undefined'
if (isGetCookie) {
    GetCookie()
} else {
    all()
}

function GetCookie() {
    if ($request && $request.method != 'OPTIONS' && $request.url.match(/task\/sign_in\?(.*)/)) {
        const signurlVal = $request.url
        const signheaderVal = JSON.stringify($request.headers);
        sy.log(`signurlVal:${signurlVal}`) sy.log(`signheaderVal:${signheaderVal}`) if (signurlVal) sy.setdata(signurlVal,
                signurlKey)
        if (signheaderVal) sy.setdata(signheaderVal, signheaderKey)
        sy.msg(CookieName, `获取签到地址: 成功`, ``)
    } else if ($request && $request.method != 'OPTIONS' && $request.url.match(/user\/profit_detail/)) {
        const infourlVal = $request.url
        const infoheaderVal = JSON.stringify($request.headers);
        sy.log(`infourlVal:${infourlVal}`)
        sy.log(`infoheaderVal:${infoheaderVal}`)
        if (infourlVal) sy.setdata(infourlVal,
            infourlKey)
        if (infoheaderVal) sy.setdata(infoheaderVal, infoheaderKey)
        sy.msg(CookieName, `获取信息Cookie: 成功`, ``)
    }
}
async function all() {
    await getsign();
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
            //sy.log(`${CookieName}, data: ${data}`)
            let result = JSON.parse(data)
            if (result.err_no == 0) {
                signcoin = `金币总计: ${result.data.score_balance}💰，`
                detail += '现金余额' + result.data.cash_balance
            }
            sy.msg(CookieName, signres, detail)
        })
        resolve()
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

// prettier-ignore
/*********************************** API *************************************/
function API(t = "untitled", e = !1) {
    return new class {
        constructor(t, e) { this.name = t, this.debug = e, this.isQX = "undefined" != typeof $task, this.isLoon = "undefined" != typeof $loon, this.isSurge = "undefined" != typeof $httpClient && !this.isLoon, this.isNode = "function" == typeof require, this.isJSBox = this.isNode && "undefined" != typeof $jsbox, this.node = (() => this.isNode ? { request: "undefined" != typeof $request ? void 0 : require("request"), fs: require("fs") } : null)(), this.cache = this.initCache(), this.log(`INITIAL CACHE:\n${JSON.stringify(this.cache)}`), Promise.prototype.delay = function(t) { return this.then(function(e) { return ((t, e) => new Promise(function(s) { setTimeout(s.bind(null, e), t) }))(t, e) }) } }
        get(t) { return this.isQX ? ("string" == typeof t && (t = { url: t, method: "GET" }), $task.fetch(t)) : new Promise((e, s) => { this.isLoon || this.isSurge ? $httpClient.get(t, (t, i, o) => { t ? s(t) : e({...i, body: o }) }) : this.node.request(t, (t, i, o) => { t ? s(t) : e({...i, status: i.statusCode, body: o }) }) }) }
        post(t) { return this.isQX ? ("string" == typeof t && (t = { url: t }), t.method = "POST", $task.fetch(t)) : new Promise((e, s) => { this.isLoon || this.isSurge ? $httpClient.post(t, (t, i, o) => { t ? s(t) : e({...i, body: o }) }) : this.node.request.post(t, (t, i, o) => { t ? s(t) : e({...i, status: i.statusCode, body: o }) }) }) }
        initCache() { if (this.isQX) return JSON.parse($prefs.valueForKey(this.name) || "{}"); if (this.isLoon || this.isSurge) return JSON.parse($persistentStore.read(this.name) || "{}"); if (this.isNode) { const t = `${this.name}.json`; return this.node.fs.existsSync(t) ? JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)) : (this.node.fs.writeFileSync(t, JSON.stringify({}), { flag: "wx" }, t => console.log(t)), {}) } }
        persistCache() {
            const t = JSON.stringify(this.cache);
            this.log(`FLUSHING DATA:\n${t}`), this.isQX && $prefs.setValueForKey(t, this.name), (this.isLoon || this.isSurge) && $persistentStore.write(t, this.name), this.isNode && this.node.fs.writeFileSync(`${this.name}.json`, t, { flag: "w" }, t => console.log(t))
        }
        write(t, e) { this.log(`SET ${e} = ${JSON.stringify(t)}`), this.cache[e] = t, this.persistCache() }
        read(t) { return this.log(`READ ${t} ==> ${JSON.stringify(this.cache[t])}`), this.cache[t] }
        delete(t) { this.log(`DELETE ${t}`), delete this.cache[t], this.persistCache() }
        notify(t, e, s, i) {
            const o = "string" == typeof i ? i : void 0,
                n = s + (null == o ? "" : `\n${o}`);
            this.isQX && (void 0 !== o ? $notify(t, e, s, { "open-url": o }) : $notify(t, e, s, i)), this.isSurge && $notification.post(t, e, n), this.isLoon && $notification.post(t, e, s), this.isNode && (this.isJSBox ? require("push").schedule({ title: t, body: e ? e + "\n" + s : s }) : console.log(`${t}\n${e}\n${n}\n\n`))
        }
        log(t) { this.debug && console.log(t) }
        info(t) { console.log(t) }
        error(t) { console.log("ERROR: " + t) }
        wait(t) { return new Promise(e => setTimeout(e, t)) }
        done(t = {}) { this.isQX || this.isLoon || this.isSurge ? $done(t) : this.isNode && !this.isJSBox && "undefined" != typeof $context && ($context.headers = t.headers, $context.statusCode = t.statusCode, $context.body = t.body) }
    }(t, e)
}
/*****************************************************************************/