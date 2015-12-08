/*
 * Copyright (c) 2015 Daisuke Takayama
 * Released under the MIT license
 * http://opensource.org/licenses/mit-license.php
 *
 * Author: Daisuke Takayama
 * URL: http://www.webcyou.com/
 */

"use strict";
module.exports = function(args) {
    var fs = require('fs');
    var path = require('path');
    var express = require('express');
    var bodyParser = require('body-parser');
    var _ = require('underscore')._;
    var app = express();
    var developRoot;

    var mkdirSync = function (path) {
        try {
            fs.mkdirSync(path);
        } catch(e) {
            if ( e.code != 'EEXIST' ) throw e;
        }
    };

    var getFileExists = function (filePath) {
        try {
            return fs.statSync(filePath).isFile();
        } catch (e) {
            return false;
        }
    };

    if(args !== void 0) {
        if(args.root !== void 0) {
            developRoot = args.root;
        }
    } else {
        developRoot = process.cwd();
    }

    var UIPM_FILE = path.join(developRoot, './uipm.json');

    app.set('port', (args !== void 0 && args.port || 8818));
    app.use('/', express.static(path.join(__dirname, '../public')));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    app.get('/uipm/api_all_data', function (req, res) {
        fs.readFile(UIPM_FILE, function (err, data) {
            errorHandler(err);
            res.setHeader('Cache-Control', 'no-cache');
            res.json(JSON.parse(data));
        });
    });

    /**
     * category
     **/
    app.post('/uipm/api_insert_category', function (req, res) {
        fs.readFile(UIPM_FILE, function (err, data) {
            errorHandler(err);
            var allData = JSON.parse(data),
                addId = getAddId(allData.category_list);
            var newCategory = {
                id: addId,
                name: ""
            };
            allData.category_list.push(newCategory);
            writeFile(res, allData);
        });
    });

    app.post('/uipm/api_update_category', function (req, res) {
        fs.readFile(UIPM_FILE, function (err, data) {
            errorHandler(err);
            var allData = JSON.parse(data),
                category_list = allData.category_list,
                findId = req.body.id;
            var category = _.findWhere(category_list, {id: findId});
            if (req.body.name) {
                category.name = req.body.name;
            }
            writeFile(res, allData);
        });
    });

    app.post('/uipm/api_delete_category', function (req, res) {
        fs.readFile(UIPM_FILE, function (err, data) {
            errorHandler(err);
            var allData = JSON.parse(data),
                category_list = allData.category_list,
                item_list = allData.item_list,
                findId = req.body.categoryId;

            allData.category_list = category_list.filter(function (category) {
                return (category.id !== findId);
            });
            allData.item_list = item_list.filter(function (item) {
                return (item.category_id !== findId);
            });
            writeFile(res, allData);
        });
    });

    /**
     * Item
     **/
    app.post('/uipm/api_insert_item', function (req, res) {
        fs.readFile(UIPM_FILE, function (err, data) {
            errorHandler(err);
            var allData = JSON.parse(data),
                addId = getAddId(allData.item_list);
            var newItem = {
                id: addId,
                dom: "",
                category_id: req.body.categoryId
            };
            allData.item_list.push(newItem);
            writeFile(res, allData);
        });
    });

    app.post('/uipm/api_update_item', function (req, res) {
        fs.readFile(UIPM_FILE, function (err, data) {
            errorHandler(err);
            var allData = JSON.parse(data),
                item_list = allData.item_list,
                findId = req.body.id;
            var item = _.findWhere(item_list, {id: findId});
            try {
                item.dom = req.body.dom;
            } catch (e) {
                return;
            }
            writeFile(res, allData);
        });
    });

    app.post('/uipm/api_delete_item', function (req, res) {
        fs.readFile(UIPM_FILE, function (err, data) {
            errorHandler(err);
            var allData = JSON.parse(data),
                item_list = allData.item_list,
                findId = req.body.itemId;
            allData.item_list = item_list.filter(function (item) {
                return (item.id !== findId);
            });
            writeFile(res, allData);
        });
    });

    /**
     * Assets
     **/
    app.post('/uipm/api_insert_assets', function (req, res) {
        copyAssetsFile(req.body.assets);
        if(getFileExists(developRoot + req.body.assets)) {
            fs.readFile(UIPM_FILE, function (err, data) {
                errorHandler(err);
                var allData = JSON.parse(data),
                    addId = getAddId(allData.assets_list);
                var publicPath = path.join(__dirname, '../public');
                var newAssets = {
                    id: addId,
                    type: req.body.type,
                    root_path: req.body.assets,
                    assets_path: path.relative(publicPath, path.join(developRoot + '/' + req.body.assets)),
                    file_name: path.basename(developRoot + req.body.assets)
                };
                allData.assets_list.push(newAssets);
                writeFile(res, allData);
            });
        }
    });

    app.post('/uipm/api_delete_assets', function (req, res) {
        fs.readFile(UIPM_FILE, function (err, data) {
            errorHandler(err);
            var allData = JSON.parse(data),
                assets_list = allData.assets_list,
                findId = req.body.assetsId;
            allData.assets_list = assets_list.filter(function (assets) {
                return (assets.id !== findId);
            });
            writeFile(res, allData);
        });
    });

    /**
     * Function
     **/
    function appInit() {
        function assetsDataCopyFile() {
            fs.readFile(UIPM_FILE, function (err, data) {
                errorHandler(err);
                var allData = JSON.parse(data),
                    assets_list = allData.assets_list;
                _.each(assets_list, function(assets) {
                    copyAssetsFile(assets.root_path);
                });
            });
        }

        fs.open(UIPM_FILE, 'r', function(err, fd) {
            if (err) {
                createJsonFile(function(){
                    assetsDataCopyFile();
                });
            } else {
                fd && fs.close(fd, function(err) {
                    assetsDataCopyFile();
                });
            }
        });
    }

    function writeFile(res, allData) {
        fs.writeFile(UIPM_FILE, JSON.stringify(allData, null, 4), function (err) {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            res.setHeader('Cache-Control', 'no-cache');
            res.json(allData);
        });
    }

    function errorHandler(err) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
    }

    function getAddId(itemList) {
        var addId = 1;
        if (itemList.length > 0) {
            var maxIdItem = _.max(itemList, function (item) {
                return item.id;
            });
            addId = maxIdItem.id + 1;
        }
        return addId;
    }

    function createJsonFile(callback) {
        fs.writeFileSync(UIPM_FILE, JSON.stringify({
            'assets_list': [],
            'category_list': [],
            'item_list': []
        }, null, function(err) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('Create UI Parts Manager Json File.');
        }));
        callback();
    }

    function copyAssetsFile(assetsPath) {
        fs.open(developRoot + assetsPath, 'r', function(err, fd) {
            if (!err) {
                fd && fs.close(fd, function(err) {});
                createAssetsFile(developRoot + assetsPath);
            } else {
                console.log('Can not find the asset file.');
            }
        });
    }

    function createAssetsFile(assetsPath) {
        var publicPath = path.join(__dirname, '../public');
        var fileName = path.basename(assetsPath);
        mkdirSync(publicPath + '/assets/');
        fs.createReadStream(assetsPath).pipe(fs.createWriteStream(publicPath + '/assets/' + fileName));
        console.log('Create UI Parts Manager Assets File.');
    }

    app.listen(app.get('port'), function () {
        console.log('Server started: http://localhost:' + app.get('port') + '/');
    });

    appInit();
};