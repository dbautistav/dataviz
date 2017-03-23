"use strict";

var utils = {
    copyJsObject: noop,
    fetchDataByUrlArrayPromise: noop,
    fetchJsonDataByUrl: noop,
    LOGGER: {
        debug: noop,
        error: noop,
        info: noop,
        warn: noop
    }
};

(function () {
    var CONSOLE_LOGGER = console;
    CONSOLE_LOGGER.debug = console.log;

    //  Invoke main function!
    activate();

    //  Defines main function.
    function activate() {
        ////  kind of switch for logging
        // utils.LOGGER = CONSOLE_LOGGER;  // uncomment to log

        utils.copyJsObject = copyJsObject;
        utils.fetchDataByUrlArrayPromise = fetchDataByUrlArrayPromise;
        utils.fetchJsonDataByUrl = fetchJsonDataByUrl;
    }

    function augmentJQueryPromiseMethods() {
        if ($.when.all === undefined) {
            $.when.all = function (promises) {
                var deferred = new $.Deferred();

                $.when.apply($, promises)
                    .then(
                        function resolve() {
                            deferred.resolve(Array.prototype.slice.call(arguments));
                        },
                        function reject() {
                            deferred.reject(Array.prototype.slice.call(arguments));
                        }
                    );

                return deferred;
            }
        }
    }

    function copyJsObject(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function fetchDataByUrlArrayPromise(urlArray) {
        //  This is necessary to being able to use '$.when.all' promise function.
        augmentJQueryPromiseMethods();

        var promises = $.map(urlArray, fetchJsonDataByUrl);
        return $.when.all(promises);
    }

    function fetchJsonDataByUrl(url) {
        return $.ajax({
            contentType: "application/json; charset=utf-8",
            data: {},
            dataType: "json",
            url: url
        });
    }
})();

//  no operation
function noop() {}
