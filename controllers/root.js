// Controller file

module.exports.controller = function(app) {

/**
 * a home page route
 */
    app.get('/', function(req, res) {
      // any logic goes here
	res.render('index')
    });

    app.get('/projects', function(req, res) {
	res.render('launch');
    });
    app.get('/launch', function(req, res) {
	res.render('launch');
    });
    app.get('/profile', function(req, res) {
	res.render('profile');
    });
    app.get('/about', function(req, res) {
	res.render('about');
    });
    app.get('/contact', function(req, res) {
	res.render('contact');
    });


}