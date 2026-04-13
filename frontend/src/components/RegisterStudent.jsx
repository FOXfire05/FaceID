import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle, Camera, RefreshCcw, Image as ImageIcon } from 'lucide-react';
import Webcam from 'react-webcam';

// Utility to convert Base64 Data URI to a File object
const dataURLtoFile = (dataurl, filename) => {
  let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

const RegisterStudent = () => {
  const [formData, setFormData] = useState({ studentId: '', name: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Camera States
  const [inputMode, setInputMode] = useState('upload'); // 'upload' or 'camera'
  const [facingMode, setFacingMode] = useState('environment'); // 'user' (front) or 'environment' (back)
  const webcamRef = useRef(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      const capturedFile = dataURLtoFile(imageSrc, `captured_student_${Date.now()}.jpg`);
      setFile(capturedFile);
      setPreview(imageSrc);
      setInputMode('upload'); // Switch back to upload preview mode
    }
  }, [webcamRef]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleRetake = () => {
    setFile(null);
    setPreview('');
    setInputMode('camera');
  };

  const handleClearFile = () => {
    setFile(null);
    setPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !formData.studentId || !formData.name) {
      setError('Vui lòng điền đầy đủ thông tin và tải ảnh lên.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    const data = new FormData();
    data.append('faceImage', file);
    data.append('studentId', formData.studentId);
    data.append('name', formData.name);

    try {
      const response = await axios.post('https://ea8bjyxjw8.execute-api.us-east-1.amazonaws.com/dev/api/students/register', data);
      setMessage(response.data.message);
      setFormData({ studentId: '', name: '' });
      setFile(null);
      setPreview('');
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng ký sinh viên thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <CheckCircle color="var(--primary-color)" /> Đăng ký Sinh viên
      </h2>
      
      {message && <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', borderRadius: '8px', marginBottom: '1.5rem' }}>{message}</div>}
      {error && <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--error)', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>}

      <form onSubmit={handleSubmit} className="grid-2">
        <div>
          <div className="form-group">
            <label htmlFor="studentId">Mã Sinh Viên (MSSV)</label>
            <input 
              type="text" 
              id="studentId" 
              name="studentId" 
              value={formData.studentId} 
              onChange={handleInputChange} 
              className="form-control" 
              placeholder="VD: SE123456"
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">Họ và Tên</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange} 
              className="form-control" 
              placeholder="VD: Nguyễn Văn A"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading || !file} style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? <div className="spinner"></div> : 'Đăng ký Hồ sơ'}
          </button>
        </div>

        <div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label>Ảnh khuôn mặt</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setInputMode('upload')}
                  className="btn" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: inputMode === 'upload' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: inputMode === 'upload' ? 'var(--primary-color)' : 'var(--text-muted)' }}
                >
                  <ImageIcon size={16} style={{marginRight: '4px'}} /> Tải ảnh
                </button>
                <button 
                  type="button" 
                  onClick={() => { setInputMode('camera'); setPreview(''); setFile(null); }}
                  className="btn" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: inputMode === 'camera' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: inputMode === 'camera' ? 'var(--primary-color)' : 'var(--text-muted)' }}
                >
                  <Camera size={16} style={{marginRight: '4px'}} /> Camera trực tiếp
                </button>
              </div>
            </div>

            {inputMode === 'camera' ? (
              <div className="file-drop-area" style={{ height: 'auto', minHeight: '300px', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
                <div style={{ position: 'relative', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode }}
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                  <button 
                    type="button" 
                    onClick={toggleCamera} 
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}
                    title="Đảo Camera"
                  >
                    <RefreshCcw size={20} />
                  </button>
                </div>
                <button type="button" onClick={capture} className="btn btn-primary" style={{ width: '100%' }}>
                  📸 Chụp ngay
                </button>
              </div>
            ) : (
              <div className="file-drop-area" style={{ height: 'min-content', minHeight: '300px', position: 'relative' }}>
                {!preview && <input type="file" accept="image/*" onChange={handleFileChange} />}
                
                {preview ? (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src={preview} alt="Preview" className="image-preview" style={{ maxHeight: '250px', objectFit: 'contain' }} />
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <button type="button" onClick={handleClearFile} className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                        Huỷ ảnh
                      </button>
                      <button type="button" onClick={handleRetake} className="btn" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-color)' }}>
                        <Camera size={16} style={{marginRight: '4px'}} /> Chụp lại
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="file-message">
                    <UploadCloud size={48} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
                    <span>Kéo thả hoặc bấm để Tải ảnh khuôn mặt</span>
                    <span style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Chỉ tải hình ảnh có duy nhất bản thân bạn</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterStudent;
