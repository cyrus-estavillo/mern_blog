import { Sidebar } from 'flowbite-react';
import { HiUser, HiArrowSmRight } from 'react-icons/hi';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function DashSidebar() {
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
    <Sidebar className="w-full md:w-56">
        <Sidebar.Items>
            <Sidebar.ItemGroup>
                <Link to='/dashboard?tab=profile'>
                    <Sidebar.Item 
                        active={tab === 'profile'} 
                        icon={HiUser} 
                        label={"User"} 
                        labelColor="dark"
                        as="div"
                    >
                        Profile
                    </Sidebar.Item>
                </Link>

                <Sidebar.Item icon={HiArrowSmRight} className="cursor-pointer">
                    Sign Out
                </Sidebar.Item>
            </Sidebar.ItemGroup>
        </Sidebar.Items>
    </Sidebar>
  )
}
