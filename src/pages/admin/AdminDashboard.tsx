import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminDashboardHome from './AdminDashboardHome';
import TechniciansPage from './TechniciansPage';
import QuestionsPage from './QuestionsPage';
import RatingLinksPage from './RatingLinksPage';
import TechnicianPerformancePage from './TechnicianPerformancePage';
import AdminLeaderboard from './AdminLeaderboard';

export default function AdminDashboard() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<AdminDashboardHome />} />
        <Route path="technicians" element={<TechniciansPage />} />
        <Route path="questions" element={<QuestionsPage />} />
        <Route path="links" element={<RatingLinksPage />} />
        <Route path="ratings" element={<TechnicianPerformancePage />} />
        <Route path="leaderboard" element={<AdminLeaderboard />} />
      </Route>
    </Routes>
  );
}