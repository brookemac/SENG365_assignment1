const users = require('../controllers/user.server.controller');

module.exports = function(app) {

    app.route('/events')
        .get(users.list)
        .post(users.create);

    app.route('/events/:id')
        .get(users.read)
        .patch(users.update)
        .delete(users.delete)
    
    app.route('/events/categories')
        .get(users.list)
};