const { RekognitionClient } = require('@aws-sdk/client-rekognition');
const { S3Client } = require('@aws-sdk/client-s3');

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || process.env.AWS_REGION || 'us-east-1'
});

module.exports = { rekognitionClient, s3Client };
