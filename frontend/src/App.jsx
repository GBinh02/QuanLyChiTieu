import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, Trash2, TrendingUp, TrendingDown, Wallet, BarChart3, LayoutDashboard, LogOut, UserPlus, LogIn } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement);

const API_URL = 'http://localhost:5000/api';

const formatVND = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount).replace('₫', 'đ');
};

const formatValue = (val) => {
  const formatted = new Intl.NumberFormat('vi-VN').format(Math.abs(val));
  return `${val < 0 ? '-' : val > 0 ? '+' : ''}${formatted} đ`;
};

// --- Components ---

const Header = () => (
  <header className="app-header">
    <h1>QUẢN LÝ CHI TIÊU</h1>
    <p>Quản lý tài chính cá nhân hiệu quả & hiện đại</p>
  </header>
);

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();
  if (!user) return null;

  return (
    <div className="nav-container">
      <div className="nav-tabs">
        <Link to="/" className={`nav-tab ${location.pathname === '/' ? 'active' : ''}`}>Giao dịch</Link>
        <Link to="/stats" className={`nav-tab ${location.pathname === '/stats' ? 'active' : ''}`}>Thống kê</Link>
      </div>
      <div className="user-info">
        <span>Chào, <strong>{user.username}</strong></span>
        <button onClick={onLogout} className="logout-btn">Đăng xuất</button>
      </div>
    </div>
  );
};

const Summary = ({ transactions }) => {
  const totalInc = transactions.filter(t => t.type === 'income').reduce((a, b) => a + parseFloat(b.amount), 0);
  const totalExp = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + parseFloat(b.amount), 0);
  const balance = totalInc - totalExp;

  return (
    <div className="summary-grid">
      <div className="summary-card balance">
        <label>SỐ DƯ HIỆN TẠI</label>
        <div className="value value-balance">{new Intl.NumberFormat('vi-VN').format(balance)} đ</div>
      </div>
      <div className="summary-card income">
        <label>TỔNG THU NHẬP</label>
        <div className="value value-income">+{new Intl.NumberFormat('vi-VN').format(totalInc)} đ</div>
      </div>
      <div className="summary-card expense">
        <label>TỔNG CHI TIÊU</label>
        <div className="value value-expense">-{new Intl.NumberFormat('vi-VN').format(totalExp)} đ</div>
      </div>
    </div>
  );
};

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify({ username: res.data.username }));
      setUser({ username: res.data.username });
      navigate('/');
    } catch (err) {
      console.error('Login Error:', err);
      alert('Đăng nhập thất bại. Kiểm tra lại email/mật khẩu.');
    }
  };

  return (
    <div className="auth-container card">
      <h2 style={{textAlign: 'center', marginBottom: '2rem'}}>Đăng nhập</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Mật khẩu</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary">Đăng nhập</button>
      </form>
      <p style={{marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem'}}>
        Chưa có tài khoản? <Link to="/register" style={{color: 'var(--primary)', fontWeight: 600}}>Đăng ký</Link>
      </p>
    </div>
  );
};

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/register`, { username, email, password });
      alert('Đăng ký thành công!');
      navigate('/login');
    } catch (err) { 
      console.error('Registration Error:', err);
      alert('Đăng ký thất bại. Vui lòng kiểm tra console hoặc đảm bảo backend đang chạy.'); 
    }
  };

  return (
    <div className="auth-container card">
      <h2 style={{textAlign: 'center', marginBottom: '2rem'}}>Đăng ký</h2>
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label>Tên người dùng</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Mật khẩu</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary">Đăng ký</button>
      </form>
    </div>
  );
};

const Dashboard = ({ transactions, fetchTransactions }) => {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [cat, setCat] = useState('Thực phẩm');

  const CATEGORIES = {
    expense: ['Thực phẩm', 'Di chuyển', 'Nhà ở', 'Giải trí', 'Mua sắm', 'Sức khỏe', 'Giáo dục', 'Khác'],
    income:  ['Lương', 'Thưởng', 'Đầu tư', 'Kinh doanh', 'Freelance', 'Trợ cấp', 'Khác']
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setCat(CATEGORIES[newType][0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.');
      return;
    }
    try {
      await axios.post(`${API_URL}/transactions`, 
        { description: desc, amount: parseFloat(amount), type, category: cat },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setDesc(''); setAmount('');
      fetchTransactions();
    } catch (err) {
      console.error('Save error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      } else {
        alert('Lưu giao dịch thất bại: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const deleteItem = async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/transactions/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchTransactions();
  };

  return (
    <div className="container">
      <Summary transactions={transactions} />
      <div className="main-grid">
        <div className="card">
          <h3>Thêm giao dịch mới</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tên giao dịch</label>
              <input type="text" value={desc} onChange={e => setDesc(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Số tiền (VND)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Loại giao dịch</label>
              <select value={type} onChange={e => handleTypeChange(e.target.value)}>
                <option value="expense">Chi tiêu (-)</option>
                <option value="income">Thu nhập (+)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Danh mục</label>
              <select value={cat} onChange={e => setCat(e.target.value)}>
                {CATEGORIES[type].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary">Lưu giao dịch</button>
          </form>
        </div>

        <div className="card">
          <h3>Lịch sử giao dịch</h3>
          {transactions.length === 0 ? (
            <div className="empty-state">Chưa có giao dịch nào.</div>
          ) : (
            <div className="transaction-list">
              {transactions.map(t => (
                <div key={t.id} className="transaction-item">
                  <div>
                    <div style={{fontWeight: 700}}>{t.description}</div>
                    <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{new Date(t.date).toLocaleDateString('vi-VN')} • {t.category}</div>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                    <span style={{fontWeight: 800, color: t.type === 'income' ? 'var(--success)' : 'var(--danger)'}}>
                      {t.type === 'income' ? '+' : '-'}{new Intl.NumberFormat('vi-VN').format(t.amount)} đ
                    </span>
                    <Trash2 size={16} color="#cbd5e1" style={{cursor: 'pointer'}} onClick={() => deleteItem(t.id)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Stats = ({ transactions }) => {
  const expenses = transactions.filter(t => t.type === 'expense');
  const cats = [...new Set(expenses.map(t => t.category))];
  const catData = cats.map(c => expenses.filter(t => t.category === c).reduce((a, b) => a + parseFloat(b.amount), 0));

  // Daily stats for bar chart
  const dailyStats = {};
  transactions.forEach(t => {
    const date = new Date(t.date).toLocaleDateString('vi-VN');
    if (!dailyStats[date]) dailyStats[date] = { income: 0, expense: 0 };
    dailyStats[date][t.type] += parseFloat(t.amount);
  });
  const dates = Object.keys(dailyStats).sort().slice(-7);

  const barData = {
    labels: dates,
    datasets: [
      { label: 'Thu nhập', data: dates.map(d => dailyStats[d].income), backgroundColor: '#10b981' },
      { label: 'Chi tiêu', data: dates.map(d => dailyStats[d].expense), backgroundColor: '#ef4444' }
    ]
  };

  const pieData = {
    labels: cats,
    datasets: [{
      data: catData,
      backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'],
    }]
  };

  return (
    <div className="container" style={{maxWidth: '750px'}}>
      <Summary transactions={transactions} />
      <div className="main-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem'}}>
        <div className="card">
          <h3>Biểu đồ thu chi hằng ngày</h3>
          <div style={{height: '350px'}}>
            <Bar 
              data={barData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' }},
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => value.toLocaleString('vi-VN') + ' đ',
                      stepSize: 1000000, // Show every 1M VND
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
        <div className="card">
          <h3>Chi tiêu theo danh mục</h3>
          {catData.length === 0 ? (
            <div className="empty-state">Chưa có dữ liệu chi tiêu.</div>
          ) : (
            <div style={{maxHeight: '300px', display: 'flex', justifyContent: 'center'}}>
              <Pie data={pieData} options={{ plugins: { legend: { position: 'bottom' }}}} />
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{marginTop: '1.5rem'}}>
        <h3>Thống kê chi tiết theo ngày</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Thu (+)</th>
              <th>Chi (-)</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(dailyStats).sort((a,b) => b.localeCompare(a)).map(date => (
              <tr key={date}>
                <td>{date}</td>
                <td style={{color: 'var(--success)', fontWeight: 600}}>+{new Intl.NumberFormat('vi-VN').format(dailyStats[date].income)} đ</td>
                <td style={{color: 'var(--danger)', fontWeight: 600}}>-{new Intl.NumberFormat('vi-VN').format(dailyStats[date].expense)} đ</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Main App ---

function App() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    if (user) fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(res.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setTransactions([]);
  };

  return (
    <Router>
      <div className="container">
        <Header />
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login setUser={setUser} />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          <Route path="/" element={user ? <Dashboard transactions={transactions} fetchTransactions={fetchTransactions} /> : <Navigate to="/login" />} />
          <Route path="/stats" element={user ? <Stats transactions={transactions} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
