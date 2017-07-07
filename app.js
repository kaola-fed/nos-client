const express = require('express');
const multer  = require('multer');
const cors = require('cors');
const nos = require('./lib/nos');
const upload = multer();
const app = express();

app.use(cors())

app.use('/', express.static('public'));
app.post('/upload', upload.single('file'), (req, res) => {
  nos(req.file, (err, result) => {
    res.json(result);
  });
});

const port = process.env.VCAP_APP_PORT || 10010;
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});