# UIPM
![UI Parts Manager](http://webcyou.com/ui_parts_manager/img/logo_uipm.png)

## UI Parts Manager
FrontEnd Developer Tool
「UI Parts Manager」

## What is this? 「これは何？」
フロントエンド開発環境にて、UIパーツをGUIで管理する Nodeモジュールとなっております。


![UI Parts Manager](http://webcyou.com/ui_parts_manager/img/uipm001.png)


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
Grant.jsやGulpのタスクに追加すると良いかと思います。
起動すると、開発環境のルートに「uipm.json」が生成されます。
追加したUIパーツ情報はこちらのjsonファイルで管理されます。

![UI Parts Manager](http://webcyou.com/ui_parts_manager/img/uipm002.png)

ポート番号はデフォルトは「8818」となっております。
![UI Parts Manager](http://webcyou.com/ui_parts_manager/img/uipm003.png)

cssの追加を行いましょう。
開発環境のルートから「/」でcssファイルのあるパスを指定します。
![UI Parts Manager](http://webcyou.com/ui_parts_manager/img/uipm003b.png)

（レイアウト崩れましたら連絡いただけるとありがたいです。絶賛対応中）

cssファイルを追加したら、メニューバー右にあるプラスアイコンでカテゴリを追加します。

![UI Parts Manager](http://webcyou.com/ui_parts_manager/img/uipm004.png)

ダブルクリックで編集。名前を入力できます。

![UI Parts Manager](http://webcyou.com/ui_parts_manager/img/uipm005.png)

右下のプラスアイコンでアイテム項目を追加し、ダブルクリックで編集。
こちらにHTMLを入力していきます。

![UI Parts Manager](http://webcyou.com/ui_parts_manager/img/uipm006.png)

このような感じでパーツの種類ごとになど自由に管理していくことが可能となっております。

![UI Parts Manager](http://webcyou.com/ui_parts_manager/img/uipm007.png)



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
$ git clone git@github.com:webcyou/ui-parts-manager.git
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
