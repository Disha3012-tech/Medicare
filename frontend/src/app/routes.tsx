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

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    children: [
      { index: true,                                     Component: Landing },
      { path: "auth",                                    Component: Auth },

      // Onboarding
      { path: "patient/setup",                           Component: PatientProfileSetup },
      { path: "doctor/setup",                            Component: DoctorProfileSetup },

      // Patient routes
      { path: "patient",                                 Component: PatientDashboard },
      { path: "patient/history",                         Component: AppointmentHistory },
      { path: "patient/records",                         Component: MedicalRecords },
      { path: "patient/prescriptions",                   Component: Prescriptions },
      { path: "patient/notifications",                   Component: Notifications },
      { path: "patient/settings",                        Component: PatientSettings },

      // Doctor portal — static paths before dynamic :id
      { path: "doctor",                                  Component: DoctorDashboard },
      { path: "doctor/patients",                         Component: DoctorPatients },
      { path: "doctor/prescriptions",                    Component: DoctorPrescription },
      { path: "doctor/analytics",                        Component: DoctorAnalytics },
      { path: "doctor/availability",                     Component: DoctorAvailability },
      { path: "doctor/settings",                         Component: DoctorSettings },
      { path: "doctor/:id",                              Component: DoctorProfile },

      // Discovery & booking
      { path: "find-doctors",                            Component: FindDoctors },
      { path: "book/:id",                                Component: AppointmentBooking },

      // Messaging & utilities
      { path: "messages",                                Component: Messaging },
      { path: "symptom-checker",                         Component: SymptomChecker },
      { path: "consultation/:id",                        Component: VideoConsultation },

      { path: "*",                                       Component: NotFound },
    ],
  },
]);
