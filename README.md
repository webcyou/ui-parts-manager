# UIPM
## UI Parts Manager
FrontEnd Developer Tool
「UI Parts Manager」

## What is this? 「これは何？」
フロントエンド開発環境にて、UIパーツを管理する Nodeモジュールとなっております。


## Install
### npm
````
$ npm install ui-parts-manager
````


## Use Module
````
var uipm = require('ui-parts-manager');
uipm();

````


## Options
| OptionName        | DefaultValue         | SetValue                 | OptionDetail|
| --------------- |:---------------:| -------------------- | -------:|
| root | process.cwd() | path      | 作業行うルートパス     |
| port | 8818 | number      | ポート番号    |

### Options exsample
````
var uipm = require('ui-parts-manager');
uipm({
  root: __dirname + '/app/sp_web',
  port: 8888
});

````


## Author

Daisuke Takayama


## License

Copyright (c) 2015 Daisuke Takayama
Released under the [MIT license](http://opensource.org/licenses/mit-license.php)


## Development start!
````
$ git clone
$ npm install
$ gulp tsd
$ gulp
# Let's access http://localhost:8818/ & coding!!

````

### Directory structure
````
├── data
│   ├── html
│   ├── css
│   ├── js
│   ├── ts
│   └── scss
│       └── common.scss
├── lib
│   └──uipm.js
│ 
├── public
│   ├── assets
│   ├── html
│   ├── css
│   ├── img
│   └── js
│
├── .gitignore
├── gulpfile.js
├── README.md
├── bower.json
├── package.json
├── tsd.json
├── tslint.json
└── uipm.json

````

### gulpfile.js
- gulp の処理が書かれています。

### bower.json
- bower package

### package.json
- gulp で使うパッケージ類がここで管理されている

### uipm.json
- UI Parts Manager を管理するjsonファイルです。

### data
基本、dataフォルダ内のファイルを扱います。
webアプリ側の処理となっております。

#### data/scss
- SCSS File
- styleに関してはscssファイルを修正。（cssファイルは扱いません。）

#### data/ts
- TypeScript File
- scriptに関しては、TypeScriptファイルを修正。

#### data/img
- imageファイルはここに格納します。

### lib
- uipm.jsにserverの処理を記述しております。

### public
- 公開フォルダとなっております。