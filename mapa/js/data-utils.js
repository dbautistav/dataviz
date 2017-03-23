"use strict";

var dataUtils = {
    fetchDataFromSpecPromise: function () {}
};

(function () {
    var configUrl = "./data/config.json";

    //  Invoke main function!
    activate();

    //  Defines main function.
    function activate() {
        dataUtils.fetchDataFromSpecPromise = fetchDataAndInitializeVariablesPromise;
    }

    //  "Exported" function definition
    function fetchDataAndInitializeVariablesPromise() {
        var dataUrls = [configUrl];
        return utils.fetchDataByUrlArrayPromise(dataUrls);
    }
})();
