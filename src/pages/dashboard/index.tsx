import * as React from 'react';
import { User } from 'firebase/auth';
import { useState, useEffect, ChangeEvent } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import CloseIcon from '@mui/icons-material/Close';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useRouter } from 'next/router';
import { collection, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, doc, getDoc } from 'firebase/firestore';
import { auth, db, storage } from '../../firebase/firebaseConfig'; // Adjust the import path as needed
import { onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f5f5f5',
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
    },
  },
});

interface PantryItem {
  id: string;
  userId: string;
  name: string;
  quantity: string;
  category?: string;
  expDate?: string;
  unit?: string;
  imageUrl?: string;
}

export default function Dashboard() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [newItem, setNewItem] = useState<Omit<PantryItem, 'id' | 'userId'>>({ name: '', quantity: '' });
  const [editItem, setEditItem] = useState<PantryItem | null>(null);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(`${userData.firstName} ${userData.lastName}`);
          setAvatarUrl(userData.avatarUrl || '/default-avatar.png');
        } else {
          setUserName(user.displayName || 'User');
        }
      } else {
        router.push('/auth/login');
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    if (user) {
      const q = search
        ? query(collection(db, 'pantryItems'), where('userId', '==', user.uid), where('name', '==', search))
        : query(collection(db, 'pantryItems'), where('userId', '==', user.uid));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const itemsData: PantryItem[] = snapshot.docs.map(doc => ({
          ...(doc.data() as Omit<PantryItem, 'id'>),
          id: doc.id
        }));
        setItems(itemsData);
      });

      return () => unsubscribe();
    }
  }, [user, search]);

  const handleLogout = () => {
    auth.signOut().then(() => {
      router.push('/auth/login');
    });
  };

  const handleAddItem = async () => {
    if (newItem.name && newItem.quantity && user) {
      let imageUrl = '';
  
      // Upload image if a file is selected
      if (imageFile) {
        try {
          console.log('Uploading image...');
          const imageRef = ref(storage, `pantryItems/${user.uid}/${imageFile.name}`);
          await uploadBytes(imageRef, imageFile);
          imageUrl = await getDownloadURL(imageRef);
          console.log('Image uploaded successfully:', imageUrl);
        } catch (error) {
          console.error('Image upload failed:', error);
          alert('Failed to upload image');
          return;
        }
      }
  
      const itemData = {
        ...newItem,
        userId: user.uid,
        imageUrl,
        category: newItem.category || '',
        expDate: newItem.expDate || '',
        unit: newItem.unit || ''
      };
  
      try {
        console.log('Adding item data:', itemData);
        await addDoc(collection(db, 'pantryItems'), itemData);
        setNewItem({ name: '', quantity: '' });
        setImageFile(null); // Reset the file input
      } catch (error) {
        console.error('Failed to add item:', error);
        alert('Failed to add item');
      }
    }
  };
  
  

  const handleUpdateItem = async () => {
    if (editItem && user) {
      let imageUrl = editItem.imageUrl;

      if (imageFile) {
        try {
          const imageRef = ref(storage, `pantryItems/${user.uid}/${imageFile.name}`);
          await uploadBytes(imageRef, imageFile);
          imageUrl = await getDownloadURL(imageRef);
        } catch (error) {
          console.error('Image upload failed:', error);
          alert('Failed to upload image');
          return;
        }
      }

      const itemRef = doc(db, 'pantryItems', editItem.id);
      const updatedItem = { ...editItem, imageUrl };

      try {
        await updateDoc(itemRef, updatedItem);
        setEditItem(null);
        setImageFile(null);
      } catch (error) {
        console.error('Failed to update item:', error);
        alert('Failed to update item');
      }
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const itemRef = doc(db, 'pantryItems', id);
      await deleteDoc(itemRef);
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item');
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (editItem) {
      setEditItem({ ...editItem, [e.target.name]: e.target.value });
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const removeImageFile = () => {
    setImageFile(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    router.push('/profile');
    handleMenuClose();
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: darkMode ? '#121212' : '#f5f5f5' }}>
        <AppBar position="fixed" sx={{ top: 0, left: 0, width: '100%', backgroundColor: darkMode ? '#333' : 'black', color: '#fff' }}>
          <Toolbar>
            <img src="/assets/logo.png" alt="Logo" style={{ height: '50px', marginRight: 'auto' }} />
            <TextField
              label="Search"
              value={search}
              onChange={handleSearchChange}
              variant="outlined"
              sx={{
                borderRadius: '20px',
                backgroundColor: darkMode ? '#424242' : '#ffffff',
                width: '270px',
                marginRight: '20px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: darkMode ? '#ffffff' : '#000000',
                  },
                  '&:hover fieldset': {
                    borderColor: darkMode ? '#ffffff' : '#000000',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: darkMode ? '#ffffff' : '#000000',
                  },
                },
                '& .MuiInputBase-input': {
                  color: darkMode ? '#ffffff' : '#000000',
                },
                '& .MuiInputLabel-root': {
                  color: darkMode ? '#ffffff' : '#000000',
                }
              }}
            />
            <IconButton onClick={toggleDarkMode} color="inherit">
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <IconButton onClick={handleMenuOpen} color="inherit">
              <Avatar src={avatarUrl || '/default-avatar.png'} alt="User Avatar" />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" sx={{ marginTop: '100px', marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              editItem ? handleUpdateItem() : handleAddItem();
            }}
            sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '40px' }}
          >
            <TextField
              label="Item Name"
              name="name"
              value={editItem ? editItem.name : newItem.name}
              onChange={editItem ? handleEditInputChange : handleInputChange}
              variant="outlined"
              sx={{ margin: '10px', width: '45%' }}
            />
            <TextField
              label="Quantity"
              name="quantity"
              value={editItem ? editItem.quantity : newItem.quantity}
              onChange={editItem ? handleEditInputChange : handleInputChange}
              variant="outlined"
              sx={{ margin: '10px', width: '45%' }}
            />
            <TextField
              label="Category"
              name="category"
              value={editItem ? editItem.category || '' : newItem.category || ''}
              onChange={editItem ? handleEditInputChange : handleInputChange}
              variant="outlined"
              sx={{ margin: '10px', width: '45%' }}
            />
            <TextField
              label="Expiration Date"
              name="expDate"
              type="date"
              value={editItem ? editItem.expDate || '' : newItem.expDate || ''}
              onChange={editItem ? handleEditInputChange : handleInputChange}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              sx={{ margin: '10px', width: '45%' }}
            />
            <TextField
              label="Unit"
              name="unit"
              value={editItem ? editItem.unit || '' : newItem.unit || ''}
              onChange={editItem ? handleEditInputChange : handleInputChange}
              variant="outlined"
              sx={{ margin: '10px', width: '45%' }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', margin: '10px', width: '45%' }}>
              <input
                accept="image/*"
                id="upload-image-file"
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <label htmlFor="upload-image-file">
                <Button variant="outlined" component="span" startIcon={<UploadIcon />}>
                  {imageFile ? imageFile.name : 'Upload Image'}
                </Button>
              </label>
              {imageFile && (
                <IconButton onClick={removeImageFile}>
                  <CloseIcon />
                </IconButton>
              )}
            </Box>
            <Button
  type="submit"
  variant="contained"
  sx={{
    width: '150px',
    height: '50px',
    backgroundColor: darkMode ? '#424242' : 'black',
    color: darkMode ? '#fff' : '#fff',
    marginTop: '10px',
    borderRadius: '10px',
    '&:hover': {
      backgroundColor: darkMode ? '#333' : '#333'
    }
  }}
>
  {editItem ? 'Update Item' : 'Add Item'}
</Button>

          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            {items.map((item) => (
              <Box
                key={item.id}
                sx={{
                  width: '300px',
                  border: '1px solid gray',
                  borderRadius: '10px',
                  padding: '20px',
                  margin: '10px',
                  boxShadow: 3,
                  backgroundColor: darkMode ? '#1e1e1e' : '#fff',
                  color: darkMode ? '#fff' : '#000'
                }}
              >
                {item.imageUrl && <img src={item.imageUrl} alt={item.name} style={{ width: '100%', borderRadius: '10px', marginBottom: '10px' }} />}
                <Box sx={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '18px' }}>{item.name}</Box>
                <Box sx={{ marginBottom: '10px' }}>Quantity: {item.quantity}</Box>
                <Box sx={{ marginBottom: '10px' }}>Category: {item.category}</Box>
                <Box sx={{ marginBottom: '10px' }}>Expiration Date: {item.expDate}</Box>
                <Box sx={{ marginBottom: '10px' }}>Unit: {item.unit}</Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <IconButton onClick={() => setEditItem(item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteItem(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
