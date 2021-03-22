const db = require('../../config/db');
var fs = require('mz/fs');

const imagePath = './storage/images/';

//note: make the password hash somehow?
exports.createUser = async function(first_name, last_name, email, password) {
    console.log(`Request to create a new user for the database`);

    const conn = await db.getPool().getConnection();

    const queryUser = 'SELECT * FROM user WHERE email = ?';
    const [user] = await conn.query(queryUser, [email]);

    if (!email.includes('@') || user.length !== 0 || password === undefined || password === "") {
        conn.release();
        return 400;
    } else {
        const query = 'INSERT INTO user (first_name, last_name, email, password) VALUES (?, ?, ?, ?)';
        const [result] = await conn.query(query, [first_name, last_name, email, password]);
        conn.release();
        return {id: result.insertId};
    }
};


exports.loginUser = async function(email, password) {
    console.log(`Request to log in user from the database`);

    const conn = await db.getPool().getConnection();

    const queryUser = 'SELECT * FROM user WHERE user.email = ?';
    const [user] = await conn.query(queryUser, [email]);

    if (email === undefined || password === undefined || user.length === 0 || password.localeCompare(user[0].password) !== 0) {
        conn.release();
        return 400;
    } else {
        const user_id = user[0].id;
        const token = Math.random().toString(36).substr(2);

        const addTokenQuery = 'UPDATE user SET auth_token = ? WHERE id = ?';
        const result = conn.query(addTokenQuery, [token, user_id]);
        conn.release();

        return {id: user_id, token: token};
    }
};


//it's not selecting the user and not setting it to null
exports.logoutUser = async function(auth_token) {

    console.log(`Request to log out user from the database`);

    const conn = await db.getPool().getConnection();

    const queryUser = 'SELECT * FROM user WHERE user.auth_token = ?';
    const [user] = await conn.query(queryUser, [auth_token]);

    console.log(user);

    if (user.length === 0) {
        conn.release();
        return 401;
    } else {
        const user_id = user[0].id;
        const queryToken = 'UPDATE user SET auth_token = NULL WHERE id = ?';
        const result = conn.query(queryToken, [user_id]);
        conn.release();
        return 200;
    }
};


exports.getUser = async function(user_id, auth_token) {
    console.log(`Request to get user ${user_id} from the database`);

    const conn = await db.getPool().getConnection();

    const queryUser = 'SELECT first_name, last_name, email, auth_token FROM user WHERE user.id = ?';
    const [user] = await conn.query(queryUser, [user_id]);
    conn.release();

    console.log(auth_token);

    console.log(user[0].auth_token);


    if (user.length === 0) {
        return 404;
    } else if (user[0].auth_token === auth_token) {
        return {first_name: user[0].first_name, last_name: user[0].last_name, email: user[0].email};
    } else {
        return {first_name: user[0].first_name, last_name: user[0].last_name};
    }
};

/*
exports.updateUser = async function(user_id, first_name, last_name, email, password, current_password, auth_token) {
    console.log(`Request to update user ${user_id} from the database`);

    const conn = await db.getPool().getConnection();

    const queryUser = 'SELECT * FROM user WHERE id = ?';
    const [user] = await conn.query(queryUser, [user_id]);

    const requestingQuery = 'SELECT * FROM user WHERE auth_token = ?';
    const [userRequesting] = await conn.query(requestingQuery, [auth_token]);

    const emailQuery = 'SELECT * FROM user WHERE email = ?';
    const [userEmail] = await conn.query(emailQuery, [email]);

    let first = true;
    let updateQuery = 'UPDATE user SET';
    let addToQuery = function (first, query, attr, val) {
        if (val !== undefined) {
            if (first) {
                first = false;
            } else {
                query += ',';
            }
            query += ' ' + attr + ' = "' + val + '"';
        }
        return [first, query];
    };
    [first, updateQuery] = addToQuery(first, updateQuery, 'first_name', first_name);
    [first, updateQuery] = addToQuery(first, updateQuery, 'last_name', last_name);
    [first, updateQuery] = addToQuery(first, updateQuery, 'email', email);
    updateQuery += ' WHERE user.id = ?';

    if ((email !== undefined && !email.includes('@')) || user.length === 0 || first) {
        conn.release();
        return 400; // Bad request
    } else if (userRequesting.length === 0 || (password !== undefined && password !== currentPassword && !(await passwords.compare(currentPassword, user[0].password)))) {
        conn.release();
        return 401; // Unauthorized
    } else if ((userWithEmail.length !== 0 && userWithEmail[0].user_id !== userId) || user[0].auth_token !== userRequesting[0].auth_token) {
        conn.release();
        return 403; // Forbidden
    } else {
        const [result] = await conn.query(updateQuery, [userId]);
        conn.release();
        return {userId: result.insertId};
    }
};
*/

exports.getUserImage = async function(id) {
    console.log(`Request to get user ${id} image from the database`)

    const conn = await db.getPool().getConnection();

    const query = 'SELECT image_filename FROM user where id = ?';
    const [result] = await conn.query(query, [id]);
    conn.release();


    if (result.length === 0) {
        return 404;
    } else {
        const filename = result[0].image_filename;
        console.log(filename);

        console.log(imagePath + filename);

        if (await fs.exists(imagePath + filename)) {
            console.log("yas")
            const readFile = await fs.readFile(imagePath + filename);

            const getFileType = getFileType(filename);
            const imageType = 'image/';
            if (getFileType === "jpg") {
                type = "jpeg";
            }
            imageType += type;

            return {readFile, imageType};
        } else {
            return 404;
        }

    }
};

exports.setUserPhoto = async function(id, auth_token, content_type, image) {
    console.log(`Request to set image for user ${id}`);

    const conn = await db.getPool().getConnection();

    const userQuery = 'SELECT * FROM user WHERE id = ?';
    const [user] = await conn.query(userQuery, [id]);

    const requestingQuery = 'SELECT * FROM user WHERE auth_token = ?';
    const [userRequesting] = await conn.query(requestingQuery, [auth_token]);

    conn.release();

    if (user.length === 0) {
        return 404;
    } else if (userRequesting.length === 0) {
        return 401;
    } else if (user[0].id !== userRequesting[0].id) {
        return 403;
    } else if (content_type !== "image/jpeg" && content_type !== "image/png" && content_type !== "image/gif") {
        return 400;
    } else {
        let imageType = '.' + content_type.slice(6);
        console.log(imageType);
        let filename = "user_" + id + imageType;
        fs.writeFile(imagePath + filename, image);

        const conn2 = await db.getPool().getConnection();
        const query = 'UPDATE user SET image_filename = ? WHERE id = ?';
        const [result] = await conn2.query(query, [filename, id]);
        conn2.release();

        if (user[0].photo_filename === null) {
            return 201;
        } else {
            return 200;
        }
    }
};

exports.deleteUserImage = async function(id, auth_token) {
    console.log(`Request to delete photo for user ${id}`);

    const conn = await db.getPool().getConnection();

    const userQuery = 'SELECT * FROM user WHERE id = ?';
    const [user] = await conn.query(userQuery, [id]);
    const requestingQuery = 'SELECT * FROM user WHERE auth_token = ?';
    const [userRequesting] = await conn.query(requestingQuery, [auth_token]);

    conn.release();

    if (user.length === 0) {
        return 404;
    } else if (userRequesting.length === 0) {
        return 401;
    } else if (user[0].user_id !== userRequesting[0].id) {
        return 403;
    } else {
        const conn2 = await db.getPool().getConnection();
        const query = 'UPDATE user SET image_filename = NULL WHERE id = ?';
        const [result] = await conn2.query(query, [id]);
        conn2.release();
        return 200;
    }
};