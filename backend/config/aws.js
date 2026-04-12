const { RekognitionClient } = require('@aws-sdk/client-rekognition');
const { S3Client } = require('@aws-sdk/client-s3');

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: credentials
});

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || process.env.AWS_REGION || 'us-east-1',
  credentials: credentials
});

module.exports = { rekognitionClient, s3Client };
