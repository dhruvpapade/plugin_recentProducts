'use strict';

var server = require('server');
var productListHelper = require('*/cartridge/scripts/productLists/productListsHelpers');
server.extend(module.superModule);

server.prepend('Login', function (req, res, next) {
    var viewData = res.getViewData();
    var list = productListHelper.getList(req.currentCustomer.raw, { type: 100 });
    viewData.list = list;
    res.setViewData(viewData);
    next();
});

server.append('Login', function (req, res, next) {
    var viewData = res.getViewData();
    var listGuest = viewData.list;
    if (viewData.authenticatedCustomer) {
        var listLoggedIn = productListHelper.getCurrentOrNewList(viewData.authenticatedCustomer, { type: 100 });
        productListHelper.mergelists(listLoggedIn, listGuest, req, { type: 100 });
    }
    next();
});

module.exports = server.exports();