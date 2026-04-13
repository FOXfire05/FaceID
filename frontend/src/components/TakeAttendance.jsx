import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { UploadCloud, Users, Camera, RefreshCcw, Image as ImageIcon } from 'lucide-react';
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

const TakeAttendance = () => {
  const [className, setClassName] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  // Camera States
  const [inputMode, setInputMode] = useState('upload'); // 'upload' or 'camera'
  const [facingMode, setFacingMode] = useState('environment'); // 'user' (front) or 'environment' (back)
  const webcamRef = useRef(null);

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
      const capturedFile = dataURLtoFile(imageSrc, `captured_${Date.now()}.jpg`);
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
      const response = await axios.post('https://ea8bjyxjw8.execute-api.us-east-1.amazonaws.com/dev/api/attendance/take', data);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label>Thêm ảnh lớp học</label>
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
                        Huỷ ảnh tải lên
                      </button>
                      <button type="button" onClick={handleRetake} className="btn" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-color)' }}>
                        <Camera size={16} style={{marginRight: '4px'}} /> Chụp lại
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="file-message">
                    <UploadCloud size={48} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
                    <span>Kéo thả hoặc bấm để Tải ảnh lớp học</span>
                    <span style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Đảm bảo các khuôn mặt đều có thể nhìn rõ</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading || !file} style={{ width: '100%' }}>
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
