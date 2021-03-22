const users = require('../controllers/user.controller');

module.exports = function(app) {

    app.route('/users/register')
        .post(users.createUser);

    app.route('/users/login')
        .post(users.loginUser);

    app.route('/users/logout')
        .post(users.logoutUser);

    app.route('/users/:id')
        .get(users.getUser);
        //.patch(users.updateUser);

    app.route('/users/:id/image')
        .get(users.getUserImage);
        .put(users.setUserImage);
        .delete(users.deleteUserImage);

};