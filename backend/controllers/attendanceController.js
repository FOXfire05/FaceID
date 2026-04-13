const { SearchFacesByImageCommand, DetectFacesCommand } = require('@aws-sdk/client-rekognition');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { rekognitionClient, s3Client } = require('../config/aws');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const sharp = require('sharp');

exports.takeAttendance = async (req, res) => {
  try {
    const { className } = req.body;
    const file = req.file;

    if (!file || !className) {
      return res.status(400).json({ error: 'Thiếu tên lớp hoặc ảnh tập thể.' });
    }
    const detectParams = {
      Image: { Bytes: file.buffer }
    };
    const detectCommand = new DetectFacesCommand(detectParams);
    const detectResult = await rekognitionClient.send(detectCommand);

    const faceDetails = detectResult.FaceDetails;
    if (!faceDetails || faceDetails.length === 0) {
      return res.status(400).json({ error: 'Không tìm thấy khuôn mặt nào trong ảnh tập thể.' });
    }

    const matchedStudentIds = new Set();
    let unrecognizedFacesCount = 0;

    const imageMetadata = await sharp(file.buffer).metadata();

    for (const face of faceDetails) {
      const box = face.BoundingBox;

      const left = Math.floor(box.Left * imageMetadata.width);
      const top = Math.floor(box.Top * imageMetadata.height);
      let width = Math.floor(box.Width * imageMetadata.width);
      let height = Math.floor(box.Height * imageMetadata.height);

      const pad = Math.floor(width * 0.1);
      const cLeft = Math.max(0, left - pad);
      const cTop = Math.max(0, top - pad);
      const cWidth = Math.min(imageMetadata.width - cLeft, width + 2 * pad);
      const cHeight = Math.min(imageMetadata.height - cTop, height + 2 * pad);

      const croppedBuffer = await sharp(file.buffer)
        .extract({ left: cLeft, top: cTop, width: cWidth, height: cHeight })
        .toBuffer();

      try {
        const searchParams = {
          CollectionId: process.env.REKOGNITION_COLLECTION_ID || 'student_faces',
          Image: { Bytes: croppedBuffer },
          FaceMatchThreshold: 80,
          MaxFaces: 1
        };
        const searchCommand = new SearchFacesByImageCommand(searchParams);
        const searchResult = await rekognitionClient.send(searchCommand);

        if (searchResult.FaceMatches && searchResult.FaceMatches.length > 0) {
          const matchedFaceId = searchResult.FaceMatches[0].Face.FaceId;
          matchedStudentIds.add(matchedFaceId);
        } else {
          unrecognizedFacesCount++;
        }
      } catch (err) {
        console.error('Error searching a face:', err.message);
        unrecognizedFacesCount++;
      }
    }

    // Match FaceIds to Students in Database
    const presentStudents = await Student.find({ faceId: { $in: Array.from(matchedStudentIds) } });

    // 2. Upload Group Photo to S3
    let groupImageUrl = '';
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (bucketName && bucketName.trim() !== 'your_s3_bucket_name') {
      const fileExtension = file.originalname.split('.').pop() || 'jpg';
      const s3Key = `attendance/${className.replace(/\s+/g, '_')}_${Date.now()}.${fileExtension}`;

      const s3Params = {
        Bucket: bucketName,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype
      };

      const putCommand = new PutObjectCommand(s3Params);
      await s3Client.send(putCommand);

      const s3Region = process.env.AWS_S3_REGION || process.env.AWS_REGION || 'us-east-1';
      groupImageUrl = `https://${bucketName}.s3.${s3Region}.amazonaws.com/${s3Key}`;
    }

    // 3. Create Attendance Record
    const attendanceRecord = new Attendance({
      className,
      presentStudents: presentStudents.map(s => s._id),
      unrecognizedFacesCount,
      groupImageUrl
    });

    await attendanceRecord.save();

    res.status(200).json({
      message: 'Điểm danh thành công.',
      attendance: attendanceRecord,
      present: presentStudents,
      unrecognizedCount: unrecognizedFacesCount,
      totalFacesDetected: faceDetails.length
    });

  } catch (error) {
    console.error('Error taking attendance:', error);
    res.status(500).json({ error: 'Lỗi máy chủ khi xử lý điểm danh.', details: error.message });
  }
};

exports.getAttendanceLogs = async (req, res) => {
  try {
    const logs = await Attendance.find().populate('presentStudents', 'name studentId faceId imageUrl').sort({ date: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi máy chủ khi tải lịch sử điểm danh.' });
  }
};
