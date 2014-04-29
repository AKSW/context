var captchapng = require('captchapng');

module.exports = function(app) {
    // export captcha image
    app.get('/api/captcha', function(req, res) {
        var captcha = parseInt(Math.random()*9000+1000);
        var p = new captchapng(100, 50, captcha); // width, height, numeric captcha
        p.color(0, 0, 0, 0);  // First color: background
        p.color(80, 80, 80, 255); // Second color: paint

        // store code in session for later verification
        req.session.captcha = captcha;

        // make and send image
        var img = p.getBase64();
        var imgbase64 = new Buffer(img,'base64');
        res.writeHead(200, {'Content-Type': 'image/png'});
        return res.end(imgbase64);
    });
};
