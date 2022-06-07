'use strict';

var server = require('server');
var productListHelper = require('*/cartridge/scripts/productLists/productListsHelpers');
var URLUtils = require('dw/web/URLUtils');
var QueryString = require('server').querystring;

server.get('GetList', function (req, res, next) {
    var result = {};
    var list = productListHelper.getCurrentOrNewList(req.currentCustomer.raw, { type: 100 });
    var recentProductModel = require('*/cartridge/models/productLists');
    var recentProductModel = new recentProductModel(list).productList;
    result.list = recentProductModel;
    result.success = true;
    result.removeUrl = URLUtils.url('RecentProduct-removeProduct').toString();

    result.list.items.forEach(function (product) {
        var targetQueryString = new QueryString();
        targetQueryString.pid = product.pid;
        product.url = URLUtils.url('Product-Show').toString() + '?' + targetQueryString.toString();
    });

    result.list.items.reverse();

    res.render('recentProduct',{
        result: result, 
    });

    next();
});

server.get('removeProduct', function (req, res, next) {

    var result = {};
    var list = productListHelper.removeItem(req.currentCustomer.raw, req.querystring.pid ,{ type: 100 });
    var recentProductModel = require('*/cartridge/models/productLists');
    var recentProductModel = new recentProductModel(list.prodList).productList;
    result.list = recentProductModel;
    result.success = true;
    result.removeUrl = URLUtils.url('RecentProduct-removeProduct').toString();

    result.list.items.forEach(function (product) {
        var targetQueryString = new QueryString();
        targetQueryString.pid = product.pid;
        product.url = URLUtils.url('Product-Show').toString() + '?' + targetQueryString.toString();
    });

    result.list.items.reverse();
    
    res.render('recentProduct',{
        result: result, 
    });

    next();
});

module.exports = server.exports();