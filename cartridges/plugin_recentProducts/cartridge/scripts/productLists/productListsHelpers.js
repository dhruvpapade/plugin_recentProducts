'use strict';

function createList(customer, config) {
    var Transaction = require('dw/system/Transaction');
    var ProductListMgr = require('dw/customer/ProductListMgr');
    var list;

    if (config.type === 100) {
        Transaction.wrap(function () {
            list = ProductListMgr.createProductList(customer, config.type);
        });
    }

    return list;
}

function getList(customer, config) {
    var productListMgr = require('dw/customer/ProductListMgr');
    var type = config.type;
    var list;
    if (type === 100) {
        var productLists = productListMgr.getProductLists(customer, type);
        list = productLists.length > 0
            ? productLists[0]
            : null;
    } else {
        list = null;
    }

    return list;
}

function getCurrentOrNewList(customer, config) {
    var type = config.type;
    var list = getList(customer, config);
    if (list === null && type === 100) {
        list = createList(customer, { type: type });
    }

    return list;
}

function removeList(customer, list, config) {
    // will need a check on the current customer before deleting the list
    var Transaction = require('dw/system/Transaction');
    if (customer || config.mergeList) {
        var ProductListMgr = require('dw/customer/ProductListMgr');
        Transaction.wrap(function () {
            ProductListMgr.removeProductList(list);
        });
    }
}

function itemExists(list, pid, config) {
    var listItems = list.items.toArray();
    var found = false;
    listItems.forEach(function (item) {
        if (item.productID === pid) {
            found = item;
        }
    });
    if (found && found.productOptionModel && config.optionId && config.optionValue) {
        var optionModel = found.productOptionModel;
        var option = optionModel.getOption(config.optionId);
        var optionValue = optionModel.getSelectedOptionValue(option);
        if (optionValue.ID !== config.optionValue) {
            var Transaction = require('dw/system/Transaction');
            try {
                Transaction.wrap(function () {
                    list.removeItem(found);
                });
            } catch (e) {
                return found;
            }
            found = false;
        }
    }
    return found;
}

function addItem(list, pid, config,customer) {
    var Transaction = require('dw/system/Transaction');

    if (!list) { return false; }

    var itemExist = itemExists(list, pid, config);

    if (itemExist) {
        removeItem(customer, pid, config);
    }
    var ProductMgr = require('dw/catalog/ProductMgr');

    var apiProduct = ProductMgr.getProduct(pid);

    if (apiProduct.variationGroup) { return false; }

    if (apiProduct && list) {
        try {
            Transaction.wrap(function () {
                var productlistItem = list.createProductItem(apiProduct);

                if (apiProduct.optionProduct) {
                    var optionModel = apiProduct.getOptionModel();
                    var option = optionModel.getOption(config.optionId);
                    var optionValue = optionModel.getOptionValue(option, config.optionValue);

                    optionModel.setSelectedOptionValue(option, optionValue);
                    productlistItem.setProductOptionModel(optionModel);
                }

                if (apiProduct.master) {
                    productlistItem.setPublic(false);
                }

                productlistItem.setQuantityValue(config.qty);
            });
        } catch (e) {
            return false;
        }
    }
    return true;
    
}

function mergelists(listTo, listFrom, req, configObj) {
    var config;
    var pid;
    var addedItems = [];
    if (listTo && listFrom) {
        listFrom.items.toArray().forEach(function (item) {
            config = {
                //optionId: null,
                //optionValue: null,
                qty: item.quantityValue,
                //req: req,
                type: configObj.type
            };
            if (item.product.optionProduct) {
                var optionModel = item.product.getOptionModel();
                var options = optionModel.getOptions().toArray();
                var option;
                options.forEach(function (optionObj) {
                    option = optionObj;
                });

                var apiOption = optionModel.getOption(option.ID);
                var optionValue = optionModel.getSelectedOptionValue(apiOption);
                config.optionId = apiOption.ID;
                config.optionValue = optionValue.ID;
            }

            pid = item.productID;
            if (!itemExists(listTo, pid, config)) {
                addItem(listTo, pid, config,req.currentCustomer.raw);
                addedItems.push(pid);
            }
        });
        removeList(null, listFrom, { mergeList: true });
    }
    return addedItems;
}

function removeItem(customer, pid, config) {
    var Resource = require('dw/web/Resource');
    var list = getCurrentOrNewList(customer, config);
    var item = itemExists(list, pid, config);
    var result = {};
    if (item) {
        var Transaction = require('dw/system/Transaction');
        try {
            Transaction.wrap(function () {
                list.removeItem(item);
            });
        } catch (e) {
            result.error = true;
            result.msg = Resource.msg('remove.item.failure.msg', 'productlist', null);
            result.prodList = null;
            return result;
        }
        result.error = false;
        result.prodList = list;

    }
    return result;
}

function getItemFromList(list, pid) {
    var collections = require('*/cartridge/scripts/util/collections');
    var listItem = collections.find(list.items, function (item) {
        return item.productID === pid;
    });
    return listItem;
}

function GetSortOrder(prop) {    
    return function(a, b) {    
        if (a[prop] > b[prop]) {    
            return 1;    
        } else if (a[prop] < b[prop]) {    
            return -1;    
        }    
        return 0;    
    }    
}  

module.exports = {
    getList: getList,
    addItem: addItem,
    removeItem: removeItem,
    createList: createList,
    removeList: removeList,
    itemExists: itemExists,
    mergelists: mergelists,
    getItemFromList: getItemFromList,
    getCurrentOrNewList: getCurrentOrNewList,
    GetSortOrder: GetSortOrder
};
