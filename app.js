const express = require('express');
const multer  = require('multer');
const nos = require('./lib/nos');
const upload = multer();
const app = express();

app.use('/', express.static('public'));
app.post('/upload', upload.single('fileData'), (req, res) => {
  nos(req.file, (err, result) => {
    res.json(result);
  });
});

const port = process.env.VCAP_APP_PORT || 10010;
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});