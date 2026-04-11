import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Camera, UserPlus, FileText } from 'lucide-react';
import RegisterStudent from './components/RegisterStudent';
import TakeAttendance from './components/TakeAttendance';
import AttendanceList from './components/AttendanceList';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="brand">
        <Camera size={28} />
        <span>FaceVerify AI</span>
      </div>
      <div className="nav-links">
        <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <UserPlus size={18} /> Đăng ký
        </NavLink>
        <NavLink to="/attendance" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Camera size={18} /> Điểm danh
        </NavLink>
        <NavLink to="/logs" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <FileText size={18} /> Lịch sử
        </NavLink>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<RegisterStudent />} />
            <Route path="/attendance" element={<TakeAttendance />} />
            <Route path="/logs" element={<AttendanceList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
