"use strict";
let Ajax = (function() {
    const _data = {
        getXHR: function () {
            let requestObj;

            try { //Браузер не относится к семейству IE?
                requestObj = new XMLHttpRequest();
            }
            catch (e1) {
                try { //Это IE 6+?
                    requestObj = new ActiveXObject("Msxml2.XMLHTTP");
                }
                catch (e2) {
                    try { // Это IE 5?
                        requestObj = new ActiveXObject("Microsoft.XMLHTTP");
                    }
                    catch (e3) { // Данный браузер не поддерживает AJAX
                        requestObj = false;
                    }
                }
            }

            return requestObj;
        },
        default: {
            method: "POST",
            url: "php/server.php",
            params: "default=params"
        }
    };

    return {
        createRequest: function (method, url, params) {
            return new Promise(function (resolve, reject) {
                let request = _data.getXHR();

                method = (method === "POST" || method === "GET") ? method : _data.default.method;
                url =  url || _data.default.url;
                params = params || _data.default.params;

                if (request) {
                    request.open(method, url, true);
                    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    request.onload = function() {
                        if (this.status === 200) {
                            resolve(this.response);
                        } else {
                            reject(this.statusText);
                        }
                    };
                    request.send(params);
                }
            });
        }
    };
})();