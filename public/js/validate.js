$(document).ready(function () {
    $('#registration-form').validate({
        rules: {

            firstname: {
                required: true,
                required: true
            },

            lastname: {
                required: true,
                required: true
            },

            password: {
                required: true,
                minlength: 6
            },
            email: {
                required: true,
                email: true
            }
        },
        highlight: function (element) {
            $(element).closest('.control-group').removeClass('success').addClass('error');
        },
        success: function (element) {
            element
                .text('OK!').addClass('valid')
                .closest('.control-group').removeClass('error').addClass('success');
        }
    });

}); // end document.ready