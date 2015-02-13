/**
 * Created by skraxberger on 13.02.2015.
 */
angularFileUpload.service('$upload', ['$http', '$q', '$timeout', function($http, $q, $timeout) {
    function sendHttp(config) {
        config.method = config.method || 'POST';
        config.headers = config.headers || {};
        config.transformRequest = config.transformRequest || function(data, headersGetter) {
            if (window.ArrayBuffer && data instanceof window.ArrayBuffer) {
                return data;
            }
            return $http.defaults.transformRequest[0](data, headersGetter);
        };
        var deferred = $q.defer();
        var promise = deferred.promise;

        config.headers['__setXHR_'] = function() {
            return function(xhr) {
                if (!xhr) return;
                config.__XHR = xhr;
                config.xhrFn && config.xhrFn(xhr);
                xhr.upload.addEventListener('progress', function(e) {
                    e.config = config;
                    deferred.notify ? deferred.notify(e) : promise.progress_fn && $timeout(function(){promise.progress_fn(e)});
                }, false);
                //fix for firefox not firing upload progress end, also IE8-9
                xhr.upload.addEventListener('load', function(e) {
                    if (e.lengthComputable) {
                        e.config = config;
                        deferred.notify ? deferred.notify(e) : promise.progress_fn && $timeout(function(){promise.progress_fn(e)});
                    }
                }, false);
            };
        };

        $http(config).then(function(r){deferred.resolve(r)}, function(e){deferred.reject(e)}, function(n){deferred.notify(n)});

        promise.success = function(fn) {
            promise.then(function(response) {
                fn(response.data, response.status, response.headers, config);
            });
            return promise;
        };

        promise.error = function(fn) {
            promise.then(null, function(response) {
                fn(response.data, response.status, response.headers, config);
            });
            return promise;
        };

        promise.progress = function(fn) {
            promise.progress_fn = fn;
            promise.then(null, null, function(update) {
                fn(update);
            });
            return promise;
        };
        promise.abort = function() {
            if (config.__XHR) {
                $timeout(function() {
                    config.__XHR.abort();
                });
            }
            return promise;
        };
        promise.xhr = function(fn) {
            config.xhrFn = (function(origXhrFn) {
                return function() {
                    origXhrFn && origXhrFn.apply(promise, arguments);
                    fn.apply(promise, arguments);
                }
            })(config.xhrFn);
            return promise;
        };

        return promise;
    }

    this.upload = function(config) {
        config.headers = config.headers || {};
        config.headers['Content-Type'] = undefined;
        var origTransformRequest = config.transformRequest;
        config.transformRequest = config.transformRequest ?
            (Object.prototype.toString.call(config.transformRequest) === '[object Array]' ?
                config.transformRequest : [config.transformRequest]) : [];
        config.transformRequest.push(function(data, headerGetter) {
            var formData = new FormData();
            var allFields = {};
            for (var key in config.fields) allFields[key] = config.fields[key];
            if (data) allFields['data'] = data;

            if (config.formDataAppender) {
                for (var key in allFields) {
                    config.formDataAppender(formData, key, allFields[key]);
                }
            } else {
                for (var key in allFields) {
                    var val = allFields[key];
                    if (val !== undefined) {
                        if (Object.prototype.toString.call(val) === '[object String]') {
                            formData.append(key, val);
                        } else {
                            if (config.sendObjectsAsJsonBlob && typeof val === 'object') {
                                formData.append(key, new Blob([val], { type: 'application/json' }));
                            } else {
                                formData.append(key, JSON.stringify(val));
                            }
                        }
                    }
                }
            }

            if (config.file != null) {
                var fileFormName = config.fileFormDataName || 'file';

                if (Object.prototype.toString.call(config.file) === '[object Array]') {
                    var isFileFormNameString = Object.prototype.toString.call(fileFormName) === '[object String]';
                    for (var i = 0; i < config.file.length; i++) {
                        formData.append(isFileFormNameString ? fileFormName : fileFormName[i], config.file[i],
                            (config.fileName && config.fileName[i]) || config.file[i].name);
                    }
                } else {
                    formData.append(fileFormName, config.file, config.fileName || config.file.name);
                }
            }
            return formData;
        });

        return sendHttp(config);
    };

    this.http = function(config) {
        return sendHttp(config);
    };
}]);