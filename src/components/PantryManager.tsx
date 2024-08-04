// /src/components/PantryManager.tsx
import * as React from 'react';
import { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig'; // Adjust the import path as needed
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Button, TextField, Typography, Grid, Box, Paper } from '@mui/material';

// Define the PantryItem type
interface PantryItem {
  id?: string;
  name: string;
  quantity: number;
}

const PantryManager: React.FC = () => {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [newItem, setNewItem] = useState<PantryItem>({ name: '', quantity: 0 });
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);

  // Fetch items from Firestore
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'pantryItems'));
        const itemsList: PantryItem[] = [];
        querySnapshot.forEach((doc) => {
          itemsList.push({ id: doc.id, ...doc.data() } as PantryItem);
        });
        setItems(itemsList);
      } catch (error) {
        console.error('Error fetching items: ', error);
      }
    };

    fetchItems();
  }, []);

  // Add a new item to Firestore
  const handleAddItem = async () => {
    if (!newItem.name || newItem.quantity <= 0) return;

    try {
      const docRef = await addDoc(collection(db, 'pantryItems'), newItem as { [key: string]: any });
      setItems([...items, { ...newItem, id: docRef.id }]);
      setNewItem({ name: '', quantity: 0 });
    } catch (error) {
      console.error('Error adding item: ', error);
    }
  };

  // Edit an existing item
  const handleEditItem = (item: PantryItem) => {
    setEditingItem(item);
  };

  // Update an existing item in Firestore
  const handleUpdateItem = async () => {
    if (!editingItem || !editingItem.id) return;

    try {
      const itemRef = doc(db, 'pantryItems', editingItem.id);
      await updateDoc(itemRef, editingItem as { [key: string]: any });
      setItems(items.map(item => item.id === editingItem.id ? editingItem : item));
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item: ', error);
    }
  };

  // Delete an item from Firestore
  const handleDeleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'pantryItems', id));
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item: ', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
      </Typography>
      <Box component="form" noValidate sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Item Name"
              variant="outlined"
              fullWidth
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Quantity"
              variant="outlined"
              type="number"
              fullWidth
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
            />
          </Grid>
        </Grid>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddItem}
          sx={{ mt: 2 }}
        >
          Add Item
        </Button>
      </Box>

      {editingItem && (
        <Box component="form" noValidate sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Edit Item
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Item Name"
                variant="outlined"
                fullWidth
                value={editingItem.name}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Quantity"
                variant="outlined"
                type="number"
                fullWidth
                value={editingItem.quantity}
                onChange={(e) => setEditingItem({ ...editingItem, quantity: Number(e.target.value) })}
              />
            </Grid>
          </Grid>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateItem}
            sx={{ mt: 2 }}
          >
            Update Item
          </Button>
        </Box>
      )}

      <Typography variant="h5" gutterBottom>
        Current Pantry Items
      </Typography>
      {items.map(item => (
        <Paper key={item.id} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">{item.name}</Typography>
          <Typography>Quantity: {item.quantity}</Typography>
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleDeleteItem(item.id!)}
          >
            Delete
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleEditItem(item)}
            sx={{ ml: 2 }}
          >
            Edit
          </Button>
        </Paper>
      ))}
    </Box>
  );
};

export default PantryManager;
