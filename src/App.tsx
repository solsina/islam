import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Prayer from './pages/Prayer';
import Qibla from './pages/Qibla';
import Quran from './pages/Quran';
import SurahReader from './pages/SurahReader';
import Hub from './pages/Hub';
import Hadith from './pages/Hadith';
import Tajwid from './pages/Tajwid';
import Qada from './pages/Qada';
import Mosques from './pages/Mosques';
import Settings from './pages/Settings';
import Calendar from './pages/Calendar';
import Zakat from './pages/Zakat';
import Dua from './pages/Dua';
import Help from './pages/Help';
import ProphetsLibrary from './pages/ProphetsLibrary';
import WuduGuide from './pages/WuduGuide';
import SalahGuide from './pages/SalahGuide';
import Learn from './pages/Learn';
import Onboarding from './components/Onboarding';
import { useProfileStore } from './store/useProfileStore';
import GamificationManager from './GamificationManager';

export default function App() {
  const { hasCompletedOnboarding } = useProfileStore();

  return (
    <>
      {!hasCompletedOnboarding && <Onboarding />}
      <GamificationManager />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="prayer" element={<Prayer />} />
            <Route path="qibla" element={<Qibla />} />
            <Route path="quran" element={<Quran />} />
            <Route path="quran/:id" element={<SurahReader />} />
            <Route path="hub" element={<Hub />} />
            <Route path="profile" element={<Hub />} />
            <Route path="hadith" element={<Hadith />} />
            <Route path="learn" element={<Learn />} />
            <Route path="tajwid" element={<Tajwid />} />
            <Route path="qada" element={<Qada />} />
            <Route path="mosques" element={<Mosques />} />
            <Route path="settings" element={<Settings />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="zakat" element={<Zakat />} />
            <Route path="duas" element={<Dua />} />
            <Route path="help" element={<Help />} />
            <Route path="prophets" element={<ProphetsLibrary />} />
            <Route path="wudu-guide" element={<WuduGuide />} />
            <Route path="salah-guide" element={<SalahGuide />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
