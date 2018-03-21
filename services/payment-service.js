const cote = require('cote'),
    models = require('../models');

let paymentResponder = new cote.Responder({
    name: 'payment responder',
    key: 'payment'
});

paymentResponder.on('*', console.log);

paymentResponder.on('process', function (req, cb) {
    // - user.balance
    // - product quantity then save.
    models.User.get(req.userId, function (err, user) {
        if (user.balance < req.price) return cb(true);

        user.balance -= req.price;

        user.save(cb);
    });
});
