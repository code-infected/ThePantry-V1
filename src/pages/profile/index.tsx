import * as React from 'react';
import { User } from 'firebase/auth';
import { useState, useEffect, ChangeEvent } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Card from '@mui/material/Card';
import { useRouter } from 'next/router';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db, storage } from '../../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { LoadingButton } from '@mui/lab';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import UploadIcon from '@mui/icons-material/Upload';
import LockIcon from '@mui/icons-material/Lock';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const theme = createTheme({
  palette: {
    mode: 'dark',  // Enables dark mode
    primary: {
      main: '#bb86fc',
    },
    secondary: {
      main: '#03dac6',
    },
    background: {
      default: '#121212',  // Dark background
      paper: '#1e1e1e',  // Slightly lighter paper background
    },
    text: {
      primary: '#ffffff',  // White text
      secondary: '#b0b0b0',  // Light gray text
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

const modalStyle = {
  borderRadius: '8px',
  boxShadow: 24,
};

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<{ firstName: string; lastName: string; email: string; bio: string; socialMedia: string; photoURL?: string }>({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    socialMedia: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setLoading(true);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as { firstName: string; lastName: string; email: string; bio: string; socialMedia: string; photoURL?: string });
        }
        setLoading(false);
      } else {
        router.push('/auth/login');
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);

      // Cleanup
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [selectedFile]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, userData);
      setIsEditing(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (user) {
      const confirmation = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
      if (confirmation) {
        // Handle account deletion
      }
    }
  };

  const handlePasswordReset = () => {
    // Implement password reset logic
  };

  const handleUploadPicture = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFile(null); // Clear file selection on close
    setPreview(null); // Clear preview on close
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (selectedFile && user) {
      setLoading(true);
      try {
        const storageRef = ref(storage, `profile_pictures/${user.uid}`);
        await uploadBytes(storageRef, selectedFile);
        const photoURL = await getDownloadURL(storageRef);
        setUserData((prevData) => ({ ...prevData, photoURL }));
        await updateDoc(doc(db, 'users', user.uid), { photoURL });
        handleCloseDialog();
      } catch (error) {
        console.error("Error uploading file:", error);
      } finally {
        setLoading(false);
      }
    } else {
      console.error("No file selected or user not authenticated");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container component="main" maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Card variant="outlined" sx={{ width: '100%', p: 4, borderRadius: '12px', boxShadow: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              <Avatar
                src={userData.photoURL || ''}
                sx={{ width: 120, height: 120, mb: 2, border: '4px solid #bb86fc' }}
              />
             
              <Typography variant="h4" sx={{ mb: 1 }}>{userData.firstName} {userData.lastName}</Typography>
              <Typography variant="body1" color="textSecondary">{userData.email}</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 1 }}>{userData.bio}</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}> {userData.socialMedia}</Typography>
            </Box>
            <Box component="form" sx={{ mt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="First Name"
                    name="firstName"
                    value={userData.firstName}
                    onChange={handleInputChange}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    disabled={!isEditing}
                    sx={{ borderRadius: '4px' }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Last Name"
                    name="lastName"
                    value={userData.lastName}
                    onChange={handleInputChange}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    disabled={!isEditing}
                    sx={{ borderRadius: '4px' }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    disabled={!isEditing}
                    sx={{ borderRadius: '4px' }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Bio"
                    name="bio"
                    value={userData.bio}
                    onChange={handleInputChange}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    disabled={!isEditing}
                    sx={{ borderRadius: '4px' }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Social Media"
                    name="socialMedia"
                    value={userData.socialMedia}
                    onChange={handleInputChange}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    disabled={!isEditing}
                    sx={{ borderRadius: '4px' }}
                  />
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                {isEditing ? (
                  <Button variant="contained" color="primary" onClick={handleSave} sx={{ mr: 1 }}>
                    Save
                  </Button>
                ) : (
                  <Button variant="contained" color="secondary" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                )}
                <Button variant="outlined" color="error" onClick={handleDeleteAccount}>
                  Delete Account
                </Button>
                <Button variant="outlined" onClick={handlePasswordReset} sx={{ ml: 2 }}>
                  Reset Password
                </Button>
              </Box>
            </Box>
          </Card>
        </Box>
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Upload Profile Picture</DialogTitle>
          <DialogContent sx={modalStyle}>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {preview && <img src={preview} alt="Preview" style={{ width: '100%', marginTop: '10px' }} />}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Cancel
            </Button>
            <LoadingButton
              loading={loading}
              onClick={handleUpload}
              color="primary"
              startIcon={<UploadIcon />}
            >
              Upload
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}
