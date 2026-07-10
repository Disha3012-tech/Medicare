import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import FindDoctors from "./pages/FindDoctors";
import DoctorProfile from "./pages/DoctorProfile";
import AppointmentBooking from "./pages/AppointmentBooking";
import AppointmentHistory from "./pages/AppointmentHistory";
import MedicalRecords from "./pages/MedicalRecords";
import Prescriptions from "./pages/Prescriptions";
import Notifications from "./pages/Notifications";
import PatientSettings from "./pages/PatientSettings";
import DoctorAvailability from "./pages/DoctorAvailability";
import DoctorPatients from "./pages/DoctorPatients";
import DoctorPrescription from "./pages/DoctorPrescription";
import DoctorAnalytics from "./pages/DoctorAnalytics";
import DoctorSettings from "./pages/DoctorSettings";
import SymptomChecker from "./pages/SymptomChecker";
import VideoConsultation from "./pages/VideoConsultation";
import NotFound from "./pages/NotFound";
import ErrorPage from "./pages/ErrorPage";
import PatientProfileSetup from "./pages/PatientProfileSetup";
import DoctorProfileSetup from "./pages/DoctorProfileSetup";
import Messaging from "./pages/Messaging";
import { RouteGuard } from "./components/RouteGuard";

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    children: [
      { index: true,                                     Component: Landing },
      { path: "auth",                                    Component: Auth },

      // Onboarding
      { path: "patient/setup",                           element: <RouteGuard allowedRole="PATIENT"><PatientProfileSetup /></RouteGuard> },
      { path: "doctor/setup",                            element: <RouteGuard allowedRole="DOCTOR"><DoctorProfileSetup /></RouteGuard> },

      // Patient routes
      { path: "patient",                                 element: <RouteGuard allowedRole="PATIENT"><PatientDashboard /></RouteGuard> },
      { path: "patient/history",                         element: <RouteGuard allowedRole="PATIENT"><AppointmentHistory /></RouteGuard> },
      { path: "patient/records",                         element: <RouteGuard allowedRole="PATIENT"><MedicalRecords /></RouteGuard> },
      { path: "patient/prescriptions",                   element: <RouteGuard allowedRole="PATIENT"><Prescriptions /></RouteGuard> },
      { path: "patient/notifications",                   element: <RouteGuard allowedRole="PATIENT"><Notifications /></RouteGuard> },
      { path: "patient/settings",                        element: <RouteGuard allowedRole="PATIENT"><PatientSettings /></RouteGuard> },

      // Doctor portal — static paths before dynamic :id
      { path: "doctor",                                  element: <RouteGuard allowedRole="DOCTOR"><DoctorDashboard /></RouteGuard> },
      { path: "doctor/patients",                         element: <RouteGuard allowedRole="DOCTOR"><DoctorPatients /></RouteGuard> },
      { path: "doctor/prescriptions",                    element: <RouteGuard allowedRole="DOCTOR"><DoctorPrescription /></RouteGuard> },
      { path: "doctor/analytics",                        element: <RouteGuard allowedRole="DOCTOR"><DoctorAnalytics /></RouteGuard> },
      { path: "doctor/availability",                     element: <RouteGuard allowedRole="DOCTOR"><DoctorAvailability /></RouteGuard> },
      { path: "doctor/settings",                         element: <RouteGuard allowedRole="DOCTOR"><DoctorSettings /></RouteGuard> },
      { path: "doctor/notifications",                    element: <RouteGuard allowedRole="DOCTOR"><Notifications /></RouteGuard> },
      { path: "doctor/:id",                              element: <RouteGuard><DoctorProfile /></RouteGuard> },

      // Discovery & booking
      { path: "find-doctors",                            element: <RouteGuard allowedRole="PATIENT"><FindDoctors /></RouteGuard> },
      { path: "book/:id",                                element: <RouteGuard allowedRole="PATIENT"><AppointmentBooking /></RouteGuard> },

      // Messaging & utilities
      { path: "messages",                                element: <RouteGuard><Messaging /></RouteGuard> },
      { path: "symptom-checker",                         element: <RouteGuard><SymptomChecker /></RouteGuard> },
      { path: "consultation/:id",                        element: <RouteGuard><VideoConsultation /></RouteGuard> },

      { path: "*",                                       Component: NotFound },
    ],
  },
]);
