import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Trash2 } from 'lucide-react';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/students');
      setStudents(response.data);
    } catch (err) {
      setError('Tải danh sách sinh viên thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá sinh viên này không? Dữ liệu khuôn mặt sẽ bị hỏng nếu bị xoá nhầm!')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.delete(`http://localhost:5000/api/students/${id}`);
      setSuccess(response.data.message || 'Xoá sinh viên thành công!');
      // Refresh list
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.error || 'Xoá sinh viên thất bại.');
      setLoading(false);
    }
  };

  if (loading && students.length === 0) return <div className="spinner" style={{ margin: '3rem auto' }}></div>;

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Users color="var(--primary-color)" /> Quản lý Sinh viên
      </h2>

      {error && <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--error)', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>}
      {success && <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', borderRadius: '8px', marginBottom: '1.5rem' }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {students.length === 0 && !loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
            Chưa có sinh viên nào.
          </div>
        ) : (
          students.map(student => (
            <div key={student._id} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--surface-border)',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {student.imageUrl ? (
                <img 
                  src={student.imageUrl} 
                  alt={student.name} 
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/250x200?text=No+Image' }}
                />
              ) : (
                <div style={{ width: '100%', height: '200px', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  Không có ảnh
                </div>
              )}
              
              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{student.name}</h3>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>MSSV: <span style={{ color: 'var(--text)' }}>{student.studentId}</span></div>
                
                <button 
                  onClick={() => handleDelete(student._id)}
                  style={{ 
                    marginTop: 'auto', 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    color: 'var(--error)', 
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '0.6rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontWeight: 500,
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                >
                  <Trash2 size={16} /> Xoá sinh viên
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageStudents;
