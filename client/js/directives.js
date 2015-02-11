
regihoodApp.directive('dragImage', ['$document', function($document) {
        return function(scope, element, attr) {
            var startY = 0, y = 0;

            element.css({
                position: 'relative',
                cursor: 'pointer'
            });

            element.on('mousedown', function(event) {
                // Prevent default dragging of selected content
                event.preventDefault();
                    startY = event.pageY - y;
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });

            function mousemove(event) {
                y = event.pageY - startY;

                element.css({
                    top: y + 'px'
                });
            }

            function mouseup() {
                $document.off('mousemove', mousemove);
                $document.off('mouseup', mouseup);
            }
        };
    }]);