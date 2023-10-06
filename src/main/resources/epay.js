let halyk, tableId, radioCompId, radioCompTrueValue, sumComponent, paymentTableList, registryCode, formEpayTableId,
    paymentInfo = {};
const INVOICE_PARAM_ID = "invoice_number_id";
const TRANSACTION_SUM_ID = "numericinput_amount";
const STATUS_PARAM_ID = "status_pay";
// Инициализация параметров переданных из основной формы в ПК
const loadEpayParams = function (epay_params) {
    try {
        tableId = epay_params.tableId;
        radioCompId = epay_params.radioCompId;
        radioCompTrueValue = epay_params.radioCompTrueValue;
        sumComponent = epay_params.sumComponent;
        paymentTableList = epay_params.paymentTableList;
        registryCode = epay_params.registryCode;
        formEpayTableId = epay_params.formEpayTableId;
    } catch (e) {
        console.log(e);
        alert("Неверно заданы параметры для работы с epay, а именно tableId, radioCompId, radioCompTrueValue, sumComponent, paymentTableList");
    }
}
console.log(model.epay_params);
if (model.epay_params == undefined)
    return;
loadEpayParams(model.epay_params);

// Инициализация параметров для работы с сервисами
const TEST_URL = "https://testepay.homebank.kz/api/check-status/payment/transaction/";
const PROD_URL = "https://epay-api.homebank.kz/check-status/payment/transaction/";
const PROD_AUTH_SERVER = "https://epay-oauth.homebank.kz/oauth2/token";
const QAZPATENT_URL = "https://cabinet.kazpatent.kz/qp";
const CURRENT_URL = "https://cabinet.kazpatent.kz/";

const getPaymentToken = async (invoiceId, sum) => {
    return new Promise(resolve => {
        var form = new FormData();
        form.append("grant_type", "client_credentials");
        form.append("scope", "webapi usermanagement email_send verification statement statistics payment");
        form.append("client_id", "KAZPATENT.KZ");                                                           // prod
        form.append("client_secret", "kH(bt1(rmuQxVDt");                                                    // prod
        form.append("invoiceID", invoiceId);
        form.append("amount", sum);
        form.append("currency", "KZT");
        form.append("terminal", "936cc0a6-10ad-48e2-b524-be41383cfc2e");                                    // prod
        form.append("postLink", QAZPATENT_URL);
        form.append("failurePostLink", QAZPATENT_URL);

        try {
            $.ajax({
                "url": PROD_AUTH_SERVER,
                "method": "POST",
                "timeout": 0,
                "processData": false,
                "mimeType": "multipart/form-data",
                "contentType": false,
                "data": form
            }).done(function (response) {
                console.log("success");
                console.log(response);
                resolve(response);
            }).fail(function (response) {
                console.log("fail");
                console.log(response);
                resolve(response.responseJSON);
            })
        } catch (e) {
            console.error(e);
            resolve({});
        }
    });
};

const getPaymentStatus = async (invoiceId, token) => {
    return new Promise(resolve => {
        try {
            $.ajax({
                "url": PROD_URL + invoiceId,
                "method": "GET",
                "timeout": 0,
                "headers": {
                    "Authorization": "Bearer " + token
                },
            }).done(function (response) {
                console.log(response);
                resolve(response);
            }).fail(function (response) {
                console.log(response);
                resolve(response.responseJSON);
            })
        } catch (e) {
            console.error(e);
            resolve({});
        }
    });
}

const updateTheRowData = function (res, paymentInfo, success) {
    res.forEach(elem => {
        switch (elem.asfProperty.id) {
            case "reglink_epay_id":
                if (paymentInfo.documentId != null)
                    elem.setValue(paymentInfo.documentId);
                break;
            case STATUS_PARAM_ID:
                if (!success)
                    elem.setValue(["2"]);
                else
                    elem.setValue(paymentInfo.statusName);
                break;
            case "transaction_time":
                if (paymentInfo.createdDate != null)
                    elem.setValue(paymentInfo.createdDate);
                break;
            case TRANSACTION_SUM_ID:
                if (paymentInfo.amount != null)
                    elem.setValue(paymentInfo.amount + "");
                break;
            case INVOICE_PARAM_ID:
                elem.setValue(paymentInfo.invoiceID);
                break;
            case "invoice_reference":
                elem.setValue(paymentInfo.reference);
                break;
            case "card_holder_fio":
                elem.setValue(paymentInfo.name);
                break;
            case "card_holder_email":
                elem.setValue(paymentInfo.email);
                break;
            case "card_number":
                elem.setValue(paymentInfo.cardMask);
                break;
            case "card_status_json":
                elem.setValue(paymentInfo.json);
                break;
        }
    });
}

const updatePaymentInfo = function (res, paymentInfo) {
    if (res != null && res.resultCode === "100" && res.transaction != null) {
        paymentInfo.terminal = res.transaction.terminal != null ? res.transaction.terminal : "";
        paymentInfo.reference = res.transaction.reference != null ? res.transaction.reference : "";
        paymentInfo.cardMask = res.transaction.cardMask != null ? res.transaction.cardMask : "";
        paymentInfo.name = res.transaction.name != null ? res.transaction.name : "";
        paymentInfo.email = res.transaction.email != null ? res.transaction.email : "";
        paymentInfo.amount = res.transaction.amount != null ? res.transaction.amount : "";
        paymentInfo.invoiceID = res.transaction.invoiceID != null ? res.transaction.invoiceID : "";

        paymentInfo.statusName = res.transaction.statusName != null ? res.transaction.statusName : "";

        switch (res.transaction.statusName) {
            case "REFUND":
                paymentInfo.statusName = ["5"];   // alert("Был осуществлён возврат списанной суммы")
                break;
            case "AUTH":
                paymentInfo.statusName = ["4"];   // alert("Сумма в блоке")
                break;
            case "CANCEL":
                paymentInfo.statusName = [];   // alert("Сумма разблокирована")
                break;
            case "CHARGE":
                paymentInfo.statusName = ["3"];   // alert("Сумма списана")
                break;
            case "FAILED":
                paymentInfo.statusName = ["2"];   // alert("Транзакция неуспешная")
                break;
            case "3D":
                paymentInfo.statusName = ["2"];   // alert("Транзакция неуспешная")
                break;
            case "NEW":
                paymentInfo.statusName = ["4"];   // alert("Операция создалась но пока находится в промежуточном состоянии (если вы получили этот статус при запросе статуса транзакции вручную, то примите во внимание что он может быть изменён)")
                break;
            case "REJECT":
                paymentInfo.statusName = ["2"];   // alert("Неуспешная попытка оплаты")
                break;
        }

        paymentInfo.json = JSON.stringify(res);

        let transaction_date = new Date(res.transaction.createdDate);
        paymentInfo.createdDate = transaction_date.getFullYear() +
            "-" + ((transaction_date.getMonth() + 1) > 9 ? (transaction_date.getMonth() + 1) : "0" + (transaction_date.getMonth() + 1)) +
            "-" + (transaction_date.getDate() > 9 ? transaction_date.getDate() : "0" + transaction_date.getDate()) +
            " " + (transaction_date.getHours() > 9 ? transaction_date.getHours() : "0" + transaction_date.getHours()) +
            ":" + (transaction_date.getMinutes() > 9 ? transaction_date.getMinutes() : "0" + transaction_date.getMinutes()) +
            ":" + (transaction_date.getSeconds() > 9 ? transaction_date.getSeconds() : "0" + transaction_date.getSeconds());
    }
}

if (editable) {
    if (AS.OPTIONS.login == null || AS.OPTIONS.password == null) {
        alert("Нет возможности получения логина и пароля для доступа к API создания нового платежа");
        return;
    }
    const authorization = ("Basic " + btoa(AS.OPTIONS.login + ":" + AS.OPTIONS.password));
    // Сервис для создания новой записи в реестре
    const createDocRCC = async function (data) {
        return new Promise(async function (resolve) {
            try {
                $.ajax({
                    "url": CURRENT_URL + "Synergy/rest/api/registry/create_doc_rcc",
                    "method": "POST",
                    "timeout": 0,
                    "headers": {
                        "Authorization": authorization,
                        "Content-Type": "application/json",
                    },
                    "data": JSON.stringify(data),
                }).done(function (response) {
                    console.log(response);
                    resolve(response);
                });
            } catch (e) {
                console.error(e);
                resolve({"errorCode": false});
            }
        });
    };
    // Сервис для создания новой записи в реестре
    const getDefaultContent = async function (form_epay) {
        return new Promise(async function (resolve) {
            try {
                $.ajax({
                    "url": CURRENT_URL + "Synergy/rest/api/asforms/getDefaultContent?formCode=" + form_epay,
                    "method": "GET",
                    "timeout": 0,
                    "headers": {
                        "Authorization": authorization
                    },
                }).done(function (response) {
                    console.log(response);
                    resolve(response);
                });
            } catch (e) {
                console.error(e);
                resolve({"errorCode": false});
            }
        });
    };

    const getDocumentIdentifier = async function (dataUUID) {
        return new Promise(async function (resolve) {
            try {
                $.ajax({
                    "url": CURRENT_URL + "Synergy/rest/api/formPlayer/documentIdentifier?dataUUID=" + dataUUID,
                    "method": "GET",
                    "timeout": 0,
                    "headers": {
                        "Authorization": authorization
                    },
                }).done(function (response) {
                    console.log(response);
                    resolve(response);
                });
            } catch (e) {
                console.error(e);
                resolve({"errorCode": false});
            }
        });
    };
    /* Сервис для получения статуса заявки по двум параметрам
        * 1. Номер заявки (invoiceId)
        * 2. Токен (token)
    * */

    (function (halyk) {

        let isTest = false;

        let testConfig = {
            pageUrL: "https://test-epay.homebank.kz/payform/",
            origin: "https://test-epay.homebank.kz",
            TokenAPIConfig: {
                url: "https://testoauth.homebank.kz/epay2/oauth2/token",
                clientId: "test"
            }
        };

        let prodConfig = {
            pageUrL: "https://epay.homebank.kz/payform/",
            origin: "https://epay.homebank.kz",
            TokenAPIConfig: {
                url: "https://epay-oauth.homebank.kz/oauth2/token",
                clientId: "uberflower"
            }
        };

        halyk.Config = function Config() {
            if (isTest)
                return testConfig;
            else
                return prodConfig;
        }

        let pageUrl = halyk.Config().pageUrL;

        let paymentPageOrigin = halyk.Config().origin;

        function pay(params) {
            location.href = pageUrl + "?params=" + LZString.compressToEncodedURIComponent(encodeParams(params));
        }

        let paymentWidgedCallBack = undefined;
        let widgetNode = undefined;
        let LZString = function () {
            function o(o, r) {
                if (!t[o]) {
                    t[o] = {};
                    for (var n = 0; n < o.length; n++) {
                        t[o][o.charAt(n)] = n;
                    }
                }
                return t[o][r];
            }

            let r = String.fromCharCode, n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
                e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$", t = {}, i = {
                    compressToBase64: function (o) {
                        if (null == o) {
                            return "";
                        }
                        var r = i._compress(o, 6, function (o) {
                            return n.charAt(o);
                        });
                        switch (r.length % 4) {
                            default:
                            case 0:
                                return r;
                            case 1:
                                return r + "===";
                            case 2:
                                return r + "==";
                            case 3:
                                return r + "=";
                        }
                    }, decompressFromBase64: function (r) {
                        return null == r ? "" : "" == r ? null : i._decompress(r.length, 32, function (e) {
                            return o(n, r.charAt(e));
                        });
                    }, compressToUTF16: function (o) {
                        return null == o ? "" : i._compress(o, 15, function (o) {
                            return r(o + 32);
                        }) + " ";
                    }, decompressFromUTF16: function (o) {
                        return null == o ? "" : "" == o ? null : i._decompress(o.length, 16384, function (r) {
                            return o.charCodeAt(r) - 32;
                        });
                    }, compressToUint8Array: function (o) {
                        for (var r = i.compress(o), n = new Uint8Array(2 * r.length), e = 0, t = r.length; t > e; e++) {
                            var s = r.charCodeAt(e);
                            n[2 * e] = s >>> 8, n[2 * e + 1] = s % 256;
                        }
                        return n;
                    }, decompressFromUint8Array: function (o) {
                        if (null === o || void 0 === o) {
                            return i.decompress(o);
                        }
                        for (var n = new Array(o.length / 2), e = 0, t = n.length; t > e; e++) {
                            n[e] = 256 * o[2 * e] + o[2 * e + 1];
                        }
                        var s = [];
                        return n.forEach(function (o) {
                            s.push(r(o));
                        }), i.decompress(s.join(""));
                    }, compressToEncodedURIComponent: function (o) {
                        return null == o ? "" : i._compress(o, 6, function (o) {
                            return e.charAt(o);
                        });
                    }, decompressFromEncodedURIComponent: function (r) {
                        return null == r ? "" : "" == r ? null : (r = r.replace(/ /g, "+"), i._decompress(r.length, 32, function (n) {
                            return o(e, r.charAt(n));
                        }));
                    }, compress: function (o) {
                        return i._compress(o, 16, function (o) {
                            return r(o);
                        });
                    }, _compress: function (o, r, n) {
                        if (null == o) {
                            return "";
                        }
                        var e, t, i, s = {}, p = {}, u = "", c = "", a = "", l = 2, f = 3, h = 2, d = [], m = 0, v = 0;
                        for (i = 0; i < o.length; i += 1) {
                            if (u = o.charAt(i), Object.prototype.hasOwnProperty.call(s, u) || (s[u] = f++ , p[u] = !0), c = a + u, Object.prototype.hasOwnProperty.call(s, c)) {
                                a = c;
                            } else {
                                if (Object.prototype.hasOwnProperty.call(p, a)) {
                                    if (a.charCodeAt(0) < 256) {
                                        for (e = 0; h > e; e++) {
                                            m <<= 1, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++;
                                        }
                                        for (t = a.charCodeAt(0), e = 0; 8 > e; e++) {
                                            m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++ , t >>= 1;
                                        }
                                    } else {
                                        for (t = 1, e = 0; h > e; e++) {
                                            m = m << 1 | t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++ , t = 0;
                                        }
                                        for (t = a.charCodeAt(0), e = 0; 16 > e; e++) {
                                            m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++ , t >>= 1;
                                        }
                                    }
                                    l-- , 0 == l && (l = Math.pow(2, h), h++), delete p[a];
                                } else {
                                    for (t = s[a], e = 0; h > e; e++) {
                                        m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++ , t >>= 1;
                                    }
                                }
                                l-- , 0 == l && (l = Math.pow(2, h), h++), s[c] = f++ , a = String(u);
                            }
                        }
                        if ("" !== a) {
                            if (Object.prototype.hasOwnProperty.call(p, a)) {
                                if (a.charCodeAt(0) < 256) {
                                    for (e = 0; h > e; e++) {
                                        m <<= 1, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++;
                                    }
                                    for (t = a.charCodeAt(0), e = 0; 8 > e; e++) {
                                        m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++ , t >>= 1;
                                    }
                                } else {
                                    for (t = 1, e = 0; h > e; e++) {
                                        m = m << 1 | t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++ , t = 0;
                                    }
                                    for (t = a.charCodeAt(0), e = 0; 16 > e; e++) {
                                        m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++ , t >>= 1;
                                    }
                                }
                                l-- , 0 == l && (l = Math.pow(2, h), h++), delete p[a];
                            } else {
                                for (t = s[a], e = 0; h > e; e++) {
                                    m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++ , t >>= 1;
                                }
                            }
                            l-- , 0 == l && (l = Math.pow(2, h), h++);
                        }
                        for (t = 2, e = 0; h > e; e++) {
                            m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++ , t >>= 1;
                        }
                        for (; ;) {
                            if (m <<= 1, v == r - 1) {
                                d.push(n(m));
                                break;
                            }
                            v++;
                        }
                        return d.join("");
                    }, decompress: function (o) {
                        return null == o ? "" : "" == o ? null : i._decompress(o.length, 32768, function (r) {
                            return o.charCodeAt(r);
                        });
                    }, _decompress: function (o, n, e) {
                        var t, i, s, p, u, c, a, l, f = [], h = 4, d = 4, m = 3, v = "", w = [],
                            A = {val: e(0), position: n, index: 1};
                        for (i = 0; 3 > i; i += 1) {
                            f[i] = i;
                        }
                        for (p = 0, c = Math.pow(2, 2), a = 1; a != c;) {
                            u = A.val & A.position, A.position >>= 1, 0 == A.position && (A.position = n, A.val = e(A.index++)), p |= (u > 0 ? 1 : 0) * a, a <<= 1;
                        }
                        switch (t = p) {
                            case 0:
                                for (p = 0, c = Math.pow(2, 8), a = 1; a != c;) {
                                    u = A.val & A.position, A.position >>= 1, 0 == A.position && (A.position = n, A.val = e(A.index++)), p |= (u > 0 ? 1 : 0) * a, a <<= 1;
                                }
                                l = r(p);
                                break;
                            case 1:
                                for (p = 0, c = Math.pow(2, 16), a = 1; a != c;) {
                                    u = A.val & A.position, A.position >>= 1, 0 == A.position && (A.position = n, A.val = e(A.index++)), p |= (u > 0 ? 1 : 0) * a, a <<= 1;
                                }
                                l = r(p);
                                break;
                            case 2:
                                return "";
                        }
                        for (f[3] = l, s = l, w.push(l); ;) {
                            if (A.index > o) {
                                return "";
                            }
                            for (p = 0, c = Math.pow(2, m), a = 1; a != c;) {
                                u = A.val & A.position, A.position >>= 1, 0 == A.position && (A.position = n, A.val = e(A.index++)), p |= (u > 0 ? 1 : 0) * a, a <<= 1;
                            }
                            switch (l = p) {
                                case 0:
                                    for (p = 0, c = Math.pow(2, 8), a = 1; a != c;) {
                                        u = A.val & A.position, A.position >>= 1, 0 == A.position && (A.position = n, A.val = e(A.index++)), p |= (u > 0 ? 1 : 0) * a, a <<= 1;
                                    }
                                    f[d++] = r(p), l = d - 1, h--;
                                    break;
                                case 1:
                                    for (p = 0, c = Math.pow(2, 16), a = 1; a != c;) {
                                        u = A.val & A.position, A.position >>= 1, 0 == A.position && (A.position = n, A.val = e(A.index++)), p |= (u > 0 ? 1 : 0) * a, a <<= 1;
                                    }
                                    f[d++] = r(p), l = d - 1, h--;
                                    break;
                                case 2:
                                    return w.join("");
                            }
                            if (0 == h && (h = Math.pow(2, m), m++), f[l]) {
                                v = f[l];
                            } else {
                                if (l !== d) {
                                    return null;
                                }
                                v = s + s.charAt(0);
                            }
                            w.push(v), f[d++] = s + v.charAt(0), h-- , s = v, 0 == h && (h = Math.pow(2, m), m++);
                        }
                    }
                };
            return i;
        }();
        "function" == typeof define && define.amd ? define(function () {
            return LZString;
        }) : "undefined" != typeof module && null != module && (module.exports = LZString);

        function encodeParams(params) {

            if (params === undefined || params === null) {
                return "";
            }

            if (typeof params !== "object") {
                return "" + params;
            }

            var result = [];

            for (var name in params) {
                if (name) {
                    result.push(name + "=" + encodeURIComponent(encodeParams(params[name])));
                }
            }

            return result.join("&");
        }


        function addCssClass() {
            var style = document.createElement("style");
            style.type = "text/css";
            var styleClasses = ".widgetScreen {position: fixed; top: 0; bottom: 0; left: 0; right: 0; z-index: 1000; background-color: rgba(5, 5, 5, 0.5); display: flex; justify-content: center; align-items: center;}";
            styleClasses += ".iframeBox{border-radius: 4px; position: relative; width: 400px; z-index: 1010; background-color: #fff; -ms-overflow-style: none; scrollbar-width: none;}";
            styleClasses += `.iframeHolder::-webkit-scrollbar {display: none;}`;
            styleClasses += ".iframeBoxHeader{padding: 0px;}";
            styleClasses += ".iframeBoxHeaderCloseButton{border-radius: 8px; cursor: pointer; width: 15px; height: 15px; content: 'X'; text-align: center; float: right; background-color: #ccc; font-family: Arial;}";
            styleClasses += ".iframeBoxHeaderCloseButtonText{font-size: 10px; font-family: sans-serif; font-weight: bold; color: #fff; padding-top: 2px;}";
            styleClasses += ".iframeBoxHeaderLabel{height:30px; text-align: center; float: left;}";
            styleClasses += ".iframeClass{ width: 100%; height: 90vh; border: none; }";
            //styleClasses += ".iframeHolder{ width: 100%; height: 100%; }";
            style.innerHTML = styleClasses;
            document.getElementsByTagName("head")[0].appendChild(style);
        };

        function onCloseDialog(result) {
            paymentWidgedCallBack({success: result});
            document.getElementsByTagName("body")[0].removeChild(widgetNode);
            widgetNode = undefined;
        }

        function onCommandRecieved(evnt) {
            if (evnt.origin.indexOf(paymentPageOrigin) === 0) {
                const resultObject = JSON.parse(evnt.data);
                onCloseDialog(resultObject.success === true);
            }
        }

        function showPaymentWidget(params, callBack) {
            paymentWidgedCallBack = callBack;
            if (!widgetNode) {
                addCssClass();
                widgetNode = document.createElement("DIV");
                widgetNode.className = "widgetScreen";
                var iframeBox = document.createElement("DIV");
                iframeBox.className = "iframeBox";
                var iframe = document.createElement("IFRAME");
                var iframeHolder = document.createElement("DIV");
                iframeHolder.className = "iframeHolder";
                iframeHolder.appendChild(iframe);
                //iframeBox.appendChild(iframeBoxHeader);
                iframeBox.appendChild(iframeHolder);
                iframe.src = halyk.Config().pageUrL + "?params=" + LZString.compressToEncodedURIComponent(encodeParams(params)) + '&isShortForm=true';
                iframe.className = "iframeClass";
                window.addEventListener("message", onCommandRecieved, false);
                widgetNode.appendChild(iframeBox);
                document.getElementsByTagName("body")[0].appendChild(widgetNode);
            }
        }

        function p2p(params) {
            location.href = pageUrl + "?params=" + LZString.compressToEncodedURIComponent(encodeParams(params)) + '&isTransfer=true';
        }

        function aft(params) {
            location.href = pageUrl + "?params=" + LZString.compressToEncodedURIComponent(encodeParams(params)) + '&isAFT=true';
        }

        halyk.p2p = p2p;
        halyk.aft = aft;


        halyk.pay = pay;
        halyk.showPaymentWidget = showPaymentWidget;

    })(halyk || (halyk = {}));

    const validateParams = function (price) {
        let radioCompVal = model.playerModel.getModelWithId(radioCompId);
        if (radioCompVal == null || radioCompVal.getValue() == null
            || radioCompVal.getValue()[0] !== radioCompTrueValue) {
            alert("Оплатить через систему HALYK payment можно только при условии 'online' оплаты");
            return true;
        }

        if (!price || price === 0) {
            alert("Введите корректную сумму");
            return true;
        }

        let tableToClear = model.playerModel.getModelWithId(tableId);
        if (tableToClear === null || tableToClear === undefined) {
            alert("Неверно указан идентификатор для 'таблицы оплаты'");
            return true;
        }

        let pTableList = model.playerModel.getModelWithId(paymentTableList);
        if (pTableList === null || pTableList === undefined) {
            alert("Неверно указан идентификатор для 'таблицы успешных/неуспешных платежей'");
            return true;
        }
        pTableList.setEnabled(false);

        let isBoss = confirm("Да я согласен провести оплату в размере " + price + " .");
        return !isBoss;
    }

    const ifPaymentSuccess = function (elem) {
        if (elem.success) {
            getPaymentStatus(paymentInfo.invoiceID, paymentInfo.token).then(function (res) {
                updatePaymentInfo(res, paymentInfo);
                updateTheListPaymentsTable(true, paymentInfo);
            });
        } else {
            updateTheListPaymentsTable(false, paymentInfo);
        }

        AS.FORMS.ApiUtils.saveAsfData(model.playerModel.getAsfData().data, model.playerModel.getAsfData().form, model.playerModel.getAsfData().uuid);
    }

    const updateTheListPaymentsTable = function (success, paymentInfo) {
        let pTableList = model.playerModel.getModelWithId(paymentTableList);

        pTableList.setEnabled(true);
        if (success) {
            let tableIdToClear = model.playerModel.getModelWithId(tableId);
            let blockLength = tableIdToClear.getBlockNumbers().length;
            for (let i = blockLength - 1; i >= 0; i--) {
                tableIdToClear.removeRowByBlockNumber(tableIdToClear.getBlockNumbers()[i]);
            }
        }
        let res = pTableList.createRow();
        updateTheRowData(res, paymentInfo, success);

        pTableList.setEnabled(false);
    }

    const payCLickAction = function () {
        let price = model.playerModel.getModelWithId(sumComponent).getValue();
        if (validateParams(price)) return;
        getDefaultContent("form_epay").then(function (asfData) {

            if (model.playerModel.getAsfData().uuid == null || model.playerModel.getAsfData().uuid === undefined) {
                AS.FORMS.ApiUtils.createDocumentWithCode(registryCode, model.playerModel.getAsfData().data, false, null, null).then(function (res) {
                    console.log(res);
                    model.playerModel.getAsfData().data = res.data;
                    model.playerModel.getAsfData().form = res.asfNodeID;
                    model.playerModel.getAsfData().uuid = res.dataID;
                    proceedWithIdentifier(res.documentID, price, asfData, res.data);
                });
            } else
                proceedWithNoIdentifier(price, asfData);

        });
    }

    const proceedWithNoIdentifier = function (price, asfData) {
        getDocumentIdentifier(model.playerModel.getAsfData().uuid).then(function (docId) {
            proceedWithIdentifier(docId, price, asfData, model.playerModel.getAsfData().data);
        });
    }

    const proceedWithIdentifier = function (docId, price, asfData, formData) {
        if (docId == null || docId === "")
            return;
        console.log(formData.filter(elem => elem.id === tableId)[0].data);
        console.log(asfData);
        console.log(asfData.data.filter(elem => elem.id === formEpayTableId));
        asfData.data.filter(elem => elem.id === formEpayTableId)[0].data = formData.filter(elem => elem.id === tableId)[0].data;
        asfData.data.filter(elem => elem.id === "reglink_main_application")[0].key = docId;
        asfData.data.filter(elem => elem.id === "reglink_main_application")[0].valueID = docId;
        asfData.data.filter(elem => elem.id === "reglink_main_application")[0].value = "";

        createDocRCC({
            "registryCode": "new_pay",
            "data": asfData.data
        }).then(function (asfData) {
            if (asfData && asfData["errorCode"] === 0) {
                let counter_pay = asfData["data"].filter(x => x.id === "counter_pay");
                let dataUUID = asfData["dataID"];
                paymentInfo = {};
                paymentInfo.documentId = asfData["documentID"];
                paymentInfo.amount = price;
                paymentInfo.invoiceID = counter_pay[0].value;

                getPaymentToken(counter_pay[0].value, price).then(function (auth) {
                    let createPaymentObject = function (auth) {
                        let paymentObject = {
                            invoiceId: counter_pay[0].value,
                            backLink: QAZPATENT_URL,
                            failureBackLink: QAZPATENT_URL,
                            //postLink: "https://cabinet.kazpatent.kz/epay/api/get-post-link?dataUUID=" + dataUUID,
                            //failurePostLink: "https://cabinet.kazpatent.kz/epay/api/get-post-link-fail?dataUUID=" + dataUUID,
                            language: "rus",
                            description: "Оплата в интернет магазине QAZPATENT",
                            terminal: "936cc0a6-10ad-48e2-b524-be41383cfc2e",
                            amount: price,
                            currency: "KZT",
                            phone: "",
                            // email: email,
                            cardSave: false //Параметр должен передаваться как Boolean
                        };
                        paymentObject.auth = JSON.parse(auth);
                        paymentInfo.token = paymentObject.auth["access_token"];

                        return paymentObject;
                    };

                    halyk.showPaymentWidget(createPaymentObject(auth), ifPaymentSuccess);
                });
            } else {
                alert("Ошибка попробуйте снова");
            }
        });
    }

    const renderButton = function () {
        view.container.find('.button_print_result').remove();

        const button = $('<button class=" uk-button margined uk-button-default qp_buttons  fonts" style="color: rgb(34, 34, 34); z-index: 0; box-sizing: border-box; direction: ltr; display: flex; align-items: center; justify-content: center;">Оплатить</button>', {class: 'button_pay_result'});

        button.on('click', payCLickAction);

        view.container.append(button);
    }

    renderButton();
}
// update statuses depending on a current status

const updateStatuses = function () {
    let resultsTable = model.playerModel.getModelWithId(paymentTableList);
    let tableListToUpdate = [];
    resultsTable.modelBlocks.forEach(element => {
        let tableRowData = {};
        element.forEach(row => {
            switch (row.asfProperty.id) {
                case STATUS_PARAM_ID:
                    tableRowData.statusName = row.getValue();
                    break;
                case TRANSACTION_SUM_ID:
                    tableRowData.amount = row.getValue();
                    break;
                case INVOICE_PARAM_ID:
                    tableRowData.invoiceID = row.getValue();
                    break;
            }
        });
        tableRowData.rowData = element;
        if (tableRowData.statusName != null && (tableRowData.statusName[0] === "1" || tableRowData.statusName[0] === "4"))
            tableListToUpdate.push(tableRowData);
    });

    console.log(tableListToUpdate);
    tableListToUpdate.forEach(element => {
        getPaymentToken(element.invoiceID, element.amount).then(function (auth) {
            let authInfo = JSON.parse(auth);
            let token = authInfo["access_token"];
            if (token != null) {
                getPaymentStatus(element.invoiceID, token).then(function (res) {
                    let paymentInfo = {};
                    updatePaymentInfo(res, paymentInfo);
                    console.log(paymentInfo);
                    updateTheRowData(element.rowData, paymentInfo, true);
                });
            }
        });
    });
}

updateStatuses();