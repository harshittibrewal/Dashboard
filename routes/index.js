var express = require('express');
var router = express.Router();
var async = require('async');
var db = require('./service/mysql');

var populate_dropdowns = function(results) {
    var populate = [];
    for (var i in results) {
        populate[i] = {}
        populate[i]["id"] = results[i]['id'];
        populate[i]["name"] = results[i]['name'];
    }
    populate.sort(function(a, b) {
        var nameA = a.name.toLowerCase(),
            nameB = b.name.toLowerCase()
        if (nameA < nameB)
            return -1
        if (nameA > nameB)
            return 1
        return 0
    });
    return populate;
}

var database1 = {
    host: 'db-slave.proptiger.com',
    user: 's3l3ct_us3r',
    password: '6E6q:vWMT^F',
    database: 'cms'
};

var database2 = {
    host: '192.168.21.5',
    user: 'root',
    password: 'root',
    database: 'dawnstar'
};

var database3 = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dawnstar'
};

var template = {};
(function() {
    var qry = 'select DISTINCT b.id as id, b.name as name from url_category_breadcrum_mapping a inner join url_categories b ON a.url_category_id = b.id ORDER BY b.id asc';
    db.executeQuery(qry, database3, function(err, results) {
        for (var i in results) {
            template[results[i]["id"]] = results[i]["name"];
        }
    });
}());

router.post('/show_table', function(req, res, next) {
    var id = req.body;
    console.log(id);
    var qry = 'select a.level, a.sub_url_category_id, a.url_order FROM url_category_breadcrum_mapping a inner join url_categories b ON b.id = a.url_category_id where b.id =' + id + ' ORDER BY a.level,a.url_order';
    console.log(qry);
    db.showTable(qry, database3).then(function(results) {
        console.log("data fetched");
        console.log(results);
        var table = {
            id: id,
            name: template[id],
            links: []
        };
        var x = 0;
        var y = 0;
        for (var i in results) {
            if (x != results[i].level) {
                table.links[results[i].level] = [];
                y = 0;
            }
            x = results[i].level;
            table.links[x][y] = {};
            table.links[x][y]["sub_url_id"] = results[i].sub_url_category_id;
            table.links[x][y]["sub_url"] = template[results[i].sub_url_category_id];
            table.links[x][y]["order"] = results[i].url_order;
            y++;
        }

        //console.log(table['links']);
        //console.log(table);
        res.render('table', { table: table, populate_url: template });
    }, function(err) {
        console.log("Database Error");
    });
});

router.get('/getid', function(req, res, next) {
    var qry = "select DISTINCT b.id, b.name from url_category_breadcrum_mapping a inner join url_categories b ON a.url_category_id = b.id ORDER BY b.id asc";
    db.populate(qry, database3).then(function(results) {
        //var populate = populate_dropdowns(results);
        res.render('breadcrumb', {populate_url: results});
    }, function(err) {
        console.log("Database Error");
        //callback(err);
    });
})


router.get('/get', function(req, res, next) {

    async.parallel([
            function(callback) {
                var qry = "select DISTINCT a.url_category_id, b.name from url_category_breadcrum_mapping a inner join url_categories b ON a.url_category_id = b.id ORDER BY a.url_category_id asc";
                db.populate(qry, database2).then(function(results) {
                    var populate = populate_dropdowns(results);
                    callback(null, populate);
                }, function(err) {
                    console.log("Database Error");
                    callback(err);
                });
            },
            function(callback) {
                var qry = 'select CITY_ID as id , LABEL as name from city WHERE STATUS in ("Active" , "ActiveInMakaan") ORDER BY name asc';
                db.populate(qry, database1).then(function(results) {
                    var populate = populate_dropdowns(results);
                    callback(null, populate);
                }, function(err) {
                    callback(err);
                });
            }
        ],

        function(err, results) {
            if (err) {
                console.log(err);
            } else {
                res.render('index', { title: 'Express', populate_url: results[0], populate_cities: results[1] });
            }
        })
});

router.post('/populate', function(req, res, next) {
    var list = req.body;
    var qry;
    switch (list.type) {
        case "city":
            qry = 'select SUBURB_ID as id, LABEL as name from suburb where CITY_ID = ' + list.id + '';
            break;
        case "suburb":
            qry = 'select LOCALITY_ID as id, LABEL as name from locality where SUBURB_ID = ' + list.id + '';
            break;
        case "locality":
            qry = 'select PROJECT_ID as id, PROJECT_NAME as name from resi_project where version = "website" AND LOCALITY_ID = ' + list.id + '';
            break;
        // case "project": 
        //     qry = 'select id as id  from listings where project_id = ' + list.id + 'and status = Active;
        //     break;
    }
    console.log(qry);
    db.populate(qry, database1).then(function(results) {
        var populate = populate_dropdowns(results);
        res.send(populate);
    }, function(err) {
        console.log(err);
    });
});

router.post('/Show_Templates', function(req, res, next) {
    var list = req.body;
    //console.log(list);
    var qry = "select id, name from url_categories where status != 'InActive' and object_type_id = " + list[0] + '' ;
    //console.log(qry);
    db.showTable(qry, database2).then(function(results) {
        //console.log(results);
        res.render('tables', { templates: results });
    }, function(err) {
        console.log(err);
    });
})

router.post('/show_url', function(req, res, next) {
    var list = req.body;
    var id = [];
    if (list.city_id) {
        id.push(list.city_id);
    }
    if (list.suburb_id) {
        id.push(list.suburb_id);
    }
    if (list.locality_id) {
        id.push(list.locality_id);
    }
    // if(list.project_id) {
    //     id.push(list.project_id);
    // }
    var qry = "select DISTINCT su.url,ucbm.level,ucbm.sub_url_category_id FROM url_category_breadcrum_mapping as ucbm join seo_urls as su on su.url_category_id = ucbm.sub_url_category_id join seo_url_priority_mapping as supm on supm.url = su.url and supm.object_type_id = " + list.current_object_id + " and priority_id = 2 and ucbm.sub_url_category_id IN (select sub_url_category_id FROM url_category_breadcrum_mapping WHERE url_category_id = " + list.url_category_id + " and url_category_id != sub_url_category_id) and su.object_id IN (" + id.join(",") + ") and su.is_live = 1 and ucbm.url_category_id = " + list.url_category_id + " order by ucbm.level, ucbm.url_order;";
    db.showTable(qry, database2).then(function(results) {
        var table = [];
        var x = 0;
        var y = 0;
        for (var i in results) {
            if (x != results[i].level) {
                x = results[i].level;
                table[x] = [];
                y = 0;
            }
            table[x][y] = {};
            table[x][y]["url"] = results[i].url;
            table[x][y]["sub_url_category_id"] = results[i].sub_url_category_id;
            y++;
        }
        console.log(table);
        res.render('url', { url_table: table });
    }, function(err) {
        console.log(err);
    });
});

router.post('/insert', function(req, res, next) {
    var list = req.body;
    var qry = "insert into url_category_breadcrum_mapping (url_category_id, sub_url_category_id,level, url_order) values (" + list[0] + "," + list[1] + "," + list[2] + "," + list[3] + ")";
    db.insertQuery(qry, database3, function(err, results) {
        console.log("111");
        if (err) {
            res.status(500).send('wrong input');
            console.log("!!!!!!", err);
        } else {
            res.status(200).send('Successfully inserted');
        }
    })

});

router.post('/delete', function(req, res, next) {
    var list = req.body;
    //console.log(list[0]);
    var str = "";
    for(i=0;i<list.length;i++){
        if(i!=0){
            str+=",";
        }
        str += "(" +list[i].id+ "," +list[i].sub_url_id+ ")";
    }
    var qry = "delete from url_category_breadcrum_mapping where (url_category_id, sub_url_category_id) IN (" + str + ")";
    db.deleteQuery(qry, database3, function(err, results) {
        if (err) {
            res.status(500).send('wrong input');
            console.log("!!!!!!", err);
        } else {
            res.status(200).send('Successfully deleted');
            //console.log("query executed")
        }
    })
});

module.exports = router;