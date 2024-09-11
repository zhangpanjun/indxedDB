# indxedDB
 关于indexedDB的一些基础操作demo。
 原生JavaScript写法，直接下载，双击index.html即可，点击页面对应按钮，打开控制台，查看console  和 Application下的indexedDB，直观感受如何对  应用于浏览器端的非关系型数据库的增删改查。
# 注意！！！ 
 1.代码中插入的id,age等字段的值是随机生成的，在一些查询方法中请更改对应值，再执行。
 2.如本地更改代码保存后控制台报  Uncaught TypeError: Cannot read properties of undefined (reading 'transaction')  ，是因为页面被重新自动加载找不到全局dbInstance数据库实例，只需重新点击打开数据库，再执行其他操作按钮即可。
