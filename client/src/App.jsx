import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Doctors from "./pages/Doctors";
import Login from "./pages/Login";
import DoctorRegister from "./pages/DoctorRegister";
import RedirectIfAuthenticated from "./components/protections/RedirectIfAuthenticated";
import RedirectIfNotAuthenticated from "./components/protections/RedirectIfNotAuthenticated";
import DoctorsDashboard from "./pages/doctor/DoctorsDashboard";
import PatientsDashboard from "./pages/patient/PatientsDashboard";
import RoleBasedRoute from "./components/protections/RoleBasedRoute";
import AssistantsDashboard from "./pages/assistant/AssistantsDashboard";
import MyAccount from "./pages/MyAccount";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";
import Specialities from "./pages/admin/Specialities";
import PatientRegister from "./pages/patient/PatientRegister";
import PatientIdCreation from "./pages/patient/PatientIdCreation";
import PatientIdCheck from "./pages/patient/PatientIdCheck";
import Subscriptions from "./pages/admin/Subscriptions";
import DoctorSubscription from "./pages/admin/DoctorSubscription";
import DoctorTransactions from "./pages/doctor/DoctorTransactions";
import DoctorProfile from "./pages/DoctorProfile";
import PatientAppointments from "./pages/patient/PatientAppointments";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorAssistants from "./pages/doctor/DoctorAssistants";
import AssistantAppointmnets from "./pages/assistant/AssistantAppointmnets";
import AssistantAppointmentBooking from "./pages/assistant/AssistantAppointmentBooking";
import DoctorAppointmentConsult from "./pages/doctor/DoctorAppointmentConsult";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* accessable for all */}
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/doctorregister" element={<DoctorRegister />} />
        <Route path="/patientregister" element={<PatientRegister />} />
        <Route path="/patientidcreation" element={<PatientIdCreation />} />
        <Route path="/patientidcheck" element={<PatientIdCheck />} />
        <Route path="/:username" element={<DoctorProfile />} />
        {/* Not accessable if logged in */}
        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated>
              <Login />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/my-account"
          element={
            <RedirectIfNotAuthenticated>
              <MyAccount />
            </RedirectIfNotAuthenticated>
          }
        />
        {/* accessable for admin only */}
        <Route
          path="/admin-dashboard/:id"
          element={
            <RoleBasedRoute allowedRoles={[1]}>
              <AdminDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/specialities"
          element={
            <RoleBasedRoute allowedRoles={[1]}>
              <Specialities />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/subscriptions"
          element={
            <RoleBasedRoute allowedRoles={[1]}>
              <Subscriptions />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/subscriptions/:id"
          element={
            <RoleBasedRoute allowedRoles={[1]}>
              <DoctorSubscription />
            </RoleBasedRoute>
          }
        />

        {/* accessable for doctor only */}
        <Route
          path="/doctor-dashboard/:id"
          element={
            <RoleBasedRoute allowedRoles={[2]}>
              <DoctorsDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/doctor-dashboard/transactions/:id"
          element={
            <RoleBasedRoute allowedRoles={[2]}>
              <DoctorTransactions />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/doctor-dashboard/appointments/:id"
          element={
            <RoleBasedRoute allowedRoles={[2]}>
              <DoctorAppointments />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/doctor-dashboard/assistants/:id"
          element={
            <RoleBasedRoute allowedRoles={[2]}>
              <DoctorAssistants />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/doctor-dashboard/appointment/:appoitmentid"
          element={
            <RoleBasedRoute allowedRoles={[2]}>
              <DoctorAppointmentConsult />
            </RoleBasedRoute>
          }
        />

        {/* accessable for assistant only */}
        <Route
          path="/assistant-dashboard/:doctorId/:assistantId"
          element={
            <RoleBasedRoute allowedRoles={[3]}>
              <AssistantsDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/assistant-dashboard/appointments/:doctorId/:assistantId"
          element={
            <RoleBasedRoute allowedRoles={[3]}>
              <AssistantAppointmnets />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/assistant-dashboard/appointment-booking/:doctorId/:assistantId"
          element={
            <RoleBasedRoute allowedRoles={[3]}>
              <AssistantAppointmentBooking />
            </RoleBasedRoute>
          }
        />

        {/* accessable for patient only */}
        <Route
          path="/patient-dashboard/:patientId"
          element={
            <RoleBasedRoute allowedRoles={[4]}>
              <PatientsDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/patient-appointments/:patientId"
          element={
            <RoleBasedRoute allowedRoles={[4]}>
              <PatientAppointments />
            </RoleBasedRoute>
          }
        />
        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
