var mysql = require('mysql')

var db={
	connect:function(){
	
	/* 
		var conn = mysql.createConnection({
		    host: 'localhost',
		    user: 'root',
		    password: 'root',
		    database:'test',
		    port: 3306
		});*/
		var conn = mysql.createConnection({
		    host: 'db4free.net',
		    user: 'lovewebgames',
		    password: 'qwerasdfzxcv',
		    database:'lovewebgames',
		    port: 3306
		});
		conn.connect();
		return conn;
	}
}

/*
conn.query('select * from users', function(err, rows, fields) {
    if (err) throw err;
    console.log(rows)
    console.log('The solution is: ', rows[0].name);
});
conn.end();
 */
module.exports = db;