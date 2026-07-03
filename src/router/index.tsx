

import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage.tsx";
// import LoginPage from "../pages/LoginPage.tsx";
import ServicePage from "../pages/auth/ServicePage.tsx";
import WeightlossPage from "../pages/auth/WeightlossPage.tsx";
import WeGovyPage from "../pages/auth/WeGovyPage.tsx";
import MounjaroPage from "../pages/auth/MounjaroPage.tsx";
import OrlistatPage from "../pages/auth/OrlistatPage.tsx";
import MicrosuctionPage from '../pages/auth/MicrosuctionPage.tsx';
import ContraPage from '../pages/auth/ContraPage.tsx';
import BarcodePage from '../pages/auth/BarcodePage.tsx';
import CheckinsPage from '../pages/auth/CheckinsPage.tsx';


import BookingPage from "../pages/auth/BookingPage.tsx"; 
import BookAppointment from "../pages/auth/BookAppointment.tsx"; 
import SignInPage from "../pages/auth/SignInPage.tsx";
import SignUpPage from "../pages/auth/SignUpPage.tsx";
import PickSchoolPage from "../pages/auth/PickSchoolPage.tsx";
import SetupProfilePage from "../pages/auth/SetupProfilePage.tsx";
import InvoicePage from "../pages/admin/pages/InvoicePage.tsx";
import ContactPage from "../pages/auth/ContactPage.tsx";
import PrivacyPolicy from "../pages/auth/PrivacyPolicy.tsx";

import ProtectedPage from "../pages/ProtectedPage.tsx";
import App from "../pages/student/app.tsx";
import NotFoundPage from "../pages/404Page.tsx";
import AuthProtectedRoute from "./AuthProtectedRoute.tsx";
import Providers from "../Providers.tsx";
//ADMIN
import StudentForm from "../pages/admin/StudentForm.tsx";
import Animation from "../pages/admin/Animation.tsx";
import SplineAnimation from "../pages/admin/SplineAnimation.tsx";
import StudentFee from "../pages/admin/StudentFee.tsx";
import DashBoard from "../pages/admin/DashBoard.tsx";
import AppDashboard from "../pages/admin/AppDashboard.tsx";
import ReportsPage from "../pages/admin/ReportsPage.tsx";
import AccountingPage from "../pages/admin/AccountingPage.tsx";
import GradeDashboard from "../pages/admin/GradeDashboard.tsx";
import StaffAttendance from "../pages/admin/StaffAttendance.tsx";
//STUDENT
import StudentPage from "../pages/student/StudentPage.tsx";
import StudentGrade from "../pages/student/StudentGrade.tsx";
//TEACHER
import AttendancePage from "../pages/teacher/AttendancePage.tsx";
import TeacherDashboard from "../pages/teacher/TeacherDashboard.tsx";
import ProgressGraph from "../pages/student/ProgressGraph.tsx";
import TotalAverage from "../pages/student/TotalAverage.tsx";
import StudentFeeGraph from "../pages/student/StudentFeeGraph.tsx";
import StaffPage from "../pages/teacher/StaffPage.tsx";
import StaffLog from "../pages/teacher/StaffLog.tsx";
import BookingBoard from "../pages/teacher/BookingBoard.tsx";
import MyBooking from "../pages/teacher/MyBooking.tsx";
import EmergencySupply from "../pages/auth/EmergencySupply.tsx";
import OrderingPatientPage from "../pages/teacher/OrderPatientPage.tsx";
import OrderPage from "../pages/teacher/OrderPage.tsx";
import TravelPage from "../pages/auth/TravelPage.tsx";
import PaymentPage from "../pages/admin/PaymentPage.tsx"
import PaymentCancel from "../pages/admin/PaymentCancel.tsx";
import PaymentSuccess from "../pages/admin/PaymentSuccess.tsx";
import CellXpertsWebsite from "../pages/admin/CellXpertsWebsite.tsx";
import Dashboardstore from "../pages/admin/DashboardStore.tsx";
import Dashboardstore2 from "../pages/admin/DashboardStore2.tsx";
import Dashboardstore3 from "../pages/admin/DashboardStore3.tsx";
import ShopPage from "../pages/shop/ShopPage.tsx";
import BrandsAZ from "../pages/shop/BrandsAZ.tsx";
import SpeechToText from "../pages/shop/SpeechToTex.tsx";
import PharmacyFirst from "../pages/admin/pharmacy-first/PharmacyFirst.tsx";
import VideoGenerator from "../pages/admin/VideoGenerator.tsx";
import { FlowDiagram } from "../pages/admin/pharmacy-first/FlowDiagram.tsx";
import WorkersPage from "../pages/admin/WorkersPage.tsx";
import JobsPage from "../pages/admin/JobsPage.tsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Providers />,
    children: [
      //AUTH
      {
        path: "/login",
        element: <HomePage />,
      },
      {
        path: "/shop",
        element: <ShopPage/>,
      },
      {
        path: "/shop/brands",
        element: <BrandsAZ/>,
      },
      {
        path: "/services",
        element: <ServicePage />,
      },
      {
        path: "/video",
        element: <VideoGenerator />,
      },
      {
        path: "/emergency-supply",
        element: <EmergencySupply />,
      },
      {
        path: "/pharmacy-first",
        element: <PharmacyFirst />,
      },
      
      {
        path: "/app",
        element: <App />,
      },
      {
        path: "/payment",
        element: <PaymentPage />,
      },
      {
        path: "/",
        element: <CellXpertsWebsite />,
      },
      {
        path: "/payment-success",
        element: <PaymentSuccess />,
      },
      {
        path: "/payment-cancel",
        element: <PaymentCancel />,
      },
      {
        path: "/weight-loss-clinic",
        element: <WeightlossPage />,
      },
      {
        path: "/wegovy",
        element: <WeGovyPage />,
      },
      {
        path: "/mounjaro",
        element: <MounjaroPage />,
      },
      {
        path: "/orlistat",
        element: <OrlistatPage />,
      },
      {
        path: "/microsuction-earwax-removal",
        element: <MicrosuctionPage />,
      },
      {
        path: "/oral-contraceptives",
        element: <ContraPage />,
      },
      {
        path: "/book/:id",
        element: <BookingPage />,
      },
      {
        path: "/book-appointment",
        element: <BookAppointment />,
      },
      {
        path: "/sign-in",
        element: <SignInPage />,
      },
      {
        path: "/sign-up",
        element: <SignUpPage />,
      },
      {
        path: "/invoice",
        element: <InvoicePage />,
      },
      // {
      //   path: "/login",
      //   element: <LoginPage />,
      // },
      {
        path: "/pick-school",
        element: <PickSchoolPage />,
      },
     
      {
        path: "/setup-profile",
        element: <SetupProfilePage />,
      },
      {
        path: "/animation",
        element: <Animation />,
      },
      {
        path: "/animation2",
        element: <SplineAnimation />,
      },
      {
        path: "/travel-clinic",
        element: <TravelPage />,
      },
     
      //ADMIN
      {
        path: "/dashboard",
        element: <DashBoard />,
      },
      // {
      //   path: "/appdashboard",
      //   element: <AppDashboard />,
      // },
      {
        path: "/workerspage",
        element: <WorkersPage />,
      },
      {
        path: "/jobspage",
        element: <JobsPage />,
      },
      {
        path: "/reportspage",
        element: <ReportsPage />,
      },
      {
        path: "/accounting",
        element: <AccountingPage />,
      },
      {
        path: "/dashboardstore",
        element: <Dashboardstore />,
      },
      {
        path: "/dashboardstore2",
        element: <Dashboardstore2 />,
      },
      {
        path: "/dashboardstore3",
        element: <Dashboardstore3 />,
      },
      {
        path: "/bookings",
        element: <BookingBoard />,
      },
      {
        path: "/privacy-policy",
        element: <PrivacyPolicy />,
      },
      {
        path: "/my-orders",
        element: <OrderingPatientPage />,
      },
      {
        path: "/my-bookings",
        element: <MyBooking />,
      },
      {
        path: "/dashboard2",
        element: <GradeDashboard />,
      },
      {
        path: "/dashboard3",
        element: <StudentForm />,
      },
      {
        path: "/dashboard4",
        element: <StudentFee />,
      },
      {
        path: "/dash5",
        element: <StaffAttendance />,
      },
      {
        path: "/contact",
        element: <ContactPage/>,
      },
      //STUDENT
      {
        path: "/student",
        element: <StudentPage />,
      },
      {
        path: "/grade",
        element: <StudentGrade />,
      },
      {
        path: "/progress-graph",
        element: <ProgressGraph />,
      },
      {
        path: "/total-average",
        element: <TotalAverage />,
      },
      {
        path: "/student-fee",
        element: <StudentFeeGraph />,
      },
      {
        path: "/barcode",
        element: <BarcodePage/>,
      },
      {
        path: "/checkins",
        element: <CheckinsPage/>,
      },
      {
        path: "/speech",
        element: <SpeechToText/>,
      },
      //TEACHER
      {
        path: "/staffattendance",
        element: <AttendancePage />,
      },
      {
        path: "/teacherdashboard",
        element: <TeacherDashboard />,
      },
      {
        path: "/my-attendance",
        element: <StaffPage />,
      },
      {
        path: "/attendance",
        element: <StaffLog />,
      },
      {
        path: "/orders",
        element: <OrderPage />,
      },
      
      // Auth Protected routes
      {
        path: "/",
        element: <AuthProtectedRoute />,
        children: [
          {
            path: "/protected",
            element: <ProtectedPage />,
          },
          
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
