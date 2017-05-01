const path = require('path');
const NosClient = require('nos-node-sdk');
const streamifier = require('streamifier');
const uuidV4 = require('uuid/v4');
const client = new NosClient();

const {
  ACCESS_KEY = '',
  SECRET_KEY = '',
  END_POINT = '',
  BUCKET = '',
} = process.env;

client.setAccessId(ACCESS_KEY);
client.setSecretKey(SECRET_KEY);
client.setEndpoint(END_POINT);

module.exports = (file = {}, cb) => {
  const { originalname = '', size = 0 } = file;
  const suffix = path.extname(originalname) || '';
  const readStream = streamifier.createReadStream(file.buffer);

  try {
    client.put_object_stream({
        bucket: BUCKET,
        key: uuidV4() + suffix,
        body: readStream,
        length: size,
    }, result => {
      const url = `https://${BUCKET}.${END_POINT}/${result.headers['x-nos-object-name']}`;
      cb(null, { name: originalname, url });
    });
  } catch (err) {
    cb(err);
  }
};
