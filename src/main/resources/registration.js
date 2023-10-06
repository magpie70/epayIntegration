const agreement_text = '';

let version = "0.0.4.3";
let connector = this;
let storageName = "PKCS12";
let NCA_LAYER_URL = 'wss://127.0.0.1:13579/';
let missed_heartbeats_limit_max = 50;
let missed_heartbeats_limit_min = 30;
let missed_heartbeats_limit = missed_heartbeats_limit_min;
let METHOD_GET_KEYS = 'getKeys';
let METHOD_GET_SUBJECT_DN = 'getSubjectDN';
let METHOD_GET_NOT_BEFORE = 'getNotBefore';
let METHOD_GET_NOT_AFTER = 'getNotAfter';
let METHOD_SIGN_CMS = 'createCMSSignature';
connector.callback = null;
let webSocket = null;
let CALLING_TIMEOUT = 100;
let METHOD_BROWSE_KEY_STORE = 'browseKeyStore';
let heartbeat_msg = '--heartbeat--';
connector.heartbeat_interval = null;
let missed_heartbeats = 0;
let keysConstTypeAuth = 'AUTH';
let keysConstTypeSign = 'SIGN';
const goToAuthPageTimer = 5000;
let showStoragePath = false;

let storagePath = "";
let password = "";
let key = "";
let info = {};

const SignInformationFunctions = {
    getKeyPath: function (result) {
        if (result.getResult() && result.getErrorCode() === "NONE") {
            $("#show_modal").click();
            $($(".textInput_storage_path").parent()).hide();
            setTimeout(function () {

                $($(".textInput_storage_path").parent()).hide();
                if (showStoragePath) {
                    $($(".textInput_storage_path").parent()).show();
                    $(".textInput_storage_path").val(result.getResult() + "")
                }

                showStoragePath = false;

                $(".ecp_password_send").off();
                $(".ecp_password_send").click(function () {
                    storagePath = result.getResult();
                    password = $($(".ecp_password")[1]).val();

                    $(".ecp_password").val("");
                    connector.loadKeys();
                });

                // Событие Для инпута при нажатии ENTER
                $($(".ecp_password")[1]).keyup(function (event) {
                    if (event.keyCode === 13) {
                        $("#ecp_password_send").click();
                        $(".ecp_password").val("");
                    }
                });
            }, 600);
        } else if (result.getErrorCode() !== "NONE")
            connector.openChooseCertDialog();
        else
            SignInformationFunctions.sendNotification(202, "Отмена действия");
    },
    loadKeysBack: function (result) {
        if (result.getResult() && result.getResult() !== -1) {
            key = result.getResult().split("|")[3];
            connector.getKeySubjectDN();
        } else if (result.getErrorCode() === "LOAD_KEYSTORE_ERROR") {
            SignInformationFunctions.sendNotification(205, "Ошибка получения эцп по сохраненому пути");
        } else if (result.getErrorCode() === "EMPTY_KEY_LIST") {
            SignInformationFunctions.sendNotification(205, "Неверный вид сертификата");
            setTimeout(function () {
                $(".uk-close").click();
            }, goToAuthPageTimer);
        } else
            SignInformationFunctions.sendNotification(204, "Неправильный пароль");
    },
    getKeySubjectDNBack: function (result) {
        if (result.getResult()) {
            info = result.getResult().split(",");
            connector.loadExpireBefore();
        } else
            SignInformationFunctions.sendNotification(202, "Ошибка получения базовой информации из эцп");
    },
    loadExpireBeforeBack: function (result) {
        if (result.getResult()) {
            info[info.length] = result.getResult();
            connector.loadExpireAfter();
        } else
            SignInformationFunctions.sendNotification(202, "Ошибка получения даты начала эцп");
    },
    loadExpireAfterBack: function (result) {
        if (result.getResult()) {
            info[info.length] = result.getResult();
            password = "";
            doTheBidding();
        } else
            SignInformationFunctions.sendNotification(202, "Ошибка получения даты окончания эцп");
    },
    sendNotification: function (int, text) {
        if (int == 201)
            showMessage(text, "info");
        else if (int == 200)
            showMessage(text, "success");
        else if (int != 209)
            showMessage(text, "error");
    },
    signXmlBack: function (result) {
        if (result['code'] === "500") {
            SignInformationFunctions.sendNotification(202, result['message']);
        } else if (result['code'] === "200") {
            let res = result['responseObject'];
            //connector.signXmlBack(res, new Date());
        }
    },
    signCmsBack: function (result) {
        if (result.getResult())
            console.log("todo");
        //connector.signCmsBack(result.getResult());
        else
            SignInformationFunctions.sendNotification(202, "Ошибка при подписи данных, причина: " + result.getErrorCode());

    }
};

function setMissedHeartbeatsLimitToMax() {
    missed_heartbeats_limit = missed_heartbeats_limit_max;
}

function setMissedHeartbeatsLimitToMin() {
    missed_heartbeats_limit = missed_heartbeats_limit_min;
}

function customSend(method, args, callback) {
    let methodVariable = {
        'method': method,
        'args': args
    };
    if (callback) {
        connector.callback = callback;
    }
    setMissedHeartbeatsLimitToMax();
    try {
        getNCALayerSocket().send(JSON.stringify(methodVariable));
    } catch (err) {
        SignInformationFunctions.sendNotification(209, "Ошибка открытия соединения " + method);
    }
}

connector.initNCALayerSocket = function () {
    console.log(version);
    webSocket = new WebSocket(NCA_LAYER_URL);
    webSocket.onopen = webSocketOnOpen.bind(this);
    webSocket.onclose = webSocketOnClose.bind(this);
    webSocket.onmessage = webSocketOnMessage.bind(this);
}

function getNCALayerSocket() {
    if (webSocket === null || webSocket === undefined || webSocket.readyState === 3 || webSocket.readyState === 2) {
        connector.initNCALayerSocket();
    }
    return webSocket;
}

const openDialog = function () {
    if (confirm("Ошибка при подключении к NCALayer. Запустите NCALayer и нажмите ОК") === true) {
        location.reload();
    }
};

function pingLayer() {
    try {
        missed_heartbeats++;
        if (missed_heartbeats > missed_heartbeats_limit)
            throw new Error("exceeded timeLimit");
        getNCALayerSocket().send(heartbeat_msg);
    } catch (e) {
        clearInterval(connector.heartbeat_interval);
        connector.heartbeat_interval = null;
        SignInformationFunctions.sendNotification(301, "Превышено время ожидания. Попробуйте снова");
        getNCALayerSocket().close();
    }
}

function webSocketOnOpen(event) {
    // if (connector.heartbeat_interval === null) {
    //     missed_heartbeats = 0;
    //     console.error("open", missed_heartbeats);
    //     clearInterval(connector.heartbeat_interval);
    //     connector.heartbeat_interval = setInterval(pingLayer.bind(this), 2000);
    // }
    SignInformationFunctions.sendNotification(200, "Соединение открыто");
}

function webSocketOnClose(event) {
    if (event.wasClean) {
        SignInformationFunctions.sendNotification(200, "Соединение закрыто успешно");
    } else {
        /*Соеденение закрыто насильно*/
        SignInformationFunctions.sendNotification(302, "Ошибка. Соединение закрыто.");
    }
}

function webSocketOnMessage(event) {
    if (event.data === heartbeat_msg) {
        missed_heartbeats = 0;
        console.error("onMessage", missed_heartbeats);
        return;
    }

    let result = JSON.parse(event.data);

    if (result != null) {
        let rw = {
            code: result['code'],
            message: result['message'],
            responseObject: result['responseObject'],
            result: result['result'],
            secondResult: result['secondResult'],
            errorCode: result['errorCode'],
            getResult: function () {
                return this.result;
            },
            getMessage: function () {
                return this.message;
            },
            getResponseObject: function () {
                return this.responseObject;
            },
            getCode: function () {
                return this.code;
            },
            getSecondResult: function () {
                return this.secondResult;
            },
            getErrorCode: function () {
                return this.errorCode;
            }
        };
        if (connector.callback != null) {
            SignInformationFunctions[connector.callback](rw);
            connector.callback = null;
        }
    }
    setMissedHeartbeatsLimitToMin();
}

const getKeyInfo = function (storageName, callBack) {
    let getKeyInfo = {
        "module": "kz.gov.pki.knca.commonUtils",
        "method": "getKeyInfo",
        "args": [storageName]
    };
    connector.callback = callBack;
    getNCALayerSocket().send(JSON.stringify(getKeyInfo));
};

const createCAdESFromBase64 = function (storageName, keyType, base64ToSign, flag, callBack) {
    let createCAdESFromBase64 = {
        "module": "kz.gov.pki.knca.commonUtils",
        "method": "createCAdESFromBase64",
        "args": [storageName, keyType, base64ToSign, flag]
    };
    connector.callback = callBack;
    getNCALayerSocket().send(JSON.stringify(createCAdESFromBase64));
};

const signXml = function (storageName, keyType, xmlToSign, callBack) {
    let signXml = {
        "module": "kz.gov.pki.knca.commonUtils",
        "method": "signXml",
        "args": [storageName, keyType, xmlToSign, "", ""]
    };
    connector.callback = callBack;
    getNCALayerSocket().send(JSON.stringify(signXml));
};

const signXmls = function (storageName, keyType, xmlsToSign, callBack) {
    let signXmls = {
        "module": "kz.gov.pki.knca.commonUtils",
        "method": "signXmls",
        "args": [storageName, keyType, xmlsToSign, "", ""]
    };
    connector.callback = callBack;
    getNCALayerSocket().send(JSON.stringify(signXmls));
};

const getKeyInfoCall = function () {
    getKeyInfo(storageName, "getKeyInfoBack");
};

const getKeyInfoBack = function (result) {
    if (result['code'] === "500") {
        SignInformationFunctions.sendNotification(202, "Отмена действия");
    } else if (result['code'] === "200") {
        console.log(result);
    }
};

connector.getKeyInfoCallButton = function () {
    getKeyInfoCall();
};

connector.signXmlCall = function () {
    let signInformation = this.getState().data;
    let xml = signInformation.signXml ? signInformation.signXml : "";
    signXml(storageName, "SIGNATURE", xml, "signXmlBack");
}

connector.signCmsCall = function () {
    let signInformation = this.getState().data;
    let checkSum = signInformation.checkSum ? signInformation.checkSum : "";
    if (checkSum !== null && checkSum !== "") {
        createCAdESFromBase64(storageName, "SIGNATURE", checkSum, true, "signCmsBack");
    } else {
        SignInformationFunctions.sendNotification(203, "Нет данных для подписи!");
    }
}

connector.signCMS = function () {
    let args = [storageName, this.getState().data.storagePath, this.getState().data.key, this.getState().data.password, this.getState().data.checkSum, true];
    setTimeout(customSend, CALLING_TIMEOUT, METHOD_SIGN_CMS, args, "signCmsBack");
}

connector.openChooseCertDialog = function () {
    let args = [storageName, 'P12', "~"];
    setTimeout(customSend, CALLING_TIMEOUT, METHOD_BROWSE_KEY_STORE, args, "getKeyPath");
}

connector.loadKeys = function () {
    let args = [storageName, storagePath, password, keysConstTypeAuth];
    setTimeout(customSend, CALLING_TIMEOUT, METHOD_GET_KEYS, args, "loadKeysBack");
}
connector.getKeySubjectDN = function () {
    let args = [storageName, storagePath, key, password];
    setTimeout(customSend, CALLING_TIMEOUT, METHOD_GET_SUBJECT_DN, args, "getKeySubjectDNBack");
}
connector.loadExpireBefore = function () {
    let args = [storageName, storagePath, key, password];
    setTimeout(customSend, CALLING_TIMEOUT, METHOD_GET_NOT_BEFORE, args, "loadExpireBeforeBack");
}
connector.loadExpireAfter = function () {
    let args = [storageName, storagePath, key, password];
    setTimeout(customSend, CALLING_TIMEOUT, METHOD_GET_NOT_AFTER, args, "loadExpireAfterBack");
}
connector.webSocketOnClose = function () {
    try {
        getNCALayerSocket().close();
    } catch (error) {
        alert("Ошибка: обратитесь к разработчику системы - " + error)
    }
}

const createDocRCC = (registryCode, asfData, sendToActivation = false) => {
    return new Promise(async resolve => {
        try {
            const {login, password} = Cons.creds;
            const settings = {
                url: `${window.location.origin}/Synergy/rest/api/registry/create_doc_rcc`,
                method: "POST",
                headers: {
                    "Authorization": "Basic " + btoa(unescape(encodeURIComponent(`${login}:${password}`))),
                    "Content-Type": "application/json; charset=utf-8"
                },
                data: JSON.stringify({
                    registryCode: registryCode,
                    data: asfData,
                    sendToActivation: sendToActivation
                }),
            };
            $.ajax(settings).done(response => {
                if (response.errorCode == 0) {
                    resolve(response);
                } else {
                    resolve(null);
                }
            }).fail(err => {
                console.error(err);
                resolve(null);
            });
        } catch (e) {
            console.log(e);
            resolve(null);
        }
    });
}

const getDateResponse = async function (date) {
    return new Promise(async function (resolve, reject) {
        try {
            $.ajax({
                "url": window.origin + "/ncalayer/api/date/check",
                "method": "POST",
                "timeout": 0,
                "headers": {
                    "Content-Type": "application/json"
                },
                "data": JSON.stringify(date),
                "success": function (data) {
                    resolve(data)
                },
                "error": function (error) {
                    reject(error)
                },
            });
        } catch (e) {
            console.error(e);
            resolve(false);
        }
    });
};

function updateInfo() {
    for (let i = 0; i < info.length; i++) {
        if (info[i].includes("=")) {
            let abc = info[i].split("=");
            info[abc[0]] = abc[1];
        }
    }
    $(".uk-close").click();
}

function doTheBidding() {
    updateInfo();
    let pattern = /(\d{2})\.(\d{2})\.(\d{4})/;
    getDateResponse({
        "certNotBefore": new Date(info[info.length - 1].replace(pattern, '$3-$2-$1').replace(/-/g, "/")).getTime(),
        "certNotAfter": new Date(info[info.length - 2].replace(pattern, '$3-$2-$1').replace(/-/g, "/")).getTime()
    }).then(function (checker) {
        console.log(checker)
        if (!checker) {
            showMessage('Сертификат недействителен (не пройдена проверка срока действия сертификата). Выберите действительный сертификат ЭЦП', 'error');
            setTimeout(function () {
                $(".uk-close").click();
            }, goToAuthPageTimer);
            return;
        }

        if (info["OU"] === "BIN020940003199") {
            let url = `?registryCode=reg_canc_niis&loadData=true&field=IIN_canc&condition=CONTAINS&value=${info["SERIALNUMBER"].substring(3)}`;
            getDataExtByIin(url).then(function (res) {
                if (res && res.recordsCount > 0) {
                    window.open(`${window.location.origin}/Synergy`, "_self");
                } else {
                    showMessage('Переход на страницу авторизации сотрудника', 'success');

                    Cons.setAppStore({
                        storagePath: {
                            path: storagePath,
                            bin: info["OU"],
                            page: "employee_authentication",
                            info: info
                        }
                    });
                    goToPage("employee_authentication", []);
                }
            });
        } else if (info["OU"] != null && info["SERIALNUMBER"]) {
            searchForContrAgents(info["OU"].substring(3), false)
        } else if (info["SERIALNUMBER"]) {
            searchForContrAgents(info["SERIALNUMBER"].substring(3), true)
        }
    })
        .catch((error) => {
            showMessage('Ошибка проверки срока годности сертификата (убедитесь что "ncalayer.jar" корректно работает', 'error');
            return;
        })
}

function searchForContrAgents(serialNumber, isFL) {
    let url = `?registryCode=Counterparties_register&loadData=true&field=IIN_BIN_textbox&condition=CONTAINS&value=${serialNumber}&fields=phone_code&fields=entity_app_pay`;
    getDataExtByIin(url).then(function (res) {
        let phone = null;
        let userId = null;
        let dataUUID = null;
        if (res && res.recordsCount > 0) {
            if (res.result && res.result[0] && res.result[0].fieldValue.phone_code)
                phone = res.result[0].fieldValue.phone_code;
            if (res.result && res.result[0] && res.result[0].fieldKey.entity_app_pay)
                userId = res.result[0].fieldKey.entity_app_pay;
            else {
                showMessage("В записи контрагента, нет привязанного пользователя синерджи", "error");
                return;
            }
            dataUUID = res.result[0].dataUUID;

            saveGlobalAppStore(isFL ? info["SERIALNUMBER"].substring(3) : serialNumber + "_" + info["SERIALNUMBER"].substring(3),
                phone, isFL, dataUUID, userId, (isFL ? "FLIIN" : "ULIIN") + serialNumber);

        } else {
            updateUserCredentials({
                "login": isFL ? info["SERIALNUMBER"].substring(3) : serialNumber + "_" + info["SERIALNUMBER"].substring(3),
                "password": isFL ? info["SERIALNUMBER"].substring(3) : serialNumber + "_" + info["SERIALNUMBER"].substring(3) + "ztb",
                "pointersCode": (isFL ? "FLIIN" : "ULIIN") + serialNumber,
                "lastname": info["SURNAME"],
                "firstname": info.CN.split(" ")[1],
                "patronymic": info["G"]
            }).then(function (userInfo) {
                if (userInfo.errorCode == 0) {

                    addUserToGroup(isFL ? "zayaviteli_fl" : "zayaviteli_ul", userInfo.userID).then(function () {
                        //showMessage("Пользователь добавлен в группу заявители", "info");
                    });
                    let asfData = [];
                    let fio = [formatName(info.SURNAME), formatName(info.CN.split(" ")[1]), formatName((info["G"] ? info["G"] : ""))].join(' ').trim();

                    asfData.push({id: "FIO_personal_textbox", type: "textbox", value: fio});
                    asfData.push({
                        id: "name_counterparties_ru_textbox",
                        type: "textarea",
                        value: isFL ? fio : info["O"]
                    });
                    asfData.push({
                        id: "name_counterparties_kz_textbox",
                        type: "textarea",
                        value: isFL ? fio : info["O"]
                    });
                    asfData.push({id: "email_textbox", type: "textbox", value: info["E"], key: info["E"]});
                    asfData.push({id: "entity_app_pay", type: "entity", key: userInfo.userID, value: info.CN});
                    asfData.push(getDateBirth(info["SERIALNUMBER"].substring(3)));
                    asfData.push({
                        id: "IIN_personal_textbox",
                        type: "textbox",
                        value: info["SERIALNUMBER"].substring(3),
                        key: info["SERIALNUMBER"].substring(3)
                    });
                    asfData.push({
                        id: "IIN_BIN_textbox",
                        type: "textbox",
                        value: serialNumber,
                        key: serialNumber
                    });
                    asfData.push({
                        "id": "type_counterparties_textbox",
                        "type": "listbox",
                        "value": isFL ? "Физическое лицо" : "Юридическое лицо",
                        "key": isFL ? "FL" : "UL"
                    });

                    if (!isFL) {
                        asfData.push({
                            id: "contact_textbox",
                            type: "textbox",
                            value: info["CEO"],
                            key: info["CEO"]
                        });
                        asfData.push({
                            id: "iin_contact_textbox",
                            type: "textbox",
                            value: info["SERIALNUMBER"].substring(3),
                            key: info["SERIALNUMBER"].substring(3)
                        });

                        let asfDataPerson = [];

                        personalrecordForms(userInfo.userID).then(function (res) {
                            let asfDataPerson = getPersonalDataUUID(res, fio, info["SERIALNUMBER"].substring(3));

                            if (res)
                                mergeInfoToPersonalData(asfDataPerson).then(function (res) {

                                });
                        });

                    }

                    createDocRCC('Counterparties_register', asfData, true).then(res => {
                        dataUUID = res.dataID;
                        saveGlobalAppStore(isFL ? info["SERIALNUMBER"].substring(3) : serialNumber + "_" + info["SERIALNUMBER"].substring(3),
                            phone, isFL, dataUUID, userInfo.userID, (isFL ? "FLIIN" : "ULIIN") + serialNumber);
                    });
                } else {
                    showMessage("Ошибка создания пользователя, обратитесь в поддержку (" + userInfo.errorMessage + ")", "error");
                }
            });
        }
    });
}

const addUserToGroup = async function (groupCode, userId) {
    return new Promise(async function (resolve) {
        try {
            const {login, password} = Cons.creds;
            $.ajax({
                "url": window.origin + "/Synergy/rest/api/storage/groups/add_user?groupCode=" + groupCode + "&userID=" + userId,
                "method": "GET",
                "timeout": 0,
                "headers": {
                    "Authorization": "Basic " + btoa(unescape(encodeURIComponent(`${login}:${password}`))),
                }
            }).done(function (response) {
                console.log(response);
                resolve(response);
            });
        } catch (e) {
            console.error(e);
            resolve({"success": false, "obj": {}});
        }
    });
};

function formatName(res) {
    if (res)
        return res.charAt(0).toUpperCase() + res.toLowerCase().substr(1);
    return "";
}

const saveGlobalAppStore = function (serialNumber, phone, isFL, dataUUID, userId, pointersCode) {
    Cons.setAppStore({
        authUserInfo: {
            path: storagePath,
            iinBin: serialNumber,
            page: "sms",
            info: info,
            phone: phone,
            isFl: isFL,
            dataUUID: dataUUID,
            userId: userId,
            pointersCode: pointersCode
        }
    });
    goToPage("sms", []);

}

function goToPage(pageCode, pageParams, message) {
    let event = {
        type: 'goto_page',
        pageCode: pageCode,
        pageParams: pageParams
    }
    setTimeout(function () {
        fire(event, 'panel_auth_label_bg');
    }, 2000);

}

const updateUserCredentials = (data) => {
    return new Promise(async resolve => {
        try {
            const {login, password} = Cons.creds;
            const settings = {
                url: `${window.location.origin}/Synergy/rest/api/filecabinet/user/save`,
                "method": "POST",
                "timeout": 0,
                "headers": {
                    "Authorization": "Basic " + btoa(unescape(encodeURIComponent(`${login}:${password}`))),
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                "data": data
            };
            $.ajax(settings).done(response => {
                if (response.errorCode == 0) {
                    resolve(response);
                } else {
                    resolve(response);
                }
            }).fail(err => {
                console.error(err);
                resolve(null);
            });
        } catch (e) {
            console.log(e);
            resolve(null);
        }
    });
}

$("#button_select_sert").off();
$("#button_select_sert").click(function () {
    if (storagePath == null)
        storagePath = "";
    password = "";
    key = "";
    info = {};

    // open the connection
    connector.initNCALayerSocket();

    // get the user key path
    if (webSocket != null)
        connector.openChooseCertDialog();

});

$("#button_select_sert_system").off();
$("#button_select_sert_system").click(function () {
    // TODO load storage path
    storagePath = "";
    showStoragePath = true;
    $("#button_select_sert").click();

});

const getDateBirth = function (iin) {
    // 950815300523
    let resp = {"id": "date_birth", "type": "date"};
    let button_authyear = "2000";
    let month = iin.substring(2, 4);
    let day = iin.substring(4, 6);
    //value: "08.09.2021", key: "2021-09-08 00:00:00"
    if (parseInt(iin.substring(0, 2)) > 50) {
        year = 19 + iin.substring(0, 2);
    } else {
        year = 20 + iin.substring(0, 2);
    }
    resp.value = day + "." + month + "." + year;
    resp.key = year + "-" + month + "-" + day + " 00:00:00";

    return resp;
}

const getDataExtByIin = async function (url) {
    return new Promise(async function (resolve) {
        try {
            const {login, password} = Cons.creds;
            $.ajax({
                "url": `${window.origin}/Synergy/rest/api/registry/data_ext${url}`,
                "method": "GET",
                "timeout": 0,
                "headers": {
                    "Authorization": "Basic " + btoa(unescape(encodeURIComponent(`${login}:${password}`)))
                },
            }).done(function (response) {
                resolve(response);
            });
        } catch (e) {
            console.error(e);
            let arr = [];
            arr.status = 406;
            resolve(arr);
        }
    });
};

function getPersonalDataUUID(userCardArray, fio, serialNumber) {
    if (userCardArray.length > 0) {
        let personalData = userCardArray.filter(x => x.formCode == 'personal_data_form');

        if (personalData.length > 0) {

            let userData = {"uuid": personalData[0]['data-uuid']};
            let asfData = [];

            asfData.push({
                id: "textbox_fio_ru_personal",
                type: "textbox",
                value: fio,
                key: fio
            });

            asfData.push({
                id: "textbox_fio_kz_personal",
                type: "textbox",
                value: fio,
                key: fio
            });

            asfData.push({
                id: "textbox_fio_en_personal",
                type: "textbox",
                value: fio,
                key: fio
            });

            asfData.push({
                id: "textbox_iin_bin_personal",
                type: "textbox",
                value: serialNumber,
                key: serialNumber
            });
            userData.data = asfData;

            return userData;
        }
        return null;
    }
    return null;
}

const personalrecordForms = async function (userID) {
    return new Promise(async function (resolve) {
        try {
            const {login, password} = Cons.creds;
            $.ajax({
                "url": `${window.origin}/Synergy/rest/api/personalrecord/forms/${userID}`,
                "method": "GET",
                "timeout": 0,
                "headers": {
                    "Authorization": "Basic " + btoa(unescape(encodeURIComponent(`${login}:${password}`)))
                },
            }).done(function (response) {
                resolve(response);
            });
        } catch (e) {
            console.error(e);
            let arr = [];
            arr.status = 406;
            resolve(arr);
        }
    });
};


const mergeInfoToPersonalData = async function (data) {
    return new Promise(async function (resolve) {
        try {
            const {login, password} = Cons.creds;
            $.ajax({
                "url": window.origin + "/Synergy/rest/api/asforms/data/merge",
                "method": "POST",
                "timeout": 0,
                "headers": {
                    "Authorization": "Basic " + btoa(unescape(encodeURIComponent(`${login}:${password}`))),
                    "Content-Type": "application/json"
                },
                "data": JSON.stringify(data)
            }).done(function (response) {
                resolve(response);
            });
        } catch (e) {
            console.error(e);
            resolve(false);
        }
    });
};