/*
 * Copyright (c) 2015 Daisuke Takayama
 * Released under the MIT license
 * http://opensource.org/licenses/mit-license.php
 *
 * Author: Daisuke Takayama
 * URL: http://www.webcyou.com/
 */
/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../../typings/underscore/underscore.d.ts" />
/// <reference path="../../typings/node/node.d.ts" />
'use strict';
var global = this;
var Top;
(function (Top) {
    var urlList = {
        'API_GET_ALL_DATA': '/uipm/api_all_data',
        'API_INSERT_ASSETS': '/uipm/api_insert_assets',
        'API_DELETE_ASSETS': '/uipm/api_delete_assets',
        'API_INSERT_CATEGORY': '/uipm/api_insert_category',
        'API_UPDATE_CATEGORY': '/uipm/api_update_category',
        'API_DELETE_CATEGORY': '/uipm/api_delete_category',
        'API_INSERT_ITEM': '/uipm/api_insert_item',
        'API_UPDATE_ITEM': '/uipm/api_update_item',
        'API_DELETE_ITEM': '/uipm/api_delete_item'
    };
    var Assets = (function () {
        function Assets(id, type, path, fileName) {
            this.id = id;
            this.type = type;
            this.path = path;
            this.fileName = fileName;
        }
        Assets.fromJson = function (json) {
            var data = JSON.parse(json);
            return Assets.fromData(data);
        };
        Assets.fromData = function (data) {
            return new Assets(data.id, data.type, data.assets_path, data.file_name);
        };
        return Assets;
    })();
    var Category = (function () {
        function Category(id, name, len, item, edit) {
            this.id = id;
            this.name = name;
            this.len = len;
            this.item = item;
            this.edit = edit;
        }
        Category.fromJson = function (json) {
            var data = JSON.parse(json);
            return Category.fromData(data);
        };
        Category.fromData = function (data) {
            return new Category(data.id, data.name, data.len, data.item.map(function (m) { return Item.fromData(m); }), false);
        };
        return Category;
    })();
    var Item = (function () {
        function Item(id, categoryId, dom, edit, cssClassName, parseHTML) {
            this.id = id;
            this.categoryId = categoryId;
            this.dom = dom;
            this.edit = edit;
            this.cssClassName = cssClassName;
            this.parseHTML = parseHTML;
            this.cssClassName = this.getCssClass(dom);
        }
        Item.fromJson = function (json) {
            var data = JSON.parse(json);
            return Item.fromData(data);
        };
        Item.fromData = function (data) {
            return new Item(data.id, data.category_id, data.dom, false, [], '');
        };
        Item.prototype.getCssClass = function (dom) {
            var cssClassList = [], cssClass = '';
            if (dom.match(/class=".*"/g)) {
                cssClass = String(dom.match(/class=".*"/g));
                cssClass = cssClass.replace(/class=/g, "").replace(/"/g, "");
            }
            if (cssClass) {
                cssClassList = cssClass.split(',');
            }
            return cssClassList;
        };
        return Item;
    })();
    var TopModel = (function () {
        function TopModel() {
        }
        TopModel.prototype.setCategoryList = function (category_list) {
            this._category_list = category_list;
        };
        TopModel.prototype.getCategoryList = function () {
            return this._category_list;
        };
        TopModel.prototype.setAssetsList = function (assets_list) {
            this._assets_list = assets_list;
        };
        TopModel.prototype.getAssetsList = function () {
            return this._assets_list;
        };
        TopModel.prototype.addAssets = function (assets) {
            this._assets_list.push(assets);
        };
        TopModel.prototype.getAssetsType = function (assets) {
            var type = '';
            if (assets.match(/\.css/g)) {
                type = 'css';
            }
            if (assets.match(/\.js/g)) {
                type = 'JavaScript';
            }
            return type;
        };
        TopModel.prototype.addCategory = function () {
            var category = {
                "name": "",
                "len": "",
                "item": []
            };
            this._category_list.push(Category.fromData(category));
        };
        TopModel.prototype.deleteCategory = function (fn) {
            var cur = angular.element(document.querySelector('.uipm-app-tabMenuList .cur'));
            if (cur.length) {
                var ret = confirm('選択しているカテゴリを削除します。');
                if (ret) {
                    fn();
                }
            }
            else {
                alert('カテゴリを削除するには選択する必要があります。');
            }
        };
        TopModel.prototype.addItem = function (num) {
            var item = {
                "dom": "",
                "edit": false,
                "cssClassName": []
            };
            this._category_list[num].item.push(Item.fromData(item));
        };
        TopModel.prototype.deleteItem = function (selectedTabNum, num, fn) {
            var ret = confirm('アイテムを削除します。');
            if (ret) {
                this._category_list[selectedTabNum].item.splice(num, 1);
                fn(true);
            }
        };
        TopModel.prototype.changeHtmlConv = function (val) {
            var changeTxt = '', cr = new RegExp('\r', 'g'), lf = '<br />', strCr = '', strLf = '\n';
            changeTxt = _.unescape(val);
            if (val.indexOf('\r\n') > -1) {
                changeTxt = changeTxt.replace(cr, strCr).replace(lf, strLf);
            }
            return changeTxt;
        };
        return TopModel;
    })();
    Top.app = angular.module('Top', []);
    Top.app
        .value('data', {})
        .factory('model', [
        'data',
        '$http',
        function (data, $http) {
            var model = new TopModel();
            return model;
        }
    ])
        .controller('MainController', [
        '$scope',
        'model',
        '$timeout',
        '$filter',
        '$sce',
        '$http',
        function ($scope, model, $timeout, $filter, $sce, $http) {
            $scope.selectedTabNum = 0;
            $scope.isShowAssets = false;
            $scope.getCategoryData = function () {
                $http({
                    method: 'GET',
                    url: urlList.API_GET_ALL_DATA,
                    data: {}
                }).success(function (data, status, headers, config) {
                    var categoryList = [], assetsList = [];
                    _.each(data.category_list, function (category) {
                        category['item'] = [];
                        _.each(data.item_list, function (item) {
                            if (category['id'] === item['category_id']) {
                                category['item'].push(item);
                            }
                        });
                        categoryList.push(Category.fromData(category));
                    });
                    _.each(data.assets_list, function (assets) {
                        assetsList.push(Assets.fromData(assets));
                    });
                    model.setCategoryList(categoryList);
                    model.setAssetsList(assetsList);
                    $scope.categoryList = model.getCategoryList();
                    $scope.assetsList = model.getAssetsList();
                    $scope.convDom();
                    $scope.addAssetsLink();
                }).error(function (data, status, headers, config) {
                });
            };
            $scope.convDom = function () {
                _.each($scope.categoryList, function (category, cNum) {
                    if (!category.name.length) {
                        category.len = 12;
                    }
                    else {
                        category.len = category.name.length * 12;
                    }
                    _.each(category.item, function (item, iNum) {
                        $scope.categoryList[cNum].item[iNum].dom = model.changeHtmlConv(item.dom);
                        $scope.categoryList[cNum].item[iNum].parseHTML = $sce.trustAsHtml($scope.categoryList[cNum].item[iNum].dom);
                    });
                });
            };
            $scope.onClickTabChange = function (num) {
                $scope.selectedTabNum = num;
            };
            $scope.onClickAddCategory = function () {
                model.addCategory();
                $scope.insertCategory();
            };
            $scope.onClickAddAssets = function (assets) {
                if (assets) {
                    var type = model.getAssetsType(assets);
                    model.addAssets(assets);
                    $scope.assetsList = model.getAssetsList();
                    $scope.insertAssets(assets, type);
                    $scope.assets = '';
                }
            };
            $scope.onClickDeleteAssets = function (assets) {
                $scope.deleteAssets(assets);
            };
            $scope.onClickDeleteCategory = function (category) {
                model.deleteCategory(function () {
                    $scope.deleteCategory(category);
                });
            };
            $scope.onClickDeleteItem = function (selectedTabNum, num, item) {
                var item = item;
                model.deleteItem(selectedTabNum, num, function (isDelete) {
                    if (isDelete) {
                        $scope.deleteItem(item);
                    }
                });
            };
            $scope.onClickAddCategory = function () {
                model.addCategory();
                $scope.insertCategory();
            };
            $scope.onClickAddItem = function (num, category) {
                model.addItem(num);
                $scope.insertItem(category);
            };
            $scope.onDblEditCategory = function (category) {
                category.edit = true;
            };
            $scope.onClickAssetsSwitch = function () {
                $scope.isShowAssets = !$scope.isShowAssets;
            };
            $scope.editResetCategory = function (tCategory) {
                _.each($scope.categoryList, function (category) {
                    category.edit = false;
                    if (category.name.length > 0) {
                        category.len = category.name.length * 12;
                    }
                });
                $scope.upDateCategory(tCategory);
            };
            $scope.insertCategory = function () {
                $http({
                    method: 'POST',
                    url: urlList.API_INSERT_CATEGORY,
                    data: {}
                }).success(function (data, status, headers, config) {
                    $scope.getCategoryData();
                    $scope.onClickTabChange($scope.categoryList.length - 1);
                }).error(function (data, status, headers, config) {
                });
            };
            $scope.upDateCategory = function (category) {
                $http({
                    method: 'POST',
                    url: urlList.API_UPDATE_CATEGORY,
                    data: {
                        id: category.id,
                        name: category.name
                    }
                }).success(function (data, status, headers, config) {
                }).error(function (data, status, headers, config) {
                });
            };
            $scope.deleteCategory = function (category) {
                $http({
                    method: 'POST',
                    url: urlList.API_DELETE_CATEGORY,
                    data: {
                        categoryId: category.id
                    }
                }).success(function (data, status, headers, config) {
                    $scope.getCategoryData();
                    $scope.onClickTabChange(0);
                }).error(function (data, status, headers, config) {
                });
            };
            $scope.insertItem = function (category) {
                $http({
                    method: 'POST',
                    url: urlList.API_INSERT_ITEM,
                    data: {
                        categoryId: category.id
                    }
                }).success(function (data, status, headers, config) {
                }).error(function (data, status, headers, config) {
                });
            };
            $scope.editResetItem = function (item) {
                _.each($scope.categoryList, function (category) {
                    _.each(category.item, function (item) {
                        item.edit = false;
                        item.parseHTML = $sce.trustAsHtml(item.dom);
                    });
                });
                $scope.upDateItem(item);
            };
            $scope.upDateItem = function (item) {
                $http({
                    method: 'POST',
                    url: urlList.API_UPDATE_ITEM,
                    data: {
                        id: item.id,
                        dom: item.dom
                    }
                }).success(function (data, status, headers, config) {
                }).error(function (data, status, headers, config) {
                });
            };
            $scope.deleteItem = function (item) {
                $http({
                    method: 'POST',
                    url: urlList.API_DELETE_ITEM,
                    data: {
                        itemId: item.id
                    }
                }).success(function (data, status, headers, config) {
                }).error(function (data, status, headers, config) {
                });
            };
            $scope.insertAssets = function (assets, type) {
                $http({
                    method: 'POST',
                    url: urlList.API_INSERT_ASSETS,
                    data: {
                        assets: assets,
                        type: type
                    }
                }).success(function (data, status, headers, config) {
                    $scope.getCategoryData();
                }).error(function (data, status, headers, config) {
                });
            };
            $scope.deleteAssets = function (assets) {
                $http({
                    method: 'POST',
                    url: urlList.API_DELETE_ASSETS,
                    data: {
                        assetsId: assets.id
                    }
                }).success(function (data, status, headers, config) {
                    $scope.getCategoryData();
                }).error(function (data, status, headers, config) {
                });
            };
            $scope.addAssetsLink = function () {
                var head = document.getElementsByTagName('head')[0];
                _.each($scope.assetsList, function (assets) {
                    if (assets.type === 'css') {
                        var cssLink = document.createElement('link');
                        cssLink.href = '/assets/' + assets.fileName;
                        cssLink.rel = 'stylesheet';
                        cssLink.type = 'text/css';
                        cssLink.media = 'screen';
                        head.appendChild(cssLink);
                    }
                    if (assets.type === 'JavaScript') {
                        var jsLink = document.createElement('script');
                        jsLink.src = assets.path;
                        jsLink.type = 'text/javascript';
                        head.appendChild(jsLink);
                    }
                });
            };
            $scope.getCategoryData();
        }
    ])
        .directive('itemList', [
        '$timeout',
        'model',
        function ($timeout, model) {
            return {
                restrict: 'A',
                link: function (scope, elements, attr) {
                    var element = elements[0];
                    var textArea = angular.element(element.querySelector('textarea'));
                    element.addEventListener('dblclick', function () {
                        $timeout(function () {
                            scope.item.edit = true;
                        }, 10);
                        $timeout(function () {
                            textArea[0].focus();
                        }, 50);
                    }, false);
                }
            };
        }
    ]);
})(Top || (Top = {}));
