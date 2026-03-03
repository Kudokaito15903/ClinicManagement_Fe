import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import theme from './theme';
import AppLayout from './layouts/AppLayout';

// Pages
import DashboardPage from './pages/DashboardPage';
import PatientListPage from './pages/patients/PatientListPage';
import PatientFormPage from './pages/patients/PatientFormPage';
import PatientDetailPage from './pages/patients/PatientDetailPage';
import VisitFormPage from './pages/visits/VisitFormPage';
import VisitDetailPage from './pages/visits/VisitDetailPage';
import DoctorPage from './pages/doctors/DoctorPage';
import RoomPage from './pages/rooms/RoomPage';
import DiagnosisPage from './pages/diagnoses/DiagnosisPage';
import MedServicePage from './pages/medservices/MedServicePage';
import ReportPage from './pages/reports/ReportPage';

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <SnackbarProvider
                maxSnack={4}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                autoHideDuration={3500}
            >
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<AppLayout />}>
                            <Route index element={<Navigate to="/dashboard" replace />} />
                            <Route path="dashboard" element={<DashboardPage />} />

                            <Route path="patients" element={<PatientListPage />} />
                            <Route path="patients/new" element={<PatientFormPage />} />
                            <Route path="patients/:id/edit" element={<PatientFormPage />} />
                            <Route path="patients/:id" element={<PatientDetailPage />} />

                            <Route path="visits/new" element={<VisitFormPage />} />
                            <Route path="visits/:id/edit" element={<VisitFormPage />} />
                            <Route path="visits/:id" element={<VisitDetailPage />} />

                            <Route path="doctors" element={<DoctorPage />} />
                            <Route path="rooms" element={<RoomPage />} />
                            <Route path="diagnoses" element={<DiagnosisPage />} />
                            <Route path="services" element={<MedServicePage />} />

                            <Route path="reports" element={<ReportPage />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </SnackbarProvider>
        </ThemeProvider>
    );
}
