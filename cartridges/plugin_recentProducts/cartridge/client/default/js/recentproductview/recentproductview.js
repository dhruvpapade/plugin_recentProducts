'use strict';

module.exports = {
    
    recentproductremove: function () {
        $('body').on('click', '.remove-icon', function (e) {

            $.ajax({
                url: $(this).data('url'),
                data: { pid: $(this).data('pid') },
                method: 'GET',
                success: function (response) {
                    $('.container-xl').replaceWith(response);
                },
                error: function () {
                    
                }
            });
        });
    }

};
