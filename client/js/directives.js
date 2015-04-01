angular.module('regihoodApp').directive('dragImage', ['$document', function ($document) {
    return {
        restrict: 'EA',

        link: function (scope, element, attr) {
            var startY = 0, y = 0;
            var maxY = 0;


            element.css({
                position: 'relative',
                cursor: 'pointer',
                overflow: 'hidden'
            });

            element.on('mousedown', function (event) {
                // Prevent default dragging of selected content

                event.preventDefault();
                startY = event.pageY - y;
                maxY = 276 - this.clientHeight;

                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });

            function mousemove(event) {
                y = event.pageY - startY;
                console.log('Current Y ' + y);

                console.log('Before ' + element.css("top"));
                if(y > maxY && y < 0) {
                    element.css({
                        top: y + 'px'
                    });
                    scope.coverImage.topPosition = y;
                }
                else {
                    y = scope.coverImage.topPosition;
                }

            }

            function mouseup() {
                $document.off('mousemove', mousemove);
                $document.off('mouseup', mouseup);
            }
        }
    };
}]);

/*
regihoodApp.directive('attachable', function($compile, $document) {
   return {
       restrict: 'A',
       replace: false,
       terminal: true, //this setting is important, see explanation below
       priority: 1000, //this setting is important, see explanation below
       compile: function (element, attrs) {
           element.attr("dropdown-toggle", "");
           element.attr("on-toggle","toggle(open)");
           element.removeAttr("attachable"); //remove the attribute to avoid indefinite loop

           var attacheeElement = angular.element( document.querySelector( '#attachee' ) );

           attacheeElement.attr("dropdown-toggle", "");
           $compile(attacheeElement.contents())(scope);
       }
   } ;
}); */