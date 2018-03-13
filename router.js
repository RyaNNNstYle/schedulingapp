var fs = require('fs');
var url = require("url");
var path = require('path');
var request = require('request');

var postsQueue = [];

var handler = function (req, res) {
    if(req.method == 'GET') {
        var dir = "/client";
        var uri = url.parse(req.url).pathname;
        
        if (uri == "/") {
            uri = "index.html";
        }
        
        var filename = path.join(dir, uri);

        fs.readFile(__dirname + filename, function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading ' + uri);
            }

            res.setHeader('content-type', contentType(path.extname(filename)));
            res.writeHead(200);
            res.end(data);
        });
    }
    else if(req.method == 'POST') {
        var uri = url.parse(req.url).pathname;

        if(uri == '/schedule') {
            fullData = '';

            req.on('data', function(chunk) {
                fullData += chunk.toString()
            })
    
            req.on('end', function() {
                fullData = JSON.parse(fullData);
                var responseMessage = "Posted";
                
                const postTextOptions = {  
                  method: 'POST',
                  uri: 'https://graph.facebook.com/v2.8/' + fullData.UserID + '/feed',
                  qs: {
                    access_token: fullData.AccessToken,
                    message: fullData.Url
                  }
                };

                if(fullData.Autoschedule == true) {
                    var postDate = new Date();

                    if(postDate.getHours() <= 9) {
                        postDate.setHours(9);
                        postDate.setMinutes(0);
                    }
                    else if(postDate.getHours() <= 13) {
                        postDate.setHours(13);
                        postDate.setMinutes(0);
                    }
                    else if(postDate.getHours() <= 15) {
                        postDate.setHours(15);
                        postDate.setMinutes(0);
                    }
                    else if(postDate.getHours() <= 20) {
                        postDate.setHours(22);
                        postDate.setMinutes(0);
                    }
                    else {
                        postDate.setDate(postDate.getDate() + 1);
                        postDate.setHours(9);
                        postDate.setMinutes(0);
                    }

                    responseMessage = "Post scheduled for " + postDate.toLocaleString();

                    const accessTokenExtension = {  
                        method: 'GET',
                        uri: 'https://graph.facebook.com//oauth/access_token?'+
                            'grant_type=fb_exchange_token&'+
                            'client_id=813164498894176&'+
                            'client_secret=7569ee99c69612bae993d1313a603979&'+
                            'fb_exchange_token=' + fullData.AccessToken
                    };

                    request(accessTokenExtension, function(error, response, body) {                        
                        postTextOptions.qs.access_token = JSON.parse(body).access_token;

                        var queuedPost = {
                            Time: postDate,
                            Post: postTextOptions 
                        }
    
                        postsQueue.push(queuedPost);
                    });
                }
                else {
                    request(postTextOptions);
                }    

                res.writeHead(200, 'OK', {'Content-Type': 'text/html'})
                res.end(responseMessage);
            })
        }
    }
}

function contentType(ext) {
    var ct;

    switch (ext) {
    case '.html':
        ct = 'text/html';
        break;
    case '.css':
        ct = 'text/css';
        break;
    case '.js':
        ct = 'text/javascript';
        break;
    default:
        ct = 'text/plain';
        break;
    }

    return {'Content-Type': ct};
}

exports.handleRequest = function(req, res) {
    handler(req, res);
};

function queueHandler() {
    var currentDate = new Date();
    
    postsQueue.forEach(function(item, index, object){
        if(currentDate > item.Time) {
            request(item.Post);
            object.splice(index, 1);
        }
    });
}

setInterval(queueHandler, 60000);