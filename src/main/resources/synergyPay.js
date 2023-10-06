if (editable) {

    const globUrl = "https://testpay.kkb.kz/jsp/process/logon.jsp";
    const currentUrl = "http://127.0.0.1:8080/";

    $(view.container).html('<button data-cy="button_epay_pay" title="" id="button_epay_pay" class=" uk-button margined uk-button-default uk-button-large  fonts" style="color: rgb(34, 34, 34); z-index: 0; box-sizing: border-box; direction: ltr; display: flex; align-items: center; justify-content: center;">Провести оплату</button>');

    $("#button_epay_pay").click(function () {
        payCLickAction();
    });

    const payCLickAction = function () {
        let res = {};
        // getSignedInfo("700", "900560", "zhientayev.khazretsultan@gmail.com", "900560").then(function (res) {
            console.log(res);
            let data = {
                "Signed_Order_B64": "PGRvY3VtZW50PjxtZXJjaGFudCBjZXJ0X2lkPSIwMEMxODJCMTg5IiBuYW1lPSJ0ZXN0IHNob3AiPjxvcmRlciBvcmRlcl9pZD0iMTI0IiBhbW91bnQ9IjcwMCIgY3VycmVuY3k9IjM5OCI+PGRlcGFydG1lbnQgbWVyY2hhbnRfaWQ9IjkyMDYxMTAxIiBhbW91bnQ9IjcwMCIvPjwvb3JkZXI+PC9tZXJjaGFudD48bWVyY2hhbnRfc2lnbiB0eXBlPSJSU0EiPm9iUmNrWnZ1VnJKYmNHMkc2dkYrS0NWWVd3YTIwZ2lFV0tVaDh6K0oyUnNhekJ5MzNUMm4vL0FJUDJFUkJUT0ludGJ5a09FY3ZqSlkwbkVFb05NSEZ3PT08L21lcmNoYW50X3NpZ24+PC9kb2N1bWVudD4=",
                "email": res["email"] ? res["email"] : "",
                "Language": res["rus"] ? res["rus"] : "",
                "BackLink": "http://127.0.0.1:8080/api/get-back-link?iin=9508",
                "PostLink": "http://127.0.0.1:8080/api/get-post-link?iin=9508",
                "FailureBackLink": "http://127.0.0.1:8080/api/get-failure-back-link?iin=9508"
            };
            gotoPayPage(data["Signed_Order_B64"], data["email"], data["BackLink"], data["PostLink"], data["FailureBackLink"]);
        // });
    }

    // const gotoPayPage = async function (data) {
    //     return new Promise(async function (resolve) {
    //         try {
    //             $.ajax({
    //                 "url": globUrl,
    //                 "method": "POST",
    //                 "timeout": 0,
    //                 "headers": {
    //                     "Content-Type": "application/x-www-form-urlencoded"
    //                 },
    //                 "data": data
    //             }).done(function (response) {
    //                 console.log(response);
    //                 resolve(response);
    //             });
    //         } catch (e) {
    //             console.error(e);
    //             resolve({"success": false, "obj": {}});
    //         }
    //     });
    // };

    const getSignedInfo = async function (amount, dataUUID, mail, orderId) {
        return new Promise(async function (resolve) {
            try {
                $.ajax({
                    "url": currentUrl + "/api/get-output",
                    "method": "POST",
                    "timeout": 0,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "data": JSON.stringify({
                        "amount": amount,
                        "iin": dataUUID,
                        "mail": mail,
                        "orderId": orderId,
                        "language": "rus",
                        "url": currentUrl
                    }),
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

    const gotoPayPage = function (Base64Content, email, backLink, postLink, failLink) {
        let form = document.createElement("form");
        document.body.appendChild(form);
        form.method = "POST";
        form.action = globUrl;
        form.appendChild(createInputForm("Signed_Order_B64", Base64Content));
        form.appendChild(createInputForm("email", email, "text"));
        form.appendChild(createInputForm("Language", "rus"));
        form.appendChild(createInputForm("BackLink", backLink));
        form.appendChild(createInputForm("PostLink", postLink));
        form.appendChild(createInputForm("FailureBackLink", failLink));
        form.submit();
    }

    const createInputForm = function (name, value, type){
        let inputElem = document.createElement("INPUT");
        inputElem.name = name;
        inputElem.value = value;
        inputElem.type = type ? type : 'hidden';
        return inputElem;
    }
} else {
    view.setVisible(false);
}