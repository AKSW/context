var captchapng = require('captchapng');

// export index
exports.captcha = {
    path: '/api/captcha',
    method: 'get',
    returns: function(req, res, next) {
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
    }
};

// export index
exports.checkCaptcha = {
    path: '/api/captcha',
    method: 'post',
    returns: function(req, res, next) {
        return res.send({'captcha': req.session.captcha === parseInt(req.body.captcha)});
    }
};
