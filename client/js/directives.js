/**
 * Created by skraxberger on 06.02.2015.
 */
regihoodApp.directive('coverImage', function () {
    return {
        restrict: "E",
        replace: true,
        template: "<div class='cover-image'></div>",
        link: function (scope, element, attrs) {
            element.css('height', "300px");
            element.css('background-size', 'cover');
            element.css('backgroundImage', "url('img/cover.jpg')");
        }
    }
});

regihoodApp.directive('areaToggle', [
    function () {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                element.bootstrapToggle({
                    on: 'Sozial',
                    off: 'Markt',
                    onstyle: "info",
                    offstyle: "success"
                });

                element.on('change.areaToggle', function (event) {
                    if (ngModel) {
                        console.log("Checkbox value: " + element[0].checked);
                        console.log("Model value: " + ngModel.$modelValue);
                        //ngModel.$modelValue = element[0].checked;
                        ngModel.$setViewValue(element[0].checked);
                    }
                });

                scope.$watch(attrs.ngModel, function (newValue, oldValue) {
                    console.log(ngModel.$modelValue);
                    if(newValue)
                        scope.$state.go('home');
                    else
                        scope.$state.go('market');
                });
            }
        };
    }
]);

