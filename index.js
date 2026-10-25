const express = require("express");
const fs = require("node:fs");
const { join } = require("node:path");
var app = express();
// Static files
app.use("/static", express.static(join(__dirname, "public")));
// HTML
app.use("/", express.static(join(__dirname, "static")));

// The port the application runs. If you get an error, change the port.
// Default: 8000
var port = 8000;

var getContents = (file, subfolder) => {
    let contents = fs.readFileSync(join(subfolder, file), (e) => {
        if (typeof e !== null) {
            console.log(e);
        }
    });
    return contents;
}
app.get("/", (req, res) => {
    res.type('html')
    res.send(getContents("index.html", "static"))
});
app.get("/chat", (req, res) => {
    res.type('html')
    res.send(getContents("chat.html", "static"))
});
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});