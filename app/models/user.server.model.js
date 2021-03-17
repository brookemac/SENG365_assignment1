const db = require('../../config/db');

exports.getAll = async function(){
    
    console.log(`Request to get all events from the database...`);

    const conn = await db.getPool().getConnection();
    const query = 'select * from event';
    const [rows] = await conn.query(query);
    conn.release();
    return rows;
};

exports.getOne = async function(id){
    
    console.log(`Request to get event ${id} from the database...`)

    const conn = await db.getPool().getConnection();
    const query = 'select * from event where id = ?';
    const [rows] = await conn.query(query, [id]);
    conn.release();
    return rows;
};

exports.insert = async function(title, description, date, image_filename, is_online, url, venue, capacity, requires_attendance_control, fee, organizer_id){
    
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