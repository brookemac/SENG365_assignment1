const db = require('../../config/db');

exports.getEvents = async function(startIndex, count, q, categoryId, organizerId, sortBy){
    
    console.log(`Request to get all events from the database...`);
    
    const conn = await db.getPool().getConnection();

    //Ordering
    let orderByLine = "ORDER BY ";
    switch (sortBy) {
        case 'ALPHABETICAL_ASC': orderByLine += 'title ASC'; break;
        case 'ALPHABETICAL_DESC': orderByLine += 'title DESC'; break;
        case 'DATE_ASC': orderByLine += 'date ASC'; break;
        case 'DATE_DESC': orderByLine += 'date DESC'; break;
        case 'ATTENDEES_ASC': orderByLine += 'attendeesCount ASC'; break;
        case 'ATTENDEES_DESC': orderByLine += 'attendeesCount DESC'; break;
        case 'CAPACITY_ASC': orderByLine += 'capacity ASC'; break;
        case 'CAPACITY_DESC': orderByLine += 'capacity DESC'; break;
    }

    let values = [];
    let categoryIdLine = '';
    let organizerIdLine = '';

    if (categoryId != null) {
        categoryIdLine = 'AND E.category_id = ?';
        values.push(categoryId);
    }
    if (organizerId != null) {
        organizerIdLine = 'AND E.organizer_id = ?';
        values.push(authorId);
    }
    values.push('%' + q + '%');
    values.push(startIndex);
    values.push(count);

    console.log(values);

    const query = "SELECT E.id as eventId, E.title as title, C.category_id as categories, U.first_name as organizerFirstName, U.last_name as organizerLastName, COUNT(A.user_id) as numAcceptedAttendees, E.capacity as capacity " +
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


/*
exports.getOne = async function(id){
    
    console.log(`Request to get event ${id} from the database...`)

    const conn = await db.getPool().getConnection();
    const query = 'select * from event where id = ?';
    const [rows] = await conn.query(query, [id]);
    conn.release();
    return rows;
};

exports.addEvent = async function(title, description, date, image_filename, is_online, url, venue, capacity, requires_attendance_control, fee, organizer_id){
    
    console.log(`Request to insert ${title} into the database...`);

    const conn = await db.getPool().getConnection();
    const query = 'insert into event (title, description, date, image_filename, is_online, url, venue, capacity, requires_attendance_control, fee, organizer_id) values (?)';
    const [result] = await conn.query(query, [title, description, date, image_filename, is_online, url, venue, capacity, requires_attendance_control, fee, organizer_id]);
    conn.release();
    return result;
};

exports.alter = async function(id, title, description, date, image_filename, is_online, url, venue, capacity, requires_attendance_control, fee, organizer_id){
    
    console.log(`Request to update event ${id} from the database...`)

    const conn = await db.getPool().getConnection();
    const query = 'update event set title = ?, description = ?, date = ?, image_filename = ?, is_online = ?, url = ?, venue = ?, capacity = ?, requires_attendance_control = ?, fee = ?, organizer_id = ?  where id = ?';
    const [ result ] = await conn.query( query, [id, title, description, date, image_filename, is_online, url, venue, capacity, requires_attendance_control, fee, organizer_id] );
    conn.release();
    return result;
};

exports.remove = async function(){
 return null;
};
*/