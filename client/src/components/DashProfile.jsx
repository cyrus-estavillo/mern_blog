import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Button, Modal, TextInput } from 'flowbite-react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

import { app } from '../firebase';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';

import { useDispatch } from 'react-redux';
import { 
  updateStart, 
  updateSuccess, 
  updateFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
} from '../redux/user/userSlice';


export default function DashProfile() {
  const {currentUser, error } = useSelector(state => state.user);

  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);

  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(0); // [0, 100]
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);

  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({});
  const dispatch = useDispatch();
  const filePickerRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    // if the file exists
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file)); // this is created in the browser, not on the server
    }
  };

  useEffect(() => {
    if (imageFile) {
      uploadImage;
    }
  }, [imageFile]);


  const uploadImage = async () => {
    setImageFileUploading(true);
    setImageFileUploadError(null);
    const storage = getStorage(app); // app exported from firebase.js
    const fileName = new Date().getTime() + imageFile.name; // imageFile.name by itself is not unique, so we use time
    const storageRef = ref(storage, fileName); // create a reference to the file in the storage
    const uploadTask = uploadBytesResumable(storageRef, imageFile); // upload file to storage and get info about it as we upload
    uploadTask.on(
      'state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageFileUploadProgress(progress.toFixed(0)); // this has decimals, so we want to round it
      },
      (error) => {
        setImageFileUploadError('Could not upload image (file must be less than 2MB).');
        setImageFileUploadProgress(null);
        setImageFile(null);
        setImageFileUrl(null);
        setImageFileUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setFormData({ ...formData, profilePicture: downloadURL });
          setImageFileUploading(false);
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  };


  const handleSubmit = async(e) => {
    e.preventDefault();
    setUpdateUserSuccess(null);
    setUpdateUserError(null);
    if (Object.keys(formData).length === 0) {
      setUpdateUserError('No changes detected');
      return;
    }
    if (imageFileUploading) {
      setUpdateUserError('Please wait for the image to upload');
      return;
    }
    try {
      dispatch(updateStart());
      const res = await fetch(`/server/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(updateFailure(data.message));
        setUpdateUserError(error.message);
      } else {
        dispatch(updateSuccess(data));
        setUpdateUserSuccess("User's profile updated successfully");
      }

    } catch (error) {
      dispatch(updateFailure(error.message));
    }
  };


  const handleDeleteUser = async () => {
    setShowModal(false);
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/server/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        dispatch(deleteUserFailure(data.message));
      }
      else {
        dispatch(deleteUserSuccess(data));
      }

    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input 
          type="file" 
          accept='image/*' 
          onChange={handleImageChange} 
          ref={filePickerRef}
          hidden
        />
        <div 
          className="relative w-64 h-64 self-center cursor-pointer shadow-md overflow-hidden rounded-full" 
          onClick={() => filePickerRef.current.click()}
        >
          {imageFileUploadProgress && (
            <CircularProgressbar 
              value={imageFileUploadProgress || 0} 
              strokeWidth={5}
              styles={{
                root:{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                },
                path: {
                  stroke: `rgba(33, 138, 255, ${imageFileUploadProgress / 100})`,
                },
              }}
            />
          )}
          <img 
            src={ imageFileUrl || currentUser.profilePicture } 
            alt="user" 
            className={`rounded-full w-full h-full object-cover border-2 border-[lightgray]
                        ${imageFileUploadProgress && imageFileUploadProgress < 100 && 'opacity-60'}`}
          />
        </div>
        {imageFileUploadError && (
          <Alert color='failure'>
            {imageFileUploadError}
          </Alert>
        )}
        

        
        
        <TextInput 
          type="text" 
          id="username" 
          placeholder="username" 
          defaultValue={currentUser.username}
          onChange={handleChange}
        />
        <TextInput 
          type="email" 
          id="email" 
          placeholder="email"
          defaultValue={currentUser.email}
          onChange={handleChange}
        />
        <TextInput 
          type="password" 
          id="password" 
          placeholder="password"
          onChange={handleChange}
        />


        <Button type='submit' gradientDuoTone='purpleToBlue' outline>
          Update
        </Button>
      </form>
      <div className="text-red-500 flex justify-between mt-5">
        <Button 
          className='cursor-pointer text-5xl' 
          type='delete' gradientMonochrome='failure' 
          outline onClick={() => setShowModal(true)}
        > 
        Delete Account
        </Button>
        <Button className='cursor-pointer text-5xl' type='delete' gradientMonochrome='failure' outline> Sign Out</Button>
      </div>
      {updateUserSuccess && (
        <Alert className='mt-5' color='success'>
          {updateUserSuccess}
        </Alert>
      )}

      {updateUserError && (
        <Alert className='mt-5' color='failure'>
          {updateUserError}
        </Alert>
      )}

      {error && (
        <Alert className='mt-5' color='failure'>
          {error}
        </Alert>
      )}

      <Modal 
        show={showModal} 
        onClose={() => setShowModal(false)} 
        popup 
        size='md'
      >
        <Modal.Header />
          <Modal.Body>
            <div className='text-center'>
              <HiOutlineExclamationCircle className='h-14 w-14 text-grey-400 dark:text-gray-200 mb-4 mx-auto'/>
              <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>Are you sure you want to delete your account?</h3>
            </div>

            <div className='flex justify-center gap-4'>
              <Button color='failure' onClick={handleDeleteUser}>Yes, I&apos;m sure.</Button>
              <Button color='gray' onClick={() => setShowModal(false)}>No, cancel.</Button>
            </div>
          </Modal.Body>
      </Modal>
    </div>
    
  )
}
