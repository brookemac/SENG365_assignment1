const user = require('../models/user.server.model');

exports.list = async function(req, res){
    
    console.log('\nRequest to list events...');

    try {
        const result = await user.getAll();
        res.status(200)
            .send(result);

    } catch (err) {
        res.status(500)
            .send(`ERROR getting events ${err}`);
    }
};

exports.create = async function(req, res){
    
    console.log(`\nRequest to create a new event...`);

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
        const result = await user.insert(title, description, date, image_filename, is_online, url, venue, capacity, requires_attendance_control, fee, organizer_id);
        console.log(result)
        res.status(201)
            .send(result)
    } catch (err) {

        res.status(500)
            .send(`ERROR creating event ${title}: ${err}`);
    }
};


exports.read = async function(req, res){
    
    console.log('\nRequest to read a user...');

    const id = req.params.id;

    try {
        const result = await user.getOne(id);

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

exports.update = async function(req, res){
    
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
        const result = await user.alter(id, title, description, date, image_filename, is_online, url, venue, capacity, requires_attendance_control, fee, organizer_id);
        res.status( 200 )
            .send({id: id});

    } catch (err) {
        res.status( 500 )
            .send( `ERROR altering user ${id}: ${ err }` );
    }
};

exports.delete = async function(req, res){
    return null;
};