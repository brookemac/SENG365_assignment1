const events = require('../controllers/event.controller');

module.exports = function(app) {

    app.route('/events')
        .get(events.viewEvents)
        //.post(events.createEvent);

    //app.route('/events/:id')
        //.get(events.viewSingleEvent)
        //.patch(events.editEvent)
        //.delete(events.deleteEvent)
    
    //app.route('/events/categories')
        //.get(events.getEventCategories) //need to add this in controller

    //add event photos
    //add event attendees
};