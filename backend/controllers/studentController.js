const { IndexFacesCommand, DeleteFacesCommand } = require('@aws-sdk/client-rekognition');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { rekognitionClient, s3Client } = require('../config/aws');
const Student = require('../models/Student');

exports.registerStudent = async (req, res) => {
  try {
    const { studentId, name } = req.body;
    const file = req.file;

    if (!file || !studentId || !name) {
      return res.status(400).json({ error: 'Thiếu thông tin yêu cầu hoặc ảnh.' });
    }

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
      return res.status(400).json({ error: 'Không tìm thấy khuôn mặt trong ảnh.' });
    }

    if (awsResponse.FaceRecords.length > 1) {
      return res.status(400).json({ error: 'Phát hiện nhiều khuôn mặt. Vui lòng tải lên ảnh chỉ có một khuôn mặt.' });
    }

    const faceId = awsResponse.FaceRecords[0].Face.FaceId;

    // Upload image to S3
    let imageUrl = '';
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (bucketName && bucketName.trim() !== 'your_s3_bucket_name') {
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

    const newStudent = new Student({
      studentId,
      name,
      faceId,
      imageUrl
    });

    await newStudent.save();

    res.status(201).json({
      message: 'Đăng ký sinh viên thành công',
      student: newStudent,
    });
  } catch (error) {
    console.error('Error registering student:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Mã sinh viên đã tồn tại.' });
    }
    // Handle case where collection doesn't exist
    if (error.name === 'ResourceNotFoundException') {
      return res.status(500).json({ error: 'Không tìm thấy Bộ sưu tập AWS Rekognition. Vui lòng tạo trước.' });
    }
    res.status(500).json({ error: 'Lỗi máy chủ khi đăng ký sinh viên.', details: error.message });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi máy chủ khi tải danh sách sinh viên.' });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Không tìm thấy sinh viên.' });
    }

    // Attempt to delete face from AWS Rekognition
    if (student.faceId) {
      try {
        const deleteParams = {
          CollectionId: process.env.REKOGNITION_COLLECTION_ID || 'student_faces',
          FaceIds: [student.faceId]
        };
        const deleteCommand = new DeleteFacesCommand(deleteParams);
        await rekognitionClient.send(deleteCommand);
      } catch (awsError) {
        console.error('Error deleting face from Rekognition:', awsError.message);
        // We continue even if AWS fails (maybe face was already deleted)
      }
    }

    // Delete from MongoDB
    await Student.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Xoá sinh viên thành công!' });
  } catch (error) {
    console.error('Lỗi khi xoá sinh viên:', error);
    res.status(500).json({ error: 'Lỗi máy chủ khi xoá sinh viên.', details: error.message });
  }
};
