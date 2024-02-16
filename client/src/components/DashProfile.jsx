import { Alert, Button, TextInput } from 'flowbite-react';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { updateStart, updateSuccess, updateFailure } from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';

export default function DashProfile() {
  const {currentUser} = useSelector(state => state.user);

  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);

  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(0); // [0, 100]
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);

  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);

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
      uploadImage();
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
              value={imageFileUploadProgress} 
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
        <Button className='cursor-pointer text-5xl' type='delete' gradientMonochrome='failure' outline> Delete Account</Button>
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
    </div>
    
  )
}
