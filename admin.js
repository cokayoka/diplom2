module.exports = function(req, res, con, next) {
    console.log(req.cookies);
    if (req.cookies.hash == undefined || req.cookies.id == undefined) {
        res.redirect('/login');
        return false;
    }
    con.query(
        'SELECT * FROM user WHERE id=' + req.cookies.id + ' and hash="' + req.cookies.hash + '"',
        function(error, result) {
            if (error) reject(error);
            if (result.length == 0) {
                console.log('Ошибка! Пользователь не найден');
                res.redirect('/login');
            } else {
                next();
            }
        });
}