const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const {
  v1: uuidv1,
  v4: uuidv4,
} = require('uuid');

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_ID,
  secretAccessKey: process.env.AWS_ACCESS_KEY,
})

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'chaalk',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: '',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname })
    },
    key: (req, file, cb) => {
      cb(null, `assets/${uuidv4()}.${file.originalname.split(".")[1]}`)
    }
  })
})

module.exports = {
  upload
}