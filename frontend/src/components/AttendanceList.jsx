import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText } from 'lucide-react';

const AttendanceList = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get('https://ea8bjyxjw8.execute-api.us-east-1.amazonaws.com/dev/api/attendance/logs');
      setLogs(response.data);
    } catch (err) {
      setError('Tải lịch sử điểm danh thất bại.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '3rem auto' }}></div>;

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FileText color="var(--primary-color)" /> Lịch sử Điểm danh
      </h2>

      {error && <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--error)', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Lớp / Ca học</th>
              <th>Sinh viên có mặt</th>
              <th>Khuôn mặt lạ</th>
              <th>Ảnh tập thể</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  Chưa có dữ liệu điểm danh nào.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id}>
                  <td>{new Date(log.date).toLocaleString()}</td>
                  <td>
                    <span className="badge">{log.className}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {log.presentStudents.map(student => (
                        <span key={student._id} style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                          {student.name}
                        </span>
                      ))}
                      {log.presentStudents.length === 0 && <span style={{ color: 'var(--text-muted)' }}>Không có</span>}
                    </div>
                  </td>
                  <td>
                    {log.unrecognizedFacesCount > 0 ? (
                      <span className="badge warning">{log.unrecognizedFacesCount} Khuôn mặt</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>0</span>
                    )}
                  </td>
                  <td>
                    {log.groupImageUrl ? (
                      <a href={log.groupImageUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        Xem Ảnh
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceList;
