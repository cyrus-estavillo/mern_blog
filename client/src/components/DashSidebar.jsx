import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { Sidebar } from 'flowbite-react';
import { HiUser, HiArrowSmRight } from 'react-icons/hi';

import { signoutSuccess } from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';



export default function DashSidebar() {
    const location = useLocation();
    const [tab, setTab] = useState('');
    const dispatch = useDispatch();

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search); // location.search is the query string in the URL
        const tabFromUrl = urlParams.get('tab'); // get the value of the 'tab' query parameter aka www.example.com?tab=profile
        // console.log(tabFromUrl); 
        if (tabFromUrl) {
        setTab(tabFromUrl);
        }
    }, [location.search]);


    const handleSignout = async () => {
        try {
          const res = await fetch(`/server/user/signout`, {
            method: 'POST',
          });
    
          const data = await res.json();
          if (!res.ok) {
            console.log(data.message);
          }
          else {
            dispatch(signoutSuccess());
          }
        } catch (error) {
          console.log(error.message);
        }
    };

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

                <Sidebar.Item icon={HiArrowSmRight} className="cursor-pointer" onClick={handleSignout}>
                    Sign Out
                </Sidebar.Item>
            </Sidebar.ItemGroup>
        </Sidebar.Items>
    </Sidebar>
  )
}
