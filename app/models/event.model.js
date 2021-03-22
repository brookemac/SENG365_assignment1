const db = require('../../config/db');
var fs = require('mz/fs');

const imagePath = './storage/images/';



exports.getEvents = async function(startIndex, count, q, category_ids, organizerId, sortBy){
    
    console.log(`Request to get all events from the database...`);
    
    const conn = await db.getPool().getConnection();

    //Ordering
    let orderByLine = "ORDER BY ";
    switch (sortBy) {
        case 'ALPHABETICAL_ASC': orderByLine += 'title ASC'; break;
        case 'ALPHABETICAL_DESC': orderByLine += 'title DESC'; break;
        case 'DATE_ASC': orderByLine += 'date ASC'; break;
        case 'DATE_DESC': orderByLine += 'date DESC'; break;
        case 'ATTENDEES_ASC': orderByLine += 'numAcceptedAttendees ASC'; break;
        case 'ATTENDEES_DESC': orderByLine += 'numAcceptedAttendees DESC'; break;
        case 'CAPACITY_ASC': orderByLine += 'capacity ASC'; break;
        case 'CAPACITY_DESC': orderByLine += 'capacity DESC'; break;
    }

    let categoryIdLine = '';
    let organizerIdLine = '';

    if (category_ids != null) {
        categoryIdLine = 'AND E.category_id = ?';
    }
    if (organizerId != null) {
        organizerIdLine = 'AND E.organizer_id = ?';
    }

    /*
    categories = "";
    const catQuery = "SELECT category_id FROM event_category where event_id = 1"
    const [catResult] = await conn.query(catQuery);
    categories = catResult;
    console.log(categories);
    */


    const query = "SELECT E.id as eventId, E.title as title, concat('[', GROUP_CONCAT(DISTINCT C.category_id), ']') as categories, U.first_name as organizerFirstName, U.last_name as organizerLastName, COUNT(A.user_id) as numAcceptedAttendees, E.capacity as capacity " +
        "FROM event as E LEFT JOIN event_attendees as A on A.event_id = E.id " +
        "INNER JOIN event_category as C on C.event_id = E.id " + categoryIdLine + " " +
        "INNER JOIN user as U on U.id = E.organizer_id " + organizerIdLine + " " +
        "WHERE attendance_status_id = 1 " +
        "GROUP BY E.id " +
        orderByLine + " ";

    const [rows] = await conn.query(query);
    conn.release();
    return rows;
};

exports.addEvent = async function(auth_token, title, description, date, image_filename, is_online, url, venue, capacity, requires_attendance_control, fee){
    
    console.log(`Request to insert ${title} into the database...`);

    if (title === undefined || description === undefined) {//|| category_ids === undefined) {
        return 400;
    } else {

        const conn = await db.getPool().getConnection();

        const qUser = 'SELECT id FROM user WHERE auth_token = ?';
        const [user] = await conn.query(qUser, [auth_token]);

        if (user.length === 0) {
            conn.release();
            return 401;  
        } else {
            const userId = user[0].id;
        }

        console.log(organizer_id)

        /*

        for (var i = 0; i < category_ids.length; i++) {
            var sql = "SELECT * FROM category WHERE id = '" + category_ids[i] + "'";
            con.query(sql, function(err, result, fields) {
              if (err) {
                throw err;
              }
              if (!result[0]) {
                var sql = "INSERT INTO event_category VALUES('" + category_ids[i] + "')";
                con.query(sql, function(err, result, fields) {
                  if (err) {
                    throw err;
                  }
                });
              }
            });
        }
        */

        let currentDate = new Date(Date.now());

        if (currentDate > new Date(date)) {
            conn.release();
            return 400;
        }

        const query = 'INSERT INTO event (title, description, date, image_filename, is_online, url, venue, capacity, requires_attendance_control, fee, organizer_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)';
        const [result] = await conn.query(query, [title, description, date, image_filename, is_online, url, venue, capacity, requires_attendance_control, fee, userId]);
        conn.release();
        return result;
    }
};


exports.getOne = async function(id){
    
    console.log(`Request to get event ${id} from the database...`)

    const conn = await db.getPool().getConnection();

    const query = "SELECT E.id as eventId, E.title as title, concat('[', GROUP_CONCAT(DISTINCT C.category_id), ']') as categories, U.first_name as organizerFirstName, U.last_name as organizerLastName, COUNT(A.user_id) as numAcceptedAttendees, E.capacity as capacity, " +
    "E.description as description, E.organizer_id as ordanizerId, E.date as date, E.is_online as isOnline, E.url as url, E.venue as venue, E.requires_attendance_control as requiresAttendanceControl, E.fee as fee " +
    "FROM event as E LEFT JOIN event_attendees as A on A.event_id = E.id " +
    "JOIN event_category as C on C.event_id = E.id " +
    "JOIN user as U on U.id = E.organizer_id " +
    "WHERE E.id = ? and attendance_status_id = 1 " +
    "GROUP BY E.id ";

    const [result] = await conn.query(query, [id]);
    conn.release();

    if (result.length === 0) {
        return 404;
    } else {
        return result;
    }
    
};


//update event

exports.deleteEvent = async function(id, auth_token){

    console.log("Request to delete an event from database");

    const conn = await db.getPool().getConnection();

    const userQuery = 'SELECT id FROM user WHERE auth_token = ?';
    const [user] = await conn.query(userQuery, [auth_token]);

    const eventQuery = 'SELECT * FROM  event WHERE id = ?';
    const [event] = await conn.query(eventQuery, [id]);

    conn.release();

    if (event.length === 0) {
        return 404; // Not Found
    } else if (user.length === 0) {
        return 401; // Unauthorised
    } else if (user[0].user_id !== event[0].organizer_id) {
        return 403;
    } else {
        const conn2 = await db.getPool().getConnection();
        const query = 'DELETE FROM event WHERE id = ?; DELETE FROM event_category WHERE event_id = ?';
        const [result] = await conn2.query(query, [id, id]);
        conn2.release();
        return result;
    }
};


exports.getEventCategories = async function(){
    console.log(`Request to get all event categories from database`);

    const conn = await db.getPool().getConnection();
    const query = 'SELECT id AS categoryId, name AS name FROM category';
    const [result] = await conn.query(query);
    conn.release();

    return result;
};


exports.getEventImage = async function(id) {
    console.log(`Request to get the event ${id} image from the database`)

    const conn = await db.getPool().getConnection();

    const query = 'SELECT image_filename FROM event where id = ?';
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
    console.log(`Request to set image for event ${id}`);

    const conn = await db.getPool().getConnection();

    const eventQuery = 'SELECT * FROM event WHERE id = ?';
    const [event] = await conn.query(eventQuery, [id]);

    const userQuery = 'SELECT id FROM user WHERE auth_token = ?';
    const [user] = await conn.query(userQuery, [auth_token]);

    conn.release();

    if (event.length === 0) {
        return 404;
    } else if (user.length === 0) {
        return 401;
    } else if (user[0].id !== event[0].organizer_id) {
        return 403;
    } else if (content_type !== "image/jpeg" && content_type !== "image/png" && content_type !== "image/gif") {
        return 400;
    } else {
        let imageType = '.' + content_type.slice(6);
        console.log(imageType);
        let filename = "event_" + id + imageType;
        fs.writeFile(imagePath + filename, image);

        const conn2 = await db.getPool().getConnection();
        const query = 'UPDATE event SET image_filename = ? WHERE id = ?';
        const [result] = await conn2.query(query, [filename, id]);
        conn2.release();

        if (event[0].image_filename === null) {
            return 201;
        } else {
            return 200;
        }
    }
};