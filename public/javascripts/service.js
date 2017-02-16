window.service = {}; 
(function($) {
    //var requestBuilder = {};
    var ajax = function(options) {
        return new Promise(function(resolve, reject) {

            options.success = function(response) {
                resolve(response);
            };

            options.error = function(error) {
                reject(error);
            };

            $.ajax(options);
        });
    };

    var get = function(url, getData) {
        var options = {
            url: url,
            type: 'GET',
            data: getData
        };

        return ajax(options);
    };

    var getJSON = function(url, options) {
        options = $.extend({}, options);
        options.url = url;
        options.type = 'GET';
        options.dataType = 'json';

        return ajax(options);
    };

    var post = function(url, postData) {

        var options = {
            url: url,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(postData)
        };

        return ajax(options);
    };

    // Put in globals
    service.get = get;
    service.getJSON = getJSON;
    service.post = post;

})($);