const aws       = require('aws-sdk'),
      s3Storage = require('multer-sharp-s3'),
      multer    = require('multer');

const awsID     = process.env.AWS_ACCESS_KEY_ID,
      awsAcc    = process.env.AWS_SECRET_ACCESS_KEY,
      awsBucket = process.env.S3_BUCKET;

aws.config.update({
    secretAccessKey: awsAcc,
    accessKeyId: awsID,
    region: 'eu-central-1',
});

const s3 = new aws.S3();

let storage = s3Storage({
    Key: function (req, file, cb) {
        cb(null, file.originalname);
    },
    s3,
    Bucket: awsBucket,
    ACL: 'public-read',
    resize: {
        width: 622,
        height: 350
    },
    max: true,
});

const upload = multer({ storage: storage });

module.exports = {
    upload,
    awsBucket
};