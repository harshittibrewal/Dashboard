var mysql = require("mysql");

var db = {};

var _mysqlConfiguration = function(list) {
    return {
        host: list['host'],
        user: list.user,
        password: list.password,
        database: list.database,
        connectTimeout: 40000
    };
}

db.connect = function(database) {
    var con = mysql.createConnection(_mysqlConfiguration(database));
    con.connect(function(err) {
        if (err) {
            console.log("DB connection error: " + err);
            return false;
        } else {
            console.log("Connection Established");
        }
    });
    return con;
};

db.executeQuery = function(sql, database, callback) {
    var con = db.connect(database);
    console.log("query executed", sql);

    var query = con.query(sql, function(err, results) {
        if (err) {
            callback(err);
        } else {
            callback(null, results);
        }
    });
    con.end();
    return query;
};

db.insertQuery = function(sql, database, callback) {
    return new Promise((resolve, reject) => {
        db.executeQuery(sql, database, function(err, results) {
            if (err) {
                callback(err);
            } else {
                callback(null, results);
            }
        });
    });
};

db.deleteQuery = function(sql, database, callback) {
    return new Promise((resolve, reject) => {
        db.executeQuery(sql, database, function(err, results) {
            if (err) {
                callback(err);
            } else {
                callback(err, results);
            }
        });
    });
};

db.showTable = function(sql, database) {
    return new Promise((resolve, reject) => {
        db.executeQuery(sql, database, function(err, results) {
            if (err) {
                return reject(err);
            } else {
                return resolve(results);
            }
        });
    })
}

db.populate = function(sql, database) {
    return new Promise((resolve, reject) => {
        db.executeQuery(sql, database, function(err, results) {
            if (err) {
                return reject(err);
            } else {
                return resolve(results);
            }
        });
    })
}

module.exports = db;