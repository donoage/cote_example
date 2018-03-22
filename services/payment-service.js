const cote = require('cote');
const {createApolloFetch} = require('apollo-fetch');
const fetch = createApolloFetch({
    uri: 'http://localhost:5002/graphql',
});

let paymentResponder = new cote.Responder({
    name: 'payment responder',
    key: 'payment'
});

paymentResponder.on('*', console.log);

paymentResponder.on('process', function (req, cb) {
    const query = `
            query($id: String!) {
                user(_id: $id) {
                    _id 
                    balance
                    name
                    pic_url
                }
            }
            `;
    const variables = {id: req.userId};
    fetch({query, variables}).then(res => {
        let user = res.data.user;
        if (user.balance < req.price) return cb({errors: 'Not Enough Balance.'});
        user.balance -= req.price;
        // update user balance
        const query = `
                mutation updateUserBalanceMutation($id: String!, $balance: Int!) {
                    updateUserBalance(_id: $id, balance: $balance) {
                        _id
                        balance
                    }
                }
                `;

        const variables = {
            id: user._id,
            balance: user.balance,
        };

        fetch({query, variables}).then(res => {
            cb(res);
        });
    });
});
