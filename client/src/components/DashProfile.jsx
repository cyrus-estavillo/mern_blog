import { Button, TextInput } from 'flowbite-react';
import { useSelector } from 'react-redux';

export default function DashProfile() {
  const {currentUser} = useSelector(state => state.user);

  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">Profile</h1>
      <form className="flex flex-col gap-4">
        <div className="w-64 h-64 self-center cursor-pointer shadow-md overflow-hidden rounded-full">
          <img src={currentUser.profilePicture} alt="user" className="rounded-full w-full h-full border-8 object-cover border-[lightgray]"/>
        </div>

        <TextInput type="text" id="username" placeholder="username" defaultValue={currentUser.username}/>
        <TextInput type="email" id="email" placeholder="email" defaultValue={currentUser.email}/>
        <TextInput type="password" id="password" placeholder="password"/>

        <Button type='submit' gradientDuoTone='purpleToBlue' outline>
          Update
        </Button>
      </form>
      <div className="text-red-500 flex justify-between mt-5">
        <Button className='cursor-pointer text-5xl' type='delete' gradientMonochrome='failure' outline> Delete Account</Button>
        <Button className='cursor-pointer text-5xl' type='delete' gradientMonochrome='failure' outline> Sign Out</Button>
      </div>
    </div>
    
  )
}
