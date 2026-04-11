import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle } from 'lucide-react';

const RegisterStudent = () => {
  const [formData, setFormData] = useState({ studentId: '', name: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
      const response = await axios.post('http://localhost:5000/api/students/register', data);
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
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? <div className="spinner"></div> : 'Đăng ký Hồ sơ'}
          </button>
        </div>

        <div>
          <div className="form-group">
            <label>Ảnh khuôn mặt</label>
            <div className="file-drop-area">
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {preview ? (
                <img src={preview} alt="Preview" className="image-preview" />
              ) : (
                <div className="file-message">
                  <UploadCloud size={48} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
                  <span>Kéo & Thả hoặc Click để Tải ảnh</span>
                  <span style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Chỉ tải lên hình ảnh có duy nhất một khuôn mặt rõ nét</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterStudent;
