const events = require('../models/event.model');


exports.viewEvents = async function(req, res){
    
    console.log('\nRequest to list events...');
    
    const startIndex = req.query.startIndex;
    const count = req.query.count;
    const q = req.query.q;
    const category_ids = req.query.categoryIds;
    const organizer_id = req.query.organizerId;
    const sortBy = req.query.sortBy || 'DATE_DESC';

    try {
        const result = await events.getEvents(startIndex, count, q, category_ids, organizer_id, sortBy);

        for (var i=0; i<result.length;i++) {

            var categories = result[i].categories
            var split = categories.split(",");
        
            for(var j=0; j<split.length;j++) split[j] = +split[j];
        
            result[i].categories = split
        }

        if (result == 400) {
            res.status(400)
                .send("Bad request");
        } else {
            res.status(200)
                .send(result);
        }


    } catch (err) {
        res.status(500)
            .send(`ERROR getting events ${err}`);
    }
};

exports.createEvent = async function(req, res) {
    
    console.log(`\nRequest to create a new event...`);

    const auth_token = req.header('x-authorization');

    const title = req.body.title;
    const description = req.body.description;
    var category_ids = req.body.categoryIds;
    const date = req.body.date;
    const image_filename = req.body.image_filename || null;
    const is_online = req.body.isOnline || 0;
    const url = req.body.url || null;
    const venue = req.body.venue || null;
    const capacity = req.body.capacity || 9999999;
    const requires_attendance_control = req.body.requiresAttendanceControl || 0;
    const fee = req.body.fee || 0.00;

    try {
        const [result] = await events.addEvent(auth_token, title, description, category_ids, date, image_filename, is_online, url, venue, capacity, requires_attendance_control, fee);

        console.log(result)
        if (result === 400) {
            res.status(400)
                .send("Bad request");
        } else if (result === 401) {
            res.status(401)
                .send("Unauthorized");
        } else {
            res.status(201)
                .send(result)
        }

    } catch (err) {

        console.log(err)

        res.status(500)
            .send(`ERROR creating event ${title}: ${err}`);
    }
};

exports.viewSingleEvent = async function(req, res) {

    console.log(`\nRequest to view an event...`);

    const id = req.params.id;

    try {
        const result = await events.getOne(id)

        console.log(result)

        var categories = result[0].categories
        var split = categories.split(",");
    
        for(var j=0; j<split.length;j++) split[j] = +split[j];
    
        result[0].categories = split

        if (result == 404) {
            res.status(404)
                .send("Not Found");
        } else {
            res.status(200)
                .send(result);
        }

    } catch (err) {
        res.status(500)
            .send(`ERROR getting events ${err}`);
    }
};


exports.updateEvent = async function(req, res){
    console.log('Request to update event');

    const auth_token = req.header("X-Authorization");
    const id = req.params.id;

    const title = req.body.title;
    const description = req.body.description;
    var category_ids = req.body.categoryIds;
    const date = req.body.date;
    const image_filename = req.body.image_filename;
    const is_online = req.body.isOnline;
    const url = req.body.url;
    const venue = req.body.venue;
    const capacity = req.body.capacity;
    const requires_attendance_control = req.body.requiresAttendanceControl;
    const fee = req.body.fee;

    try {
        const result = await events.updateEvent(id, auth_token, title, description, category_ids, date, image_filename, is_online, url, venue, capacity, requires_attendance_control, fee);
        
        if (result === 400) {
            res.status(400)
                .send("Bad request")
        } else if (result === 401){
            res.status(401)
                .send("Unauthorised")
        } else if (result === 403) {
            res.status(403)
                .send("Forbidden")
        } else if (result === 404) {
            res.status(404)
                .send("Not Found")
        } else {
            res.status(200)
            .send("Ok");
        }
    } catch (err) {
        res.status(500)
            .send("Internal Server Error");
    }
};


exports.deleteEvent = async function(req, res){
    console.log('Request to delete an event');

    const user_token = req.header("X-Authorization");
    const id = req.params.id;

    try {
        const result = await events.deleteEvent(id, user_token);

        if (result == 401){
            res.status(401)
                .send("Unauthorised")
        } else if (result == 403) {
            res.status(403)
                .send("Forbidden")
        } else if (result == 404) {
            res.status(404)
                .send("Not Found")
        } else {
            res.status(200)
            .send("Ok");
        }

    } catch (err) {
        console.log(err)
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
        console.log(result)

        if (result === 404) {
            res.status(404)
                .send("Not Found");
        } else {
            res.status(200)
                .contentType(result.mimeType)
                .send(result.image);
        }
    } catch(err) {
        res.status(500)
            .send("Internal Server Error");
    }
};

exports.setEventImage = async function(req, res){
    console.log('Request to set event image');

    const id = req.params.id;
    const auth_token = req.header("X-Authorization");
    const content_type = req.header("Content-Type");
    const image = req.body;

    console.log(image)

    try {
        const result = await events.setEventImage(id, auth_token, content_type, image);
        
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


exports.getEventAttendees = async function(req, res){
    console.log('Request to get event attendees');

    const id = req.params.id;
    const auth_token = req.header("X-authorisation");

    try {
        const result = await events.getEventAttendees(id, auth_token);

        if (result === 404) {

            res.status(404)
                .send("Bad Request");
        } else {
            res.status(200)
                .send(result);
        }
    } catch( err ) {
        res.status(500)
            .send("Internal Server Error");
    }
};


exports.attendEvent = async function(req, res){
    console.log('Request to attend an event');

    const id = req.params.id;
    const auth_token = req.header("X-Authorization");

    try {
        const result = await events.attendEvent(id, auth_token);
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
            res.status(201)
                .send("Created");
        }
    } catch( err ) {
        console.log(err);
        res.status(500)
            .send("Internal Server Error");
    }
};

exports.removeAttendee = async function(req, res){
    console.log('Request to remove attendee from event');

    const id = req.params.id;
    const auth_token = req.header("X-Authorization");

    try {
        const result = await events.removeAttendee(id, auth_token);
        
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
            res.status(201)
                .send("Created");
        }
    } catch( err ) {
        console.log(err);
        res.status(500)
            .send("Internal Server Error");
    }
};


exports.changeStatus = async function(req, res){
    console.log('Request to attend an event');

    const id = req.params.id;
    const user_id = req.params.user_id;
    const auth_token = req.header("X-Authorization");
    const status = req.body.status;

    try {
        const result = await events.changeStatus(id, user_id, auth_token, status);
        
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
        } else {
            res.status(200)
                .send("Ok");
        }
    } catch( err ) {
        console.log(err);
        res.status(500)
            .send("Internal Server Error");
    }
};