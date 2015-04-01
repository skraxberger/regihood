
angular.module('regihoodApp').factory('StringManipulation', function() {
    return {
        endsWith: function(str, suffix){
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        },

        getFilenameFromPath: function(path) {
            if (path.name.indexOf("/") >= 0) {
                var startIndex = path.name.lastIndexOf("/");
                return path.name.substring(startIndex);
            }
            else if (path.name.indexOf("\\") >= 0) {
                var startIndex = path.name.lastIndexOf("\\");
                return path.name.substring(startIndex);
            }
            else {
                return path.name;
            }

        }
    };
});