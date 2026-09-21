import { Navigate, Route, Routes } from "react-router-dom";
import AgencyDashboard from "./pages/AgencyDashboard";
import ClientPortal from "./pages/ClientPortal";
import Landing from "./pages/Landing";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/agency" element={<Navigate to="/agency/c-northwind" replace />} />
      <Route path="/agency/:clientId" element={<AgencyDashboard />} />
      <Route path="/client/:clientId" element={<ClientPortal />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
