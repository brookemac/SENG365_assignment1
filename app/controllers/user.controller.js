const users = require('../models/user.model');



exports.createUser = async function(req, res) {

    console.log('Request to create a new user');

    const first_name = req.body.firstName;
    const last_name = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;

    try {
        const result = await users.createUser(first_name, last_name, email, password);
        
        if (result === 400) {
            res.status(400)
                .send("Bad request")
        } else {        
        res.status(201)
            .send(result);
        }
        
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

        console.log(result)

        if (result === 400) {
            res.status(400)
                .send("Bad Request")
        } else if (result === 401) {
            res.status(401)
                .send("Unauthorized")
        } else if (result === 403) {
            res.status(403)
                .send("Forbidden")
        } else if (result === 404) {
            res.status(403)
                .send("Bad")
        
        } else {
            res.status(200)
                .send("Ok");
        }
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

        if (result === 401) {
            res.status(401)
                .send("Unauthorized")
        } else {
            res.status(200)
                .send('Ok');
        }
    } catch (err) {
        console.log(err);
        res.status(500)
            .send("Internal Server Error");
    }
};


exports.getUser = async function(req, res) {
    console.log('Request to get a user');

    const auth_token = req.header("X-Authorization");
    const id = req.params.id;

    try {
        const result = await users.getUser(id, auth_token);
        if (result === 404) {
            res.status(404)
                .send("Not Found")
        } else {
            res.status(200)
                .send(result);
        }
    } catch (err) {
        console.log(err);
        res.status(500)
            .send("Internal Server Error");
    }
};


exports.updateUser = async function(req, res) {
    console.log('Request to update user');

    const auth_token = req.header("X-Authorization");
    const id = req.params.id;
    const first_name = req.body.firstName;
    const last_name = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    const current_password = req.body.currentPassword;


    try {
        const result = await users.updateUser(id, first_name, last_name, email, password, current_password, auth_token);
        
        if (result === 400) {
            res.status(400)
                .send("Bad Request")
        } else if (result === 401) {
            res.status(401)
                .send("Unauthorized")
        } else if (result === 403) {
            res.status(403)
                .send("Forbidden")
        } else {
            res.status(200)
                .send("Ok");
        }
    } catch (err) {
        console.log(err);
        res.status(500)
            .send("Internal Server Error");
    }
};


exports.getUserImage = async function(req, res) {
    console.log('Request to get user image');

    const id = req.params.id;

    try {
        const result = await users.getUserImage(id);

        if (result === 404) {
            res.status(404)
                .send("Not Found")
        } else {
            res.status(200)
                .contentType(result.mimeType)
                .send(result.image);
        }
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
        
        if (result === 400) {
            res.status(400)
                .send("Bad Request")
        } else if (result === 401) {
            res.status(401)
                .send("Unauthorized")
        } else if (result === 403) {
            res.status(403)
                .send("Forbidden")
        } else if (result === 404) {
            res.status(404)
                .send("Not Found")
        } else if (result === 200) {
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
        if (result === 401) {
            res.status(401)
                .send("Unauthorized")
        } else if (result === 403) {
            res.status(403)
                .send("Forbidden")
        } else if (result === 404) {
            res.status(404)
                .send("Not Found")
        } else {
            res.status(200)
                .send('Ok');
        }
    } catch (err) {
        console.log(err);
        res.status(500)
            .send("Internal Server Error");
    }
};