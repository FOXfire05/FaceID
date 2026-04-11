const { IndexFacesCommand } = require('@aws-sdk/client-rekognition');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { rekognitionClient, s3Client } = require('../config/aws');
const Student = require('../models/Student');

exports.registerStudent = async (req, res) => {
  try {
    const { studentId, name } = req.body;
    const file = req.file;

    if (!file || !studentId || !name) {
      return res.status(400).json({ error: 'Missing required fields or image.' });
    }

    // Call AWS Rekognition to index the face
    const rekognitionParams = {
      CollectionId: process.env.REKOGNITION_COLLECTION_ID || 'student_faces',
      Image: {
        Bytes: file.buffer,
      },
      ExternalImageId: studentId,
      DetectionAttributes: ['ALL'],
    };

    const indexCommand = new IndexFacesCommand(rekognitionParams);
    const awsResponse = await rekognitionClient.send(indexCommand);

    if (awsResponse.FaceRecords.length === 0) {
      return res.status(400).json({ error: 'No face detected in the image.' });
    }

    if (awsResponse.FaceRecords.length > 1) {
      return res.status(400).json({ error: 'Multiple faces detected. Please upload an image with only one face.' });
    }

    const faceId = awsResponse.FaceRecords[0].Face.FaceId;

    // Upload image to S3
    let imageUrl = '';
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (bucketName) {
      const fileExtension = file.originalname.split('.').pop() || 'jpg';
      const s3Key = `students/${studentId}_${Date.now()}.${fileExtension}`;
      
      const s3Params = {
        Bucket: bucketName,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype
      };

      const putCommand = new PutObjectCommand(s3Params);
      await s3Client.send(putCommand);
      
      imageUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
    }

    // Save to Database
    const newStudent = new Student({
      studentId,
      name,
      faceId,
      imageUrl
    });

    await newStudent.save();

    res.status(201).json({
      message: 'Student registered successfully',
      student: newStudent,
    });
  } catch (error) {
    console.error('Error registering student:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Student ID already exists.' });
    }
    // Handle case where collection doesn't exist
    if (error.name === 'ResourceNotFoundException') {
      return res.status(500).json({ error: 'AWS Rekognition Collection not found. Please create it first.' });
    }
    res.status(500).json({ error: 'Server error registering student.' });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching students.' });
  }
};
