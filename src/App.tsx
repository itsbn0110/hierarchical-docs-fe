import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import ConfirmModal from './components/common/ConfirmModal';
import UserInfo from './components/UserInfo';
import LoginPage from './pages/LoginPage';

function App() {
  const [count, setCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(true);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <>
              <div>
                <a href="https://vite.dev" target="_blank">
                  <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                  <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
              </div>
              <h1 style={{ fontSize: '1.2rem' }}>Vite + React</h1>
              <UserInfo />
              <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
                <p>
                  Edit <code>src/App.tsx</code> and save to test HMR
                </p>
              </div>
              <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
              <ConfirmModal
                open={modalOpen}
                title="Confirm Action"
                content="Are you sure you want to proceed?"
                onOk={() => {
                  /* handle OK */
                }}
                onCancel={() => setModalOpen(false)}
              />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
