import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import CreateTweepPage from "./pages/CreateTweepPage";
import { TweepsProvider } from './context/TweepsContext';
import { AuthProvider } from './context/AuthContext';

function App() {
    return (
        <AuthProvider>
            <TweepsProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/profile/:username" element={<ProfilePage />} />
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/create-tweep" element={<CreateTweepPage />} />
                    </Routes>
                </Router>
            </TweepsProvider>
        </AuthProvider>
    );
}

export default App;
