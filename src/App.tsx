import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Prayer from './pages/Prayer';
import Qibla from './pages/Qibla';
import Quran from './pages/Quran';
import SurahReader from './pages/SurahReader';
import Profile from './pages/Profile';
import Hadith from './pages/Hadith';
import Tajwid from './pages/Tajwid';
import Qada from './pages/Qada';
import Mosques from './pages/Mosques';
import Settings from './pages/Settings';
import Calendar from './pages/Calendar';
import Zakat from './pages/Zakat';
import Dua from './pages/Dua';
import Help from './pages/Help';
import Showcase from './pages/Showcase';
import Onboarding from './components/Onboarding';
import { useProfileStore } from './store/useProfileStore';

export default function App() {
  const { hasCompletedOnboarding } = useProfileStore();

  return (
    <>
      {!hasCompletedOnboarding && <Onboarding />}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="prayer" element={<Prayer />} />
            <Route path="qibla" element={<Qibla />} />
            <Route path="quran" element={<Quran />} />
            <Route path="quran/:id" element={<SurahReader />} />
            <Route path="profile" element={<Profile />} />
            <Route path="hadith" element={<Hadith />} />
            <Route path="tajwid" element={<Tajwid />} />
            <Route path="qada" element={<Qada />} />
            <Route path="mosques" element={<Mosques />} />
            <Route path="settings" element={<Settings />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="zakat" element={<Zakat />} />
            <Route path="duas" element={<Dua />} />
            <Route path="help" element={<Help />} />
            <Route path="showcase" element={<Showcase />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
