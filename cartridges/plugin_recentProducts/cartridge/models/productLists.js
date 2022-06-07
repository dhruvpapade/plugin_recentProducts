'use strict';

var ProductListItemModel = require('*/cartridge/models/productListItem');

function createProductListObject(productListObject) {
    var result;
    if (productListObject) {
        result = {
            owner: {
                exists: !!productListObject.owner,
                firstName: productListObject.owner ? productListObject.owner.profile.firstName : false,
                lastName: productListObject.owner ? productListObject.owner.profile.lastName : false
            },
            publicList: productListObject.public,
            UUID: productListObject.UUID,
            items: [],
            type: productListObject.type
        };

        var productListItem;
        var count = productListObject.items.getLength();
        productListObject.items.toArray().forEach(function (item) {
            productListItem = new ProductListItemModel(item).productListItem;
            if (productListItem && item.product) {
                result.items.push(productListItem);
            }
        });

        result.length = count;
        
    } else {
        result = null;
    }
    return result;
}

function productList(productListObject) {
    this.productList = createProductListObject(productListObject);
}

module.exports = productList;
