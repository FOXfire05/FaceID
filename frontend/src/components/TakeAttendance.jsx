import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, Users } from 'lucide-react';

const TakeAttendance = () => {
  const [className, setClassName] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !className) {
      setError('Vui lòng cung cấp Tên Lớp và ảnh tập thể.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const data = new FormData();
    data.append('groupImage', file);
    data.append('className', className);

    try {
      const response = await axios.post('http://localhost:5000/api/attendance/take', data);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Xử lý điểm danh thất bại. Vui lòng kiểm tra lại ảnh.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid-2">
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users color="var(--primary-color)" /> Điểm danh lớp học
        </h2>
        
        {error && <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--error)', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="className">Tên Lớp / Ca học</label>
            <input 
              type="text" 
              id="className" 
              value={className} 
              onChange={(e) => setClassName(e.target.value)} 
              className="form-control" 
              placeholder="VD: Lập trình C++ CS101"
            />
          </div>
          
          <div className="form-group">
            <label>Tải ảnh tập thể</label>
            <div className="file-drop-area" style={{ height: '300px' }}>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {preview ? (
                <img src={preview} alt="Preview" className="image-preview" />
              ) : (
                <div className="file-message">
                  <UploadCloud size={48} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
                  <span>Tải ảnh lớp học</span>
                  <span style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Đảm bảo các khuôn mặt đều có thể nhìn rõ</span>
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? <div className="spinner"></div> : 'Bắt đầu điểm danh'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Kết quả phân tích</h3>
        
        {!result && !loading && (
          <div style={{ color: 'var(--surface-border)', textAlign: 'center', marginTop: '3rem' }}>
            Kết quả sẽ hiển thị ở đây sau khi xử lý
          </div>
        )}

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '3rem', color: 'var(--primary-color)' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary-color)', marginBottom: '1rem' }}></div>
            Đang phân tích khuôn mặt...
          </div>
        )}

        {result && (
          <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>{result.present?.length || 0}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Sinh viên có mặt</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{result.unrecognizedCount || 0}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Khuôn mặt lạ</div>
              </div>
            </div>

            <h4 style={{ marginBottom: '1rem' }}>Danh sách có mặt</h4>
            {result.present && result.present.length > 0 ? (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {result.present.map(student => (
                  <li key={student._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                    <span style={{ fontWeight: 500 }}>{student.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{student.studentId}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Không tìm thấy sinh viên nào được nhận dạng trong Cơ sở dữ liệu.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeAttendance;
