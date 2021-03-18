const events = require('../models/event.model');

exports.viewEvents = async function(req, res){
    
    console.log('\nRequest to list events...');
    
    const startIndex = req.query.startIndex ||0;
    const count = req.query.count || 999999;
    const q = req.query.q || '';
    const categoryId = req.query.categoryId || null;
    const organizerId = req.query.organizerId || null;
    const sortBy = req.query.sortBy || 'DATE_DESC';

    try {
        const result = await events.getEvents(startIndex, count, q, categoryId, organizerId, sortBy);
        res.status(200)
            .send(result);

    } catch (err) {
        res.status(500)
            .send(`ERROR getting events ${err}`);
    }
};



/*
exports.createEvent = async function(req, res){
    
    console.log(`\nRequest to create a new event...`);

    let title = req.body.title;
    let description = req.body.description;
    let date = req.body.date;
    let image_filename = req.body.image_filename;
    let is_online = req.body.is_online;
    let url = req.body.url;
    let venue = req.body.venue;
    let capacity = req.body.capacity;
    let requires_attendance_control = req.body.requires_attendance_control;
    let fee = req.body.fee;
    let organizer_id = req.body.organizer_id;

    try {
        const result = await events.addEvent(title, description, date, image_filename, is_online, url, venue, capacity, requires_attendance_control, fee, organizer_id);
        res.status(201)
            .send(result)
    } catch (err) {

        res.status(500)
            .send(`ERROR creating event ${title}: ${err}`);
    }
};


exports.viewSingleEvent = async function(req, res){
    
    console.log('\nRequest to read a user...');

    const id = req.params.id;

    try {
        const result = await events.getOne(id);

        if(result.length === 0) {
            res.status(400)
                .send('Invalid Id');
        }
        else {
            res.status(200)
                .send(result);
        }
    } catch (err) {
        res.status(500)
            .send(`ERROR reading event ${id}: ${err}`);
    }
};

exports.editEvent = async function(req, res){
    
    console.log( '\nRequest to update an event...' );

    const id = req.params.id;
    const title = req.body.title;
    const description = req.body.description;
    const date = req.body.date;
    const image_filename = req.body.image_filename;
    const is_online = req.body.is_online;
    const url = req.body.url;
    const venue = req.body.venue;
    const capacity = req.body.capacity;
    const requires_attendance_control = req.body.requires_attendance_control;
    const fee = req.body.fee;
    const organizer_id = req.body.organizer_id;

    try {
        const result = await events.alter(id, title, description, date, image_filename, is_online, url, venue, capacity, requires_attendance_control, fee, organizer_id);
        res.status( 200 )
            .send({id: id});

    } catch (err) {
        res.status( 500 )
            .send( `ERROR altering user ${id}: ${ err }` );
    }
};

exports.deleteEvent = async function(req, res){
    return null;
};
*/