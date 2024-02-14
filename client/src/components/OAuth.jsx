import { Button } from 'flowbite-react';
import { AiFillGoogleCircle } from 'react-icons/ai';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';

export default function OAuth() {
    const auth = getAuth(app);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleGoogleClick = async () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' }); // force google to always ask for account selection
        try {
            const resultsFromGoogle = await signInWithPopup(auth, provider);
            const res = await fetch(`/server/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: resultsFromGoogle.user.displayName,
                    email: resultsFromGoogle.user.email,
                    googlePhotoUrl: resultsFromGoogle.user.photoURL,
                }),
            })

            const data = await res.json(); // data from server
            if (res.ok) {
                dispatch(signInSuccess(data)); // update redux storage with successful sign in
                navigate('/'); // redirect to home page
            }
        } catch (error) {
            console.log(error);
        }
    }

  return (
    <Button type='button' gradientDuoTone='pinkToOrange' outline 
    onClick={handleGoogleClick}>
        <AiFillGoogleCircle className='w-6 h-6 mr-2' />
        Continue with Google
    </Button>
  )
}
