var page = require('webpage').create();
// import {create as page} from "webpage";

page.open('http://', function() {
    setTimeout(function() {
        page.render('google.png');
        phantom.exit();
    }, 200);
});