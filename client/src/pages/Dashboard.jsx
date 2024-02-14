import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import DashSidebar from '../components/DashSidebar';
import DashProfile from '../components/DashProfile';

export default function Dashboard() {
  const location = useLocation();
  const [tab, setTab] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search); // location.search is the query string in the URL
    const tabFromUrl = urlParams.get('tab'); // get the value of the 'tab' query parameter aka www.example.com?tab=profile
    // console.log(tabFromUrl); 
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className = "md:w-56">
        {/* Sidebar */}
        <DashSidebar />
      </div>
        {/* Profile and Et Cetera*/}
        {tab === 'profile' && <DashProfile />}
      
    </div>
  )
}
