const events = require('../controllers/event.controller');

module.exports = function(app) {

    app.route(app.rootUrl + '/events')
        .get(events.viewEvents)
        .post(events.createEvent)
    
    app.route(app.rootUrl + '/events/categories')
        .get(events.getEventCategories)

    app.route(app.rootUrl + '/events/:id')
        .get(events.viewSingleEvent)
        .patch(events.updateEvent)
        .delete(events.deleteEvent)
    
    app.route(app.rootUrl + '/events/:id/image')
        .get(events.getEventImage)
        .put(events.setEventImage)

    app.route(app.rootUrl + '/events/:id/attendees')
        .get(events.getEventAttendees)
        .post(events.attendEvent)
        .delete(events.removeAttendee)
    
    app.route(app.rootUrl + '/events/:id/attendees/:user_id')
        .patch(events.changeStatus)
};