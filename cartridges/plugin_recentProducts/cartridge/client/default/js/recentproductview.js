'use strict';

var processInclude = require('base/util');

$(document).ready(function () {
	console.log('recentproductview');
	processInclude(require('./recentproductview/recentproductview'));
});