

/**
 * 打开数据库，并创建仓库
 * @param {string} dbName 数据库名称
 * @param {string} ver 数据库版本
 */
function openDB(dbName,ver =1) {
   return new Promise((resolve,reject)=>{
        // 获取window中内置的indexDB
        let indexDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        let dbInstance; 
        // 打开数据库（如果没有则会创建）
        const request = indexDB.open(dbName,ver)
        // 数据库有更新时的回调（新建数据库，新建数据库中的表） onupgradeneeded执行时机 > onsuccess 执行时机
        request.onupgradeneeded = function(e){
            console.log('更新',e)
            dbInstance = e.target.result // 数据库实例对象
            // 创建 存储仓库/表
            let objStore = dbInstance.createObjectStore('users',{
                keyPath: 'id', // 主键
                // autoIncrement: true // 可以不设置，自主自增
            })
            objStore.createIndex('id','id',{unique: true}); // 创建索引，如果此索引是主键，则必须要求此索引值唯一
            objStore.createIndex('name','name',{unique: false});
            objStore.createIndex('age','age',{unique: false});
        }
        // 链式操作，异步处理打开成功后的回调函数
        request.onsuccess = function(e) {
            console.log('数据库打开成功',)
            dbInstance = e.target.result // 数据库实例对象
            resolve(dbInstance)
        }
        request.onerror = function(e) {
            console.log('数据库打开失败',e)
            reject(e)
        }

    })
}
/**
 * 向仓库中加入数据
 * @param {object} dbInstance 数据库实例对象
 * @param {string} storeName  存储库名称
 * @param {object} data 插入的数据（插入的数据需要至少包含  在创建此仓库库中的索引 + 主键 的键值对）
 */
function addData(dbInstance,storeName,data) {
    let request = dbInstance.transaction([storeName],'readwrite') // 创建事务对象，指定存储库名称，和对此存储库的操作权限
    .objectStore(storeName) // 锁定要操作的具体的存储库名
    .add(data); // 执行添加数据操作
    request.onerror = function (e) {
        console.log('数据写入失败回调',e)
    }
    request.onsuccess = function (e) {
        console.log('数据写入成功回调',e)
    }
}
/**
 * 根据主键id,查询对应数据
 * @param {object} dbInstance 数据库
 * @param {string} storeName 仓储名
 * @param {string} key 主键
 */
function getDataByKey(dbInstance,storeName,key) {
    let request = dbInstance.transaction([storeName],'readonly').objectStore(storeName).get(key)
    request.onsuccess=(e) => {
        console.log('根据主键获取数据成功',e.target.result)
    }
    request.onerror=(e) => {
        console.log('根据主键获取数据失败',e)
    }
}
/**
 * 查询所有数据
 * @param {object} dbInstance 数据库
 * @param {string} storeName 仓储名
 *
 */
function getAllData(dbInstance,storeName) {
    let request = dbInstance.transaction([storeName],'readonly').objectStore(storeName).getAll()
    request.onsuccess=(e) => {
        console.log('获取所有数据成功',e.target.result)
    }
    request.onerror=(e) => {
        console.log('获取所有数据失败',e)
    }
}
/**
 * 根据游标,查询所有数据
 * @param {object} dbInstance 
 * @param {string} storeName 
 * 
 */
function getAllDataByCursor(dbInstance,storeName) {
    let request = dbInstance.transaction([storeName]).objectStore(storeName).openCursor()
    let list = []
    request.onsuccess=(e) => {
        const cursor = e.target.result
        if (cursor) {
            list.push(cursor.value)
            cursor.continue()
        } else {
            console.log('根据游标获取所有数据成功',list)
        }
    }
    request.onerror=(e) => {
        console.log('根据游标获取所有数据失败',e)
    }
}
/**
 * 根据索引查询符合条件第一条数据
 * @param {object} dbInstance 
 * @param {string} storeName 
 * @param {string} index 索引名称 
 * @param {string} indexValue 索引值
 */
function getFirstDataByIndex(dbInstance,storeName,index,indexValue) {
    let request = dbInstance.transaction([storeName]).objectStore(storeName).index(index).get(indexValue)
    request.onsuccess=(e) => {
        console.log('通过索引查询符合条件的第一条数据成功',e.target.result)
    }
    request.onerror=(e) => {
        console.log('通过索引查询失败',e)
    }
}
/**
 * 根据索引查询符合条件所有数据
 * @param {object} dbInstance 
 * @param {string} storeName 
 * @param {string} index 索引名称 
 * @param {string} indexValue 索引值
 */
function getAllDataByIndex(dbInstance,storeName,index,indexValue) {
    let request = dbInstance.transaction([storeName]).objectStore(storeName).index(index).getAll(indexValue)
    request.onsuccess=(e) => {
        console.log('通过索引查询符合条件所有数据成功',e.target.result)
    }
    request.onerror=(e) => {
        console.log('通过索引查询失败',e)
    }
}
/**
 * 根据游标挨个遍历 查询符合条件所有数据
 * @param {object} dbInstance 
 * @param {string} storeName 
 * @param {string} index 索引名称 
 * @param {string} indexValue 索引值
 */
function getDataByCursor(dbInstance,storeName,index,indexValue) {
    let request = dbInstance.transaction([storeName]).objectStore(storeName).openCursor()
    let list = [];
    request.onsuccess=(e) => {
        let cursor = e.target.result
        if (cursor) {
            if (cursor.value[index] === indexValue) {
                list.push(cursor.value)
            }
            cursor.continue()
        } else {
            console.log('通过游标挨个遍历  查询成功',list)
        }

    }
    request.onerror=(e) => {
        console.log('通过游标挨个遍历 标查询失败',e)
    }
}
/**
 * 根据索引+游标指定查询范围 查询符合条件所有数据
 * @param {object} dbInstance 
 * @param {string} storeName 
 * @param {string} index 索引名称 
 * @param {string} indexValue 索引值
 */
function getDataByIndexAndCursorRange(dbInstance,storeName,index,indexValue) {
    let request = dbInstance.transaction([storeName]).objectStore(storeName).index(index).openCursor(IDBKeyRange.upperBound(indexValue))
    let list = [];
    request.onsuccess=(e) => {
        let cursor = e.target.result
        if (cursor) {
            list.push(cursor.value)
            cursor.continue()
        } else {
            console.log('通过索引+游标指定查询范围 查询成功',list)
        }

    }
    request.onerror=(e) => {
        console.log('通过索引+游标指定查询范围 查询失败',e)
    }
}
/**
 * 根据索引+游标指定查询范围 分页查询符合条件的数据
 * @param {object} dbInstance 
 * @param {string} storeName 
 * @param {string} index 索引名称 
 * @param {string} indexValue 索引值
 * @param {number} pageSize  
 * @param {number} current 页码
 */
function getPageDataByIndexAndCursorRange(dbInstance,storeName,index,indexValue,pageSize,current) {
    let request = dbInstance.transaction([storeName]).objectStore(storeName).index(index).openCursor(IDBKeyRange.only(indexValue))
    let list = [];
    let count = 0; // 计数器，当计数器的值=pageSize时就停止累加
    let advance = true; // 是否需要跳过后查询
    request.onsuccess=(e) => {
        let cursor = e.target.result
        // 当页码 >1 且 需要跳过之前已经查询过的条数，再查询时，需要将指针 指向 pageSize*current + 1 再开始扫描
        if (current >1 && advance) {
            advance = false //继续向下扫
            cursor.advance(pageSize*current + 1) // 将指针位置调整
            return;
        }
        // 一旦扫描的条数 = pageSize条数，就将cursor手动置为空，停止扫描；
        if (count >= pageSize) {
            console.log('----',count,cursor,list)
            cursor = null
        }
        // 如果cursor有值，则直接将数据添加到list中
        if (cursor) {
            list.push(cursor.value)
            cursor.continue()
            count +=1;
        } else {
            console.log(`通过索引+游标指定查询范围 分页查询第${current}页成功`,list)
        }

    }
    request.onerror=(e) => {
        console.log(`通过索引+游标指定查询范围 分页查询第${current}页失败`,e)
    }
}
/**
 * 向仓库中更新数据
 * @param {object} dbInstance 数据库实例对象
 * @param {string} storeName  存储库名称
 * @param {object} data 更新的数据（如果仓库里有则直接更新，没有则在插入一条）
 */
function updateDataByKey(dbInstance,storeName,data) {
    let request = dbInstance.transaction([storeName],'readwrite') // 创建事务对象，指定存储库名称，和对此存储库的操作权限
    .objectStore(storeName) // 锁定要操作的具体的存储库名
    .put(data); 
    request.onerror = function (e) {
        console.log('数据更新失败回调',e)
    }
    request.onsuccess = function (e) {
        console.log('数据更新成功回调',e.target.result)
    }
}
/**
 * 通过主键删除数据
 * @param {object} dbInstance 数据库实例对象
 * @param {string} storeName  存储库名称
 * @param {string} key 删除的主键
 */
function deleteDataByKey(dbInstance,storeName,key) {
    let request = dbInstance.transaction([storeName],'readwrite') // 创建事务对象，指定存储库名称，和对此存储库的操作权限
    .objectStore(storeName) // 锁定要操作的具体的存储库名
    .delete(key); 
    request.onerror = function (e) {
        console.log('通过主键删除失败回调',e)
    }
    request.onsuccess = function (e) {
        console.log('数通过主键删除成功回调',e.target.result)
    }
}
/**
 * 通过索引+游标删除数据
 * @param {object} dbInstance 数据库实例对象
 * @param {string} storeName  存储库名称
 * @param {string} index 删除的索引名
 * @param {string} indexValue 删除的索引值
 * @param {object} callback 删除成功后的回调
 */
function deleteDataByIndexAndCursor(dbInstance,storeName,index,indexValue,callback) {
    let request = dbInstance.transaction([storeName],'readwrite') // 创建事务对象，指定存储库名称，和对此存储库的操作权限
    .objectStore(storeName) // 锁定要操作的具体的存储库名
    .index(index)
    .openCursor(IDBKeyRange.only(indexValue)); 
    request.onsuccess = function (e) {
        let cursor = e.target.result;
        if (cursor) {
            let deleteRequest = cursor.delete();
            console.log('+++++',deleteRequest)
            deleteRequest.onerror =  function(e) {
                console.log('删除当前值失败')
            }
            deleteRequest.onsuccess =  function(e) {
                console.log('删除当前值成功',e.target.result)
            }
            cursor.continue()
        } else {
            console.log('通过索引+游标删除数据成功回调')
            if (callback) {
                callback()
            }
        }

    }
    request.onerror = function (e) {
        console.log('通过索引+游标删除数据失败回调',e)
    }
}
// 关闭数据库
function closeDB(dbInstance) {
    dbInstance.close() // 同步操作
    console.log('关闭数据库成功')
}
// 删除数据库
function deleteDataBase(dbName){
    let db = window.indexedDB
    let req = db.deleteDatabase(dbName)
    req.onsuccess = function () {
        console.log('删除数据成功')
    }
    
}