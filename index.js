let express = require('express');
let multer = require("multer");
let app = express();
let cookieParser = require('cookie-parser');
let admin = require('./admin');
/**
 * указание папки с файлами отображения для express
 */
app.use(express.static('public'));
/**
 * шаблонизатор
 */
app.set('view engine', 'pug');
/**
 * модуль mysql
 */
let mysql = require('mysql');

let con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bakery_db'
});
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
/**
 * экспресс 
 */
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(multer({ dest: "img" }).single("filedata"));
let upload = multer({ dest: "img" });
app.use(express.static(__dirname));

/**
 * nodemailer
 */
const nodemailer = require('nodemailer');
/**
 * настройки прослушиваия порта
 */
app.listen(3000, function() {
    console.log('node on 3000');
});
app.use(function(req, res, next) {
    if (req.originalUrl == '/admin' || req.originalUrl == '/admin-order') {
        admin(req, res, con, next);
    } else {
        next();
    }
});


app.get('/shop', function(req, res) {
    con.query(
        'SELECT * FROM products',
        function(error, result) {
            if (error) throw error;
            let products = {};
            for (let i = 0; i < result.length; i++) {
                products[result[i]['id']] = result[i];
            }
            res.render('shop', {
                products: JSON.parse(JSON.stringify(products))
            });
        }
    );
});

app.get('/cat', function(req, res) {

    let catId = req.query.id;

    let cat = new Promise(function(resolve, reject) {
        con.query(
            'SELECT * FROM category WHERE id=' + catId,
            function(error, result) {
                if (error) reject(error);
                resolve(result);
            });
    });

    let products = new Promise(function(resolve, reject) {
        con.query(
            'SELECT * FROM products WHERE category=' + catId,
            function(error, result) {
                if (error) reject(error);
                resolve(result);
            });
    });

    Promise.all([cat, products]).then(function(value) {
        res.render('cat', {
            cat: JSON.parse(JSON.stringify(value[0])),
            products: JSON.parse(JSON.stringify(value[1])),
        })

    })

});

app.get('/product', function(req, res) {
    con.query('SELECT * FROM products WHERE id=' + req.query.id,
        function(error, result, fields) {
            if (error) throw error;
            res.render('product', {
                products: JSON.parse(JSON.stringify(result))
            });
        });
});

app.get('/order', function(req, res) {
    res.render('order');
})
app.get('/', function(req, res) {
    res.render('main');
});
app.get('/aboutUs', function(req, res) {
    res.render('aboutUs');
});
app.get('/contacts', function(req, res) {
    res.render('contacts');
});
app.get('/menu', function(req, res) {
    res.render('menu');
});

app.post('/get-category-list',
    function(req, res) {
        //console.log(req.body);
        con.query('SELECT * FROM category',
            function(error, result, fields) {
                if (error) throw error;
                res.json(result);
            });
    })
app.post('/get-products-info',
    function(req, res) {
        console.log(req.body.key);
        if (req.body.key.length != 0) {
            con.query('SELECT id,name,cost FROM products WHERE id IN (' + req.body.key.join(',') + ')',
                function(error, result, fields) {
                    if (error) throw error;
                    let products = {};
                    for (let i = 0; i < result.length; i++) {
                        products[result[i]['id']] = result[i]
                    }
                    console.log(products);
                    res.json(products);
                });
        } else {
            res.send('0');
        }
    });

app.post('/finish-order', function(req, res) {
    console.log(req.body);
    if (req.body.key.length != 0) {
        let key = Object.keys(req.body.key);
        con.query(
            'SELECT id,name,cost FROM products WHERE id IN (' + key.join(',') + ')',
            function(error, result, fields) {
                if (error) throw error;
                console.log(result);
                sendMail(req.body, result).catch(console.error);
                saveOrder(req.body, result);
                res.send('1');
            });
    } else {
        res.send('0');
    }

});

app.get('/admin', function(req, res) {
    res.render('admin', {});
});
app.get('/login', function(req, res) {
    res.render('login', {});

});

app.post('/login', function(req, res) {
    console.log('=======================');
    console.log(req.body);
    console.log(req.body.login);
    console.log(req.body.password);
    console.log('=======================');
    con.query(
        'SELECT * FROM user WHERE login="' + req.body.login + '" and password="' + req.body.password + '"',
        function(error, result) {
            if (error) reject(error);
            console.log(result);
            console.log(result.length);
            if (result.length == 0) {
                console.log('Ошибка! Пользователь не найден');
                res.redirect('/login');
            } else {
                result = JSON.parse(JSON.stringify(result));
                let hash = makeHash(32);
                res.cookie('hash', hash);
                res.cookie('id', result[0]['id']);
                /**
                 * write hash to db
                 */
                sql = "UPDATE user  SET hash='" + hash + "' WHERE id=" + result[0]['id'];
                con.query(sql, function(error, resultQuery) {
                    if (error) throw error;
                    res.redirect('/admin')
                });


            };
        });
});

app.get('/admin-order', function(req, res) {
    con.query(`SELECT 
        shop_order.id as id,
        shop_order.user_id as user_id,
        shop_order.products_id as products_id,
        shop_order.products_cost as products_cost,
        shop_order.products_amount as products_amount,
        shop_order.total as total,
        from_unixtime(date,"%Y-%m-%d %h:%m") as human_date,
        user_info.user_name as user,
        user_info.user_phone as phone,
        user_info.address as address
    FROM 
        shop_order
    LEFT JOIN	
        user_info
    ON shop_order.user_id = user_info.id ORDER BY id DESC`,
        function(error, result, fields) {
            if (error) throw error;
            res.render('admin-order', {
                order: JSON.parse(JSON.stringify(result))
            });
        });
});
app.get('/deleteProduct', function(req, res) {
    let prodId = req.query.id;
    con.query('DELETE FROM products WHERE id=' + prodId, function(error, result) {
        if (error) throw error;
        res.redirect('/admin-products')
    })
});
app.get('/admin-products', function(req, res) {
    con.query(
        'SELECT * FROM products',
        function(error, result) {
            if (error) throw error;
            let products = {};
            for (let i = 0; i < result.length; i++) {
                products[result[i]['id']] = result[i];
            }
            res.render('admin-products', {
                products: JSON.parse(JSON.stringify(products))
            });
        }
    );
});
app.get('/deleteCat', function(req, res) {
    let catId = req.query.id;
    con.query('DELETE FROM category WHERE id=' + catId, function(error, result) {
        if (error) throw error;
        res.redirect('/admin-cat')
    })
});

app.get('/admin-cat', function(req, res) {
    con.query(
        'SELECT * FROM category',
        function(error, result) {
            if (error) throw error;
            let categories = {};
            for (let i = 0; i < result.length; i++) {
                categories[result[i]['id']] = result[i];
            }
            res.render('admin-cat', {
                categories: JSON.parse(JSON.stringify(categories))
            });
        }
    );

});
app.get('/addCat', function(req, res) {
    con.query('SELECT * FROM category', function(error, result) {
        if (error) throw error;
        let categories = {};
        for (let i = 0; i < result.length; i++) {
            categories[result[i]['id']] = result[i];
        }
        res.render('admin-addProduct', {
            categories: JSON.parse(JSON.stringify(result))
        });
    })
    res.render('admin-addCat');
});

app.get('/add-product', function(req, res) {
    con.query('SELECT * FROM category', function(error, result) {
        if (error) throw error;
        let categories = {};
        for (let i = 0; i < result.length; i++) {
            categories[result[i]['id']] = result[i];
        }
        res.render('admin-addProduct', {
            categories: JSON.parse(JSON.stringify(result))
        });
    })
});
app.post('/upload', upload.single("filedata"), function(req, res) {
    let sql;
    let catId = 0;
    con.query('SELECT id FROM category WHERE category ="' + req.body.productCat + '"'),
        function(error, result) {
            catId = result;
            console.log(catId)
        }
    sql = "INSERT INTO products (name, description, cost, image, category) VALUES ('" + req.body.productName + "','" + req.body.productDescription + "','" + req.body.productCost + "','" + req.body.filedata + "','" + catId + "')";
    con.query(sql, function(error, result) {
        if (error) throw error;
        console.log('Файл записан');
    })
});
app.post('/uploadCat', function(req, res) {
    let sql;
    sql = "INSERT INTO category (category) VALUES ('" + req.body.catName + "')";
    con.query(sql, function(error, result) {
        if (error) throw error;
        console.log('Добавлена категория');
    })
});


function saveOrder(data, result) {
    //data - user
    //result - product
    let sql;
    sql = "INSERT INTO user_info (user_name, user_phone, user_email, address) VALUES ('" + data.username + "','" + data.phone + "','" + data.email + "','" + data.address + "')";
    con.query(sql, function(error, resultQuery) {
        if (error) throw error;
        let userId = resultQuery.insertId;
        date = new Date() / 1000;
        for (let i = 0; i < result.length; i++) {
            sql = "INSERT INTO shop_order (date, user_id, products_id, products_cost, products_amount, total) VALUES (" + date + "," + userId + "," + result[i]['id'] + "," + result[i]['cost'] + "," + data.key[result[i]['id']] + "," + data.key[result[i]['id']] * result[i]['cost'] + ")";
            con.query(sql, function(error, resultQuery) {
                if (error) throw error;
                console.log('1product savd1');
            });
        }
    })
}

async function sendMail(data, result) {
    let res = '<h2>Заказ в пекарне "Хлебничная"';
    let total = 0;
    for (let i = 0; i < result.length; i++) {
        res += `<p>${result[i]['name']} х ${data.key[result[i]['id']]} - ${result[i]['cost'] * data.key[result[i]['id']]}р.</p>`;
        total += result[i]['cost'] * data.key[result[i]['id']];
    }
    console.log(res);
    res += '<hr>';
    res += `Итого: ${total}р.`;
    res += '<hr>';
    res += `Телефон: ${data.phone}`;
    res += '<hr>';
    res += `Имя: ${data.username}`;
    res += '<hr>';
    res += `E-mail: ${data.address}`;

    /**
     * test
     */
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });

    let mailOption = {
        from: `<coka.yoka@mail.ru>`,
        to: "suvorov.ilya-8991@mail.ru," + data.email,
        subjects: 'Заказ в пекарне "Хлебничная"',
        text: 'Упр. письмо',
        html: res
    };

    let info = await transporter.sendMail(mailOption);
    console.log("Сообщение отправлено: %s", info.messageId);
    console.log("Сообщение отправлено: %s", nodemailer.getTestMessageUrl(info));
    return true;
}

function makeHash(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}