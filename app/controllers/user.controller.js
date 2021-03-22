const users = require('../models/user.model');



exports.createUser = async function(req, res) {

    console.log('Request to create a new user');

    const first_name = req.body.firstName;
    const last_name = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;

    try {
        const result = await users.createUser(first_name, last_name, email, password);
        res.status(201)
            .send(result);
    } catch (err) {
        res.status(500)
            .send("Internal Server Error");
    }

};



exports.loginUser = async function(req, res) {
    console.log('Request to log in user');

    const email = req.body.email;
    const password = req.body.password;

    try {
        const result = await users.loginUser(email, password);
        res.status(200)
            .send(result);
    } catch (err) {
        console.log(err);
        res.status(500)
            .send("Internal Server Error");
    }
};


exports.logoutUser = async function(req, res) {

    console.log('Request to log out user');

    const auth_token = req.header("X-Authorization");

    console.log(auth_token);

    try {
        const result = await users.logoutUser(auth_token);
        res.status(200)
            .send('Ok');
    } catch (err) {
        console.log(err);
        res.status(500)
            .send("Internal Server Error");
    }
};


exports.getUser = async function(req, res) {
    console.log('Request to get user');

    const auth_token = req.header("X-Authorization");
    const user_id = req.params.id;

    try {
        const result = await users.getUser(user_id, auth_token);
        res.status(200)
            .send(result);
    } catch (err) {
        console.log(err);
        res.status(500)
            .send("Internal Server Error");
    }
};

/*
exports.updateUser = async function(req, res) {
    console.log('Request to update user');

    const auth_token = req.header("X-Authorization");
    const user_id = req.params.id;
    const first_name = req.body.firstName;
    const last_name = req.body.lasttName;
    const email = req.body.email;
    const password = req.body.password;
    const current_password = req.body.currentPassword;


    try {
        const result = await users.updateUser(user_id, first_name, last_name, email, password, current_password, auth_token);
        res.status(200)
            .send('Ok');
    } catch (err) {
        console.log(err);
        res.status(500)
            .send("Internal Server Error");
    }
};
*/

exports.getUserImage = async function(req, res) {
    console.log('Request to get user image');

    const id = req.params.id;

    try {
        const result = await users.getUserImage(id);
        res.status(200)
            .send(result.image);
    } catch (err) {
        console.log(err);
        res.status(500)
            .send("Internal Server Error");
    }
};

exports.setUserImage = async function(req, res) {
    console.log('Request to set user image');

    const auth_token = req.header("X-Authorization");
    const id = req.params.id;
    const content_type = req.header("Content-Type");
    const image = req.body;

    try {
        const result = await users.setUserImage(id, auth_token, content_type, image);
        if (result === 200) {
            res.status(200)
                .send('Ok');
        } else {
            res.status(201)
                .send('Created');
        }
    } catch (err) {
        console.log(err);
        res.status(500)
            .send("Internal Server Error");
    }
};

exports.deleteUserImage = async function(req, res) {
    console.log('Request to delete user image');

    const auth_token = req.header("X-Authorization");
    const id = req.params.id;

    try {
        const result = await users.deleteUserImage(id, auth_token);
        res.status(200)
            .send('Ok');
    } catch (err) {
        console.log(err);
        res.status(500)
            .send("Internal Server Error");
    }
};