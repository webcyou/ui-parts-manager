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

module Top {
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

  class Assets {
    constructor(
      public id: number,
      public type: string,
      public path: string,
      public fileName: string
      ) {
    }
    static fromJson(json: string): Assets {
      var data = JSON.parse(json);
      return Assets.fromData(data);
    }
    static fromData(data: any): Assets {
      return new Assets(
        data.id,
        data.type,
        data.assets_path,
        data.file_name
      );
    }
  }

  class Category {
    constructor(
      public id: number,
      public name: string,
      public len: number,
      public item: Item[],
      public edit: boolean
      ) {
    }
    static fromJson(json: string): Category {
      var data = JSON.parse(json);
      return Category.fromData(data);
    }
    static fromData(data: any): Category {
      return new Category(
        data.id,
        data.name,
        data.len,
        data.item.map(function(m) { return Item.fromData(m); }),
        false
      );
    }
  }

  class Item {
    constructor(
      public id: number,
      public categoryId: number,
      public dom: string,
      public edit: boolean,
      public cssClassName: string[],
      public parseHTML : string
      ) {
      this.cssClassName = this.getCssClass(dom);
    }
    static fromJson(json: string): Item {
      var data = JSON.parse(json);
      return Item.fromData(data);
    }

    static fromData(data: any): Item {
      return new Item(
        data.id,
        data.category_id,
        data.dom,
        false,
        [],
        ''
      );
    }

    public getCssClass(dom: string): string[] {
      var cssClassList = [],
          cssClass = '';
      if(dom.match(/class=".*"/g)) {
        cssClass = String(dom.match(/class=".*"/g));
        cssClass = cssClass.replace(/class=/g, "").replace(/"/g, "");
      }
      if(cssClass) {
        cssClassList = cssClass.split(',');
      }
      return cssClassList;
    }
  }

  /*
   * Use Controller Model
   */
  class TopModel {

    private _category_list: Category[];
    private _assets_list: Assets[];
    private _last_category_id: number;
    private _last_item_id: number;

    public setCategoryList(category_list: Category[]) {
      this._category_list = category_list;
    }

    public getCategoryList(): Category[] {
      return this._category_list;
    }

    public setAssetsList(assets_list: Assets[]) {
      this._assets_list = assets_list;
    }

    public getAssetsList(): Assets[] {
      return this._assets_list;
    }

    public addAssets(assets) {
      this._assets_list.push(assets);
    }

    public getAssetsType(assets) {
      var type: string = '';
      if(assets.match(/\.css/g)) {
        type = 'css';
      }
      if(assets.match(/\.js/g)) {
        type = 'JavaScript';
      }
      return type;
    }

    public addCategory() {
      var category = {
        "name": "",
        "len": "",
        "item": []
      };
      this._category_list.push(Category.fromData(category));
    }

    public deleteCategory(fn: Function) {
      var cur = angular.element(document.querySelector('.uipm-app-tabMenuList .cur'));
      if (cur.length) {
        var ret = confirm('選択しているカテゴリを削除します。');
        if (ret) {
          fn();
        }
      } else {
        alert('カテゴリを削除するには選択する必要があります。');
      }
    }

    public addItem(num: number) {
      var item = {
        "dom": "",
        "edit": false,
        "cssClassName": []
      };
      this._category_list[num].item.push(Item.fromData(item));
    }

    public deleteItem(selectedTabNum: number, num: number, fn: Function) {
      var ret = confirm('アイテムを削除します。');
      if (ret) {
        this._category_list[selectedTabNum].item.splice(num, 1);
        fn(true);
      }
    }

    public changeHtmlConv(val: string): string {
      var changeTxt : string = '',
          cr : RegExp = new RegExp('\r', 'g'),
          lf : string = '<br />',
          strCr : string = '',
          strLf : string = '\n';
      changeTxt = _.unescape(val);

      if (val.indexOf('\r\n') > -1) {
        changeTxt = changeTxt.replace(cr, strCr).replace(lf, strLf);
      }
      return changeTxt;
    }
  }

  export var app: ng.IModule = angular.module('Top', []);

  /**
   * MainController
   */
  interface MainControllerScope extends ng.IScope {
    categoryList: Category[];
    assetsList: Assets[];
    selectedTabNum: number;
    assets: string;
    isShowAssets: boolean;

    onClickTabChange: Function;
    onClickAddCategory: Function;
    onClickAddItem: Function;
    onClickDeleteCategory: Function;
    onClickDeleteItem: Function;
    onClickDeleteAssets: Function;

    getCategoryData: Function;
    convDom: Function;

    insertAssets: Function;
    deleteAssets: Function;

    insertCategory: Function;
    insertItem: Function;
    deleteItem: Function;
    deleteCategory: Function;

    editResetCategory: Function;
    editResetItem: Function;
    upDateItem: Function;
    upDateCategory: Function;

    onClickAddAssets: Function;

    onDblEditCategory: Function;
    onClickAssetsSwitch: Function;

    addAssetsLink: Function;
  }

  app
    .value('data', {})
    .factory('model', [
    'data',
    '$http',
    function(data: any, $http: ng.IHttpService) {
      var model: TopModel = new TopModel();
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
    function(
      $scope: MainControllerScope,
      model: TopModel,
      $timeout: ng.ITimeoutService,
      $filter: ng.IFilterService,
      $sce: ng.ISCEService,
      $http: ng.IHttpService
      ) {
      $scope.selectedTabNum = 0;
      $scope.isShowAssets = false;

      $scope.getCategoryData = () => {
        $http({
          method: 'GET',
          url: urlList.API_GET_ALL_DATA,
          data: {
          }
        }).success(function(data, status, headers, config) {
          var categoryList = [],
              assetsList = [];
          _.each(data.category_list, function(category) {
            category['item'] = [];
            _.each(data.item_list, function(item) {
              if (category['id'] === item['category_id']) {
                category['item'].push(item);
              }
            });
            categoryList.push(Category.fromData(category));
          });
          _.each(data.assets_list, function(assets) {
            assetsList.push(Assets.fromData(assets));
          });

          model.setCategoryList(categoryList);
          model.setAssetsList(assetsList);

          $scope.categoryList = model.getCategoryList();
          $scope.assetsList = model.getAssetsList();
          $scope.convDom();
          $scope.addAssetsLink();
        }).error(function(data, status, headers, config) {
        });
      };

      $scope.convDom = () => {
        _.each($scope.categoryList, function(category: Category, cNum: number) {
          if (!category.name.length) {
            category.len = 12;
          } else {
            category.len = category.name.length * 12;
          }
          _.each(category.item, function(item: Item, iNum: number) {
            $scope.categoryList[cNum].item[iNum].dom = model.changeHtmlConv(item.dom);
            $scope.categoryList[cNum].item[iNum].parseHTML = $sce.trustAsHtml($scope.categoryList[cNum].item[iNum].dom);
          });
        });
      };

      $scope.onClickTabChange = (num: number) => {
        $scope.selectedTabNum = num;
      };

      // Add Category
      $scope.onClickAddCategory = () => {
        model.addCategory();
        $scope.insertCategory();
      };

      // Add Assets
      $scope.onClickAddAssets = (assets) => {
        if(assets) {
          var type = model.getAssetsType(assets);
          model.addAssets(assets);
          $scope.assetsList = model.getAssetsList();
          $scope.insertAssets(assets, type);
          $scope.assets = '';
        }
      };

      // delete assets
      $scope.onClickDeleteAssets = (assets) => {
        $scope.deleteAssets(assets);
      };

      // delete category
      $scope.onClickDeleteCategory = (category) => {
        model.deleteCategory(function() {
          $scope.deleteCategory(category);
        });
      };

      $scope.onClickDeleteItem = (selectedTabNum: number, num: number, item) => {
        var item = item;
        model.deleteItem(selectedTabNum, num, function(isDelete){
          if(isDelete) {
            $scope.deleteItem(item);
          }
        });
      };

      $scope.onClickAddCategory = () => {
        model.addCategory();
        $scope.insertCategory();
      };

      $scope.onClickAddItem = (num: number, category) => {
        model.addItem(num);
        $scope.insertItem(category);
      };

      $scope.onDblEditCategory = (category: Category) => {
        category.edit = true;
      };

      $scope.onClickAssetsSwitch = () => {
        $scope.isShowAssets = !$scope.isShowAssets;
      };

      /**
        * category
      **/
      $scope.editResetCategory = (tCategory) => {
        _.each($scope.categoryList, function(category) {
          category.edit = false;
          if (category.name.length > 0) {
            category.len = category.name.length * 12;
          }
        });
        $scope.upDateCategory(tCategory);
      };

      // insert
      $scope.insertCategory = () => {
        $http({
          method: 'POST',
          url: urlList.API_INSERT_CATEGORY,
          data: {
          }
        }).success(function(data, status, headers, config) {
          $scope.getCategoryData();
          $scope.onClickTabChange($scope.categoryList.length - 1);
        }).error(function(data, status, headers, config) {
        });
      };

      // update
      $scope.upDateCategory = (category) => {
        $http({
          method: 'POST',
            url: urlList.API_UPDATE_CATEGORY,
            data: {
              id: category.id,
              name: category.name
            }
        }).success(function(data, status, headers, config) {
        }).error(function(data, status, headers, config) {
        });
      };

      // delete
      $scope.deleteCategory = (category) => {
        $http({
            method: 'POST',
            url: urlList.API_DELETE_CATEGORY,
            data: {
                categoryId: category.id
            }
        }).success(function(data, status, headers, config) {
          $scope.getCategoryData();
          $scope.onClickTabChange(0);
        }).error(function(data, status, headers, config) {
        });
      };

      /**
        * item
      **/
      // insert
      $scope.insertItem = (category) => {
          $http({
              method: 'POST',
              url: urlList.API_INSERT_ITEM,
              data: {
                  categoryId: category.id
              }
          }).success(function(data, status, headers, config) {

          }).error(function(data, status, headers, config) {
          });
      };

      // edit reset
      $scope.editResetItem = (item) => {
        _.each($scope.categoryList, function(category) {
          _.each(category.item, function(item) {
            item.edit = false;
            item.parseHTML = $sce.trustAsHtml(item.dom);
          });
        });
        $scope.upDateItem(item);
      };

      // update
      $scope.upDateItem = (item) => {
        $http({
          method: 'POST',
          url: urlList.API_UPDATE_ITEM,
          data: {
            id: item.id,
            dom: item.dom
          }
        }).success(function(data, status, headers, config) {
        }).error(function(data, status, headers, config) {
        });
      };

      // delete
      $scope.deleteItem = (item) => {
        $http({
          method: 'POST',
          url: urlList.API_DELETE_ITEM,
          data: {
            itemId: item.id
          }
        }).success(function(data, status, headers, config) {
        }).error(function(data, status, headers, config) {
        });
      };

      /**
        * assets
      **/
      // insert
      $scope.insertAssets = (assets, type) => {
        $http({
          method: 'POST',
          url: urlList.API_INSERT_ASSETS,
          data: {
            assets: assets,
            type: type
          }
        }).success(function(data, status, headers, config) {
          $scope.getCategoryData();
        }).error(function(data, status, headers, config) {
        });
      };
        
      // delete
      $scope.deleteAssets = (assets) => {
        $http({
          method: 'POST',
          url: urlList.API_DELETE_ASSETS,
          data: {
            assetsId: assets.id
          }
        }).success(function(data, status, headers, config) {
          $scope.getCategoryData();
        }).error(function(data, status, headers, config) {
        });
      };

      $scope.addAssetsLink = () => {
        var head = document.getElementsByTagName('head')[0];
        _.each($scope.assetsList, function(assets) {
          if(assets.type === 'css') {
            var cssLink = document.createElement('link');
            cssLink.href = '/assets/' + assets.fileName;
            cssLink.rel = 'stylesheet';
            cssLink.type = 'text/css';
            cssLink.media = 'screen';
            head.appendChild(cssLink);
          }
          if(assets.type === 'JavaScript') {
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
    (
      $timeout: ng.ITimeoutService,
      model: TopModel
      ): {} => {
      return {
        restrict: 'A',
        link: function (scope, elements, attr) {
          var element = elements[0];
          var textArea = angular.element(element.querySelector('textarea'));
          element.addEventListener('dblclick', () => {
            $timeout(()=>{
              scope.item.edit = true;
            }, 10);
            $timeout(()=>{
              textArea[0].focus();
            }, 50);
          }, false);
        }
      };
    }
  ]);
}
