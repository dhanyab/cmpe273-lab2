var connect = require('connect');
var login = require('./login');

var app = connect();

app.use(connect.json()); // Parse JSON request body into `request.body`
app.use(connect.urlencoded()); // Parse form in request body into `request.body`
app.use(connect.cookieParser()); // Parse cookies in the request headers into `request.cookies`
app.use(connect.query()); // Parse query string into `request.query`

app.use('/', main);

function main(request, response, next) {
	switch (request.method) {
		case 'GET': get(request, response); break;
		case 'POST': post(request, response); break;
		case 'DELETE': del(request, response); break;
		case 'PUT': put(request, response); break;
	}
};

function get(request, response) {
	var cookies = request.cookies;
	console.log(cookies);
	if ('session_id' in cookies) {
		var sid = cookies['session_id'];
		if ( login.isLoggedIn(sid) ) {
			response.setHeader('Set-Cookie', 'session_id=' + sid);
			response.setHeader("content-type", "text/html");
			response.end(login.hello(sid));	
		} else {
			response.end("Invalid session_id! Please login again\n");
		}
	} else {
		response.end("Please login via HTTP POST\n");
	}
};

function post(request, response) {
	var cookies = request.cookies;
	console.log(cookies);
	var name = request.body.name;
	var email = request.body.email;
	var sid = cookies['session_id'];

	if(name!="")
	{
		var newSessionId = login.login(name,email);
		cookies['session_id'] = newSessionId;
		response.cookie = cookies;
                response.setHeader('Set-Cookie', 'session_id=' + newSessionId);
		response.setHeader("content-type", "text/html");
		response.end(login.hello(newSessionId));
	}
	else
	{
	response.end("Please enter name!");

	}
};

function del(request, response) {
//	console.log("DELETE:: Logout from the server");
	var cookies = request.cookies;
	var sid = cookies['session_id'];
	if (login.isLoggedIn(sid) ) 
	{
        console.log("DELETE:: Logout from the server");
	login.logout(sid);
  	response.setHeader("content-type", "text/html");
	response.end('Logged out from the server\n');
}
else
{
response.end("invalid session id!\n")
}
};

function put(request, response) {
	console.log("PUT:: Re-generate new seesion_id for the same user");
	var cookies = request.cookies;
        console.log(cookies);
        var sid = cookies['session_id'];
	console.log("sid is " + sid);
	var name = login.getname(sid);
	var email = login.getemail(sid);
	login.logout(sid);
	console.log("Removed the old id and creating new one...");	
        if(name!="")
        {
        	var newSessionId = login.login(name,email);
                cookies['session_id'] = newSessionId;
        	response.cookie = cookies;
                response.setHeader("content-type", "text/html");
		response.setHeader('Set-Cookie', 'session_id=' + newSessionId);
        	response.end("Re-freshed session id\n" +login.hello(newSessionId));
        }
        else
        {
        	response.end("Please enter name!");

        }
};

app.listen(8000);

console.log("Node.JS server running at 8000...");

