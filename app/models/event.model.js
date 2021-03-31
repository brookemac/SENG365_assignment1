const db = require('../../config/db');
var fs = require('mz/fs');
var mime = require('mime-types');

const imagePath = './storage/images/';



exports.getEvents = async function(startIndex, count, q, category_ids, organizer_id, sortBy){
    
    console.log(`Request to get all events from the database...`);
    
    const conn = await db.getPool().getConnection();

    //base query
    var query = "SELECT E.id as eventId, E.title as title, GROUP_CONCAT(DISTINCT C.category_id) as categories, U.first_name as organizerFirstName, U.last_name as organizerLastName, (SELECT COUNT (*) FROM event_attendees as A WHERE A.attendance_status_id = 1 AND E.id = A.event_id) as numAcceptedAttendees, E.capacity as capacity " +
        "FROM event as E " +
        "LEFT JOIN event_attendees as A on A.event_id = E.id " +
        "INNER JOIN event_category as C on C.event_id = E.id " +
        "INNER JOIN user as U on U.id = E.organizer_id ";
    
    //WHERE
    //not showing all of the category ids when in query
    if (q !== undefined || category_ids !== undefined || organizer_id !== undefined) {
        query += "WHERE";
        if (q !== undefined) {
            query += " (E.title LIKE '%" + q + "%' OR E.description LIKE '%" + q + "%')"; //description
            if (category_ids !== undefined) {
                if (category_ids.length > 1) {
                    query += " AND ("
                    for (var i=0; i<category_ids.length;i++) {
                        query += "C.category_id = " + category_ids[i] + " OR ";
                    }
                    query = query.slice(0, -3);
                    query += ")";
                } else {
                    query += " AND C.category_id = " + category_ids;
                }
            }
            if (organizer_id !== undefined) {
                query += " AND E.organizer_id = " + organizer_id;
            }
        } else if (category_ids !== undefined) {
            if (category_ids.length > 1) {
                query += " AND ("
                for (var i=0; i<category_ids.length;i++) {
                    query += "C.category_id = " + category_ids[i] + " OR ";
                }
                query = query.slice(0, -3);
                query += ")";
            } else {
                query += " AND C.category_id = " + category_ids;
            }
            if (organizer_id !== undefined) {
                query += " AND E.organizer_id = " + organizer_id;
            }
        } else {
            query += " E.organizer_id = " + organizer_id;
        }
    }

    query += " GROUP BY E.id ";


    //ORDER
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
    query += orderByLine;

    //Rows
    if (startIndex !== undefined && count !== undefined) {
        query += " LIMIT " + startIndex + ", " + count;
    } else if (count !== undefined) {
        query += " LIMIT " + count;
    } else if (startIndex !== undefined) {
        query += " LIMIT " + startIndex + ", 999999999999999999";
    }

    console.log(query);

    const [rows] = await conn.query(query);
    conn.release();
    return rows;
};

exports.addEvent = async function(auth_token, title, description, category_ids, date, image_filename, is_online, url, venue, capacity, requires_attendance_control, fee){
    
    console.log(`Request to insert ${title} into the database...`);

    if (title === undefined || description === undefined || category_ids === undefined) {
        return 400;
    } else {

        let currentDate = new Date(Date.now());
        const conn = await db.getPool().getConnection();

        const userQuery = 'SELECT id FROM user WHERE auth_token = ?';
        const [user] = await conn.query(userQuery, [auth_token]);

        if (user.length === 0) {
            conn.release();
            return 401;
        }

        if (currentDate > new Date(date)) {
            conn.release();
            return 400;
        }


        for (var i = 0; i < category_ids.length; i++) {
            console.log(category_ids[i])
            const catQuery = "SELECT id FROM category WHERE id = '" + category_ids[i] + "'";
            const [category] = await conn.query(catQuery, [category_ids[i]]);
            if (category.length === 0) {
                conn.release();
                return 400;
            }
        }

        const user_id = user[0].id;

        const query = 'INSERT INTO event (title, description, date, image_filename, is_online, url, venue, capacity, requires_attendance_control, fee, organizer_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)';
        const [result] = await conn.query(query, [title, description, date, image_filename, is_online, url, venue, capacity, requires_attendance_control, fee, user_id]);

        for (var i = 0; i < category_ids.length; i++) {

            const insertCatQuery = "INSERT INTO event_category (event_id, category_id) VALUES(?, ?)";
            const [category] = await conn.query(insertCatQuery, [result.insertId, category_ids[i]])
        }

        console.log(result)

        conn.release();
        return [result];

    }
};


exports.getOne = async function(id){
    
    console.log(`Request to get event ${id} from the database...`)

    const conn = await db.getPool().getConnection();

    const query = "SELECT E.id as eventId, E.title as title, GROUP_CONCAT(DISTINCT C.category_id) as categories, U.first_name as organizerFirstName, U.last_name as organizerLastName, (SELECT COUNT (*) FROM event_attendees as A WHERE A.attendance_status_id = 1 AND E.id = A.event_id) as numAcceptedAttendees, E.capacity as capacity, " +
    "E.description as description, E.organizer_id as ordanizerId, E.date as date, E.is_online as isOnline, E.url as url, E.venue as venue, E.requires_attendance_control as requiresAttendanceControl, E.fee as fee " +
    "FROM event as E LEFT JOIN event_attendees as A on A.event_id = E.id " +
    "JOIN event_category as C on C.event_id = E.id " +
    "JOIN user as U on U.id = E.organizer_id " +
    "WHERE E.id = ? " +
    "GROUP BY E.id ";

    const [result] = await conn.query(query, [id]);

    console.log(query)
    conn.release();

    if (result.length === 0) {
        return 404;
    } else {
        return result;
    }
    
};


exports.updateEvent = async function(id, auth_token, title, description, category_ids, date, image_filename, is_online, url, venue, capacity, requires_attendance_control, fee){
    console.log("Request to update event in the database");

    const conn = await db.getPool().getConnection();

    const userQuery = 'SELECT id FROM user WHERE auth_token = ?';
    const [user] = await conn.query(userQuery, [auth_token]);

    if (user.length === 0) {
        
        conn.release();
        return 401;
    }

    const eventQuery = 'SELECT * FROM event WHERE id = ?';
    const [event] = await conn.query(eventQuery, [id]);

    if (event.length === 0) {
        conn.release();
        return 404;
    }

    for (var i = 0; i < category_ids.length; i++) {
        const catQuery = "SELECT id FROM category WHERE id = '" + category_ids[i] + "'";
        const [category] = await conn.query(catQuery, [category_ids[i]]);
        if (category.length === 0) {
            conn.release();
            return 400;
        }
    }

    console.log(event[0].date)

    let currentDate = new Date(Date.now());
    const oldDate = new Date(event[0].date);

    if (currentDate > oldDate || (oldDate !== undefined && currentDate > oldDate)) {
        conn.release();
        return 403;
    }

    const user_id = user[0].id

    if (user_id !== event[0].organizer_id) {
        conn.release();
        return 403;
    }

    let first = true;
    let query = 'UPDATE event SET';
    if (title !== undefined) {
        if (first) {
            first = false;
        } else {
            query += ','
        }
        query += ' title = "' + title + '"';
    }
    if (description !== undefined) {
        if (first) {
            first = false;
        } else {
            query += ','
        }
        query += ' description = "' + description + '"';
    }
    if (date !== undefined) {
        if (first) {
            first = false;
        } else {
            query += ','
        }
        query += ' date = "' + new Date(date) + '"';
    }
    if (image_filename !== undefined) {
        if (first) {
            first = false;
        } else {
            query += ','
        }
        query += ' image_filename = "' + image_filename + '"';
    }
    if (is_online !== undefined) {
        if (first) {
            first = false;
        } else {
            query += ','
        }
        query += ' is_online = "' + is_online + '"';
    }
    if (url !== undefined) {
        if (first) {
            first = false;
        } else {
            query += ','
        }
        query += ' url = "' + url + '"';
    }
    if (venue !== undefined) {
        if (first) {
            first = false;
        } else {
            query += ','
        }
        query += ' venue = "' + venue + '"';
    }
    if (capacity !== undefined) {
        if (first) {
            first = false;
        } else {
            query += ','
        }
        query += ' capacity = "' + capacity + '"';
    }
    if (requires_attendance_control !== undefined) {
        if (first) {
            first = false;
        } else {
            query += ','
        }
        query += ' requires_attendance_control = "' + requires_attendance_control + '"';
    }
    if (fee !== undefined) {
        if (first) {
            first = false;
        } else {
            query += ','
        }
        query += ' fee = "' + fee + '"';
    }

    query += ' WHERE id = ?';
    const [result] = await conn.query(query, [id]);
    console.log(result)

    const deleteCatQuery = "DELETE FROM event_category WHERE event_id = ?"
    const [deleteCat] = await conn.query(deleteCatQuery, [id]);
    console.log(deleteCat)

    for (var i = 0; i < category_ids.length; i++) {

        const insertCatQuery = "INSERT INTO event_category (event_id, category_id) VALUES (?, ?)";
        const [category] = await conn.query(insertCatQuery, [id, category_ids[i]])
    }

    

    conn.release();
    return result;

};




exports.deleteEvent = async function(id, auth_token){

    console.log(`Request to delete a event ${id} from database`);

    const conn = await db.getPool().getConnection();

    const userQuery = 'SELECT id FROM user WHERE auth_token = ?';
    const [user] = await conn.query(userQuery, [auth_token]);

    const eventQuery = 'SELECT * FROM event WHERE id = ?';
    const [event] = await conn.query(eventQuery, [id]);

    if (event.length === 0) {
        console.log("a")
        conn.release();
        return 404;
    } else if (user.length === 0) {
        console.log("b")
        conn.release();
        return 401;
    } else if (user[0].id !== event[0].organizer_id) {
        console.log("c")
        conn.release();
        return 403;
    } else {

        console.log("d")


        const catquery = 'DELETE FROM event_category WHERE event_id = ?';
        const [catresult] = await conn.query(catquery, [id]);
        
        
        const eventquery = 'DELETE FROM event WHERE id = ?';
        const [eventresult] = await conn.query(eventquery, [id]);


        console.log(eventresult);
        console.log(catquery);
        conn.release();
        return eventresult;
        
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

    const query = 'SELECT * FROM event where id = ?';
    const [result] = await conn.query(query, [id]);

    conn.release();


    if (result.length === 0) {
        return 404; //Event not found
    } else {
        const filename = result[0].image_filename;
        console.log(imagePath + filename);

        if (await fs.exists(imagePath + filename)) {
            console.log("yas")
            const image = await fs.readFile(imagePath + filename);
            const mimeType = mime.lookup(filename);
            return {image, mimeType};
        } else {
            return 404; //image not found
        }

    }
};

exports.setEventImage = async function(id, auth_token, content_type, image) {
    console.log(`Request to set image for event ${id}`);

    const conn = await db.getPool().getConnection();

    const userQuery = 'SELECT id FROM user WHERE auth_token = ?';
    const [user] = await conn.query(userQuery, [auth_token]);

    const eventQuery = 'SELECT * FROM event WHERE id = ?';
    const [event] = await conn.query(eventQuery, [id]);

    conn.release();

    if (event.length === 0) {
        return 404; //Not Found
    } else if (user.length === 0) {
        return 401; //Unauthorized
    } else if (user[0].id !== event[0].organizer_id) {
        return 403; //Forbidden
    } else if (content_type !== "image/jpeg" && content_type !== "image/png" && content_type !== "image/gif") {
        return 400;
    } else {

        let imageType = '.' + content_type.slice(6);
        let filename = "event_" + id + imageType;
        fs.writeFile(imagePath + filename, image);

        const conn2 = await db.getPool().getConnection();
        const query = 'UPDATE event SET image_filename = ? WHERE id = ?';
        const [result] = await conn2.query(query, [filename, id]);
        console.log(event[0].image_filename)
        conn2.release();

        if (event[0].image_filename === null) {
            return 201;
        } else {
            return result;
        }
    }
};


exports.getEventAttendees = async function(id, auth_token){
    console.log(`Request to get attendees for event ${id}`);

    const conn = await db.getPool().getConnection();
    const eventQuery = 'SELECT * FROM event WHERE id = ?';
    const [event] = await conn.query(eventQuery, [id]);

    if (event.length === 0) {
        conn.release();
        return 404; // Event not Found
    }

    const userQuery = 'SELECT * FROM user where auth_token = ?'
    const [user] = await conn.query(userQuery, [auth_token])

    if (user.length === 0) {
        const user = null
    } else {
        const user = user[0].id
    }

    var whereLine = " WHERE A.event_id = ?"
    if (event[0].organizer_id !== user) {
        whereLine += " AND A.attendance_status_id = 1 "
    } else {
        whereLine += " AND (A.attendance_status_id = 1 OR A.user_id = ?) "
    }

    conn.release();

    const conn2 = await db.getPool().getConnection();
    const query = 'SELECT A.user_id AS attendeeId, S.name as status, U.first_name as firstName, U.last_name as lastName, A.date_of_interest AS dateOfInterest ' +
        'FROM event_attendees as A ' +
        'JOIN user as U ON A.user_id = U.id ' +
        'JOIN attendance_status as S ON A.attendance_status_id = S.id' +
        whereLine +
        'ORDER BY A.date_of_interest';
    
    console.log(query)

    const [result] = await conn2.query(query, [id, user, id]);
    conn2.release();
    return result;
};


exports.attendEvent = async function(id, auth_token){
    console.log(`Request to attend event ${id}`);

    const conn = await db.getPool().getConnection();

    const eventQuery = "SELECT * FROM event WHERE id = ?";
    const [event] = await conn.query(eventQuery, [id]);

    const userQuery = "SELECT id FROM user WHERE auth_token = ?";
    const [user] = await conn.query(userQuery, [auth_token]);

    if (event.length === 0) {
        conn.release();
        return 404;
    } else if (user.length === 0) {
        conn.release();
        return 401;
    } else {
        let user_id = user[0].id;
        let currentDate = new Date(Date.now());

        const alreayAttendingQuery = "SELECT * FROM event_attendees WHERE event_id = ? AND user_id = ?";
        const [alreadyAttending] = await conn.query(alreayAttendingQuery, [id, user_id]);

        if (alreadyAttending.length !== 0 || new Date(event[0].date) < currentDate) {
            conn.release();
            return 403; //Forbidden
        } else {
            const query = "INSERT INTO event_attendees (event_id, user_id, attendance_status_id, date_of_interest) VALUES (?,?,?,?)";
            
            console.log(currentDate instanceof Date)
            var id2 = parseInt(id)
            const [result] = await conn.query(query, [id2, user_id, 1, currentDate]);

            console.log(result)
            conn.release();
            return result;
        }
    }
};


exports.removeAttendee = async function(id, auth_token){
    console.log(`Request to remove attendee from event ${id}`);

    const conn = await db.getPool().getConnection();

    const eventQuery = 'SELECT * FROM event WHERE id = ?';
    const [event] = await conn.query(eventQuery, [id]);

    const userQuery = 'SELECT id FROM user WHERE auth_token = ?';
    const [user] = await conn.query(userQuery, [auth_token]);

    conn.release();

    if (event.length === 0) {
        return 404; // Not Found
    } else if (user.length === 0) {
        return 401; //Unauthorized
    } else {
        let user_id = user[0].user_id;
        let currentDate = new Date(Date.now());

        const conn2 = await db.getPool().getConnection();
        const alreayAttendingQuery = "SELECT * FROM event_attendees WHERE event_id = ? AND user_id = ?";
        const [alreadyAttending] = await conn2.query(alreayAttendingQuery, [id, user_id]);
        conn2.release();

        if (alreadyAttending.length === 0 || new Date(event[0].date) < currentDate || event[0].organizer_id === user_id || alreadyAttending[0].attendance_status_id === 3) {
            return 403; // Forbidden
        } else {
            const conn3 = await db.getPool().getConnection();
            const query = 'DELETE FROM event_attendees WHERE event_id = ? AND user_id = ?';
            const [result] = await conn3.query(query, [id, user_id]);
            conn3.release();
            return result;
        }
    }
};

exports.changeStatus = async function(id, user_id, auth_token, status){
    console.log(`Request to change status of an attendee from event ${id}`);

    const conn = await db.getPool().getConnection();

    const eventQuery = 'SELECT * FROM event WHERE id = ?';
    const [event] = await conn.query(eventQuery, [id]);

    const orangizerUserQuery = 'SELECT id FROM user WHERE auth_token = ?';
    const [organizerUser] = await conn.query(orangizerUserQuery, [auth_token]);

    const userQuery = 'SELECT user_id FROM event_attendees WHERE user_id = ?';
    const [user] = await conn.query(userQuery, [user_id]);

    conn.release();

    if (event.length === 0) {
        return 404; // Not Found
    } else if (user.length === 0) {
        return 401; //Unauthorized
    } else if (organizerUser.length === 0) {
        return 401;
    } else if (orangizerUserQuery[0].id !== event[0].organizer_id) {
        return 403;
    } else if (status !== "accepted" || status !== "pending" || status !== "rejected") {
        return 400; //bad request
    } else {

        var attendance_status_id = null

        if (status === "accepted") {
            attendance_status_id = 1
        } else if (status !== "pending") {
            attendance_status_id = 2
        } else if (status !== "rejected") {
            attendance_status_id = 3
        } else {
            return 400;
        }

        const conn2 = await db.getPool().getConnection();

        const query = "UPDATE event_attendees SET attendance_status_id = ? WHERE user_id = ?"
        const [result] = await conn2.query(query, [attendance_status_id, user_id]);

        conn2.release();
        return result;
    }
};