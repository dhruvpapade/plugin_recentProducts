'use strict';

var server = require('server');
server.extend(module.superModule);
var productListHelper = require('*/cartridge/scripts/productLists/productListsHelpers');

server.append('Show',function (req, res, next) {
    var pid = req.querystring.pid;
    var config = {
        qty: 1,
        type: 100
    };

    var productListObject = productListHelper.getCurrentOrNewList(req.currentCustomer.raw, { type: 100 });
    productListHelper.addItem(productListObject, pid, config, req.currentCustomer.raw);
    
    next();
    
});

module.exports = server.exports();