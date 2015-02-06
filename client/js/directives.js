/**
 * Created by skraxberger on 06.02.2015.
 */
regihoodApp.directive('coverImage', function () {
        return {
            restrict: "E",
            replace: true,
            template: "<div class='center-cropped'></div>",
            link: function(scope, element, attrs) {
                var width = attrs.width;
                var height = attrs.height;
                element.css('width', width + "px");
                element.css('height', height + "px");
                element.css('backgroundPosition', 'center center');
                element.css('backgroundRepeat', 'no-repeat');
                element.css('backgroundImage', "url('" + attrs.src + "')");
            }
        }
    });