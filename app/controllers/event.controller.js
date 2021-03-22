const events = require('../models/event.model');


exports.viewEvents = async function(req, res){
    
    console.log('\nRequest to list events...');
    
    const startIndex = req.query.startIndex ||0;
    const count = req.query.count || 999999;
    const q = req.query.q || '';
    const category_ids = req.query.category_ids || null;
    const organizerId = req.query.organizerId || null;
    const sortBy = req.query.sortBy || 'DATE_DESC';

    try {
        const result = await events.getEvents(startIndex, count, q, category_ids, organizerId, sortBy);
        res.status(200)
            .send(result);

    } catch (err) {
        res.status(500)
            .send(`ERROR getting events ${err}`);
    }
};

exports.createEvent = async function(req, res) {
    
    console.log(`\nRequest to create a new event...`);

    const auth_token = req.header('x-authorization');
    console.log(auth_token)

    const title = req.body.title;
    const description = req.body.description;
    //var category_ids = req.body.categoryIds;
    const date = req.body.date;
    const image_filename = req.body.image_filename || null;
    const is_online = req.body.isOnline || null;
    const url = req.body.url || null;
    const venue = req.body.venue || null;
    const capacity = req.body.capacity || 9999999;
    const requires_attendance_control = req.body.requiresAttendanceControl || null;
    const fee = req.body.fee || null;

    try {
        //add back categories_id
        const result = await events.addEvent(auth_token, title, description, date, image_filename, is_online, url, venue, capacity, requires_attendance_control, fee);
        res.status(201)
            .send(result)
    } catch (err) {

        res.status(500)
            .send(`ERROR creating event ${title}: ${err}`);
    }
};

exports.viewSingleEvent = async function(req, res) {

    console.log(`\nRequest to view an event...`);

    const id = req.params.id;

    try {
        const result = await events.getOne(id)
        res.status(200)
            .send(result);

    } catch (err) {
        res.status(500)
            .send(`ERROR getting events ${err}`);
    }
};


///patch


exports.deleteEvent = async function(req, res){
    console.log('Request to delete an event');

    const user_token = req.header("X-Authorization");
    const id = req.params.id;

    try {
        const result = await events.deleteEvent(id, user_token);
        res.status(200)
            .send("Ok");

    } catch (err) {
        res.status(500)
            .send("Internal Server Error");
    }
};


exports.getEventCategories = async function(req, res){
    console.log('Request to get all event categories');

    try {
        const result = await events.getEventCategories();
        res.status(200)
            .send(result);
    } catch(err) {
        res.status(500)
            .send("Internal Server Error");
    }
};

exports.getEventImage = async function(req, res) {
    console.log('Request to get event image');

    const id = req.params.id;

    try {
        const result = await events.getEventImage(id);

        res.status(200)
            .send(result);
    } catch(err) {
        res.status(500)
            .send("Internal Server Error");
    }
};

exports.setEventImage = async function(req, res){
    console.log('Request to set event image');

    const id = req.params.id;
    const user_token = req.header("X-Authorization");
    const content_type = req.header("Content-Type");
    const image = req.body;

    try {
        const result = await petitions.setPetitionPhoto(id, user_token, content_type, image);
        if (result === 200) {
            res.status(200)
                .send("Ok");
        } else {
            res.status(201)
                .send("Created");
        }
    } catch( err ) {
        res.status(500)
            .send("Internal Server Error");
    }
};

