'use client';

import { useState } from 'react';
import { TextField, Button, Container, Typography, Paper, Grid } from '@mui/material';
import { useRouter } from 'next/navigation';

interface Ingredient {
  name: string;
  amount: string;
}

export default function RecipeRegister() {
  const router = useRouter();
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: '' }]);

  const handleIngredientChange = (index: number, field: 'name' | 'amount', value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      [field]: value,
    };
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '' }]);
  };

  const removeIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const recipe = {
      name: recipeName,
      ingredients: ingredients,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipe),
      });

      if (response.ok) {
        router.replace('/recipe');
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          配合登録
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="レシピ名"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                required
              />
            </Grid>
            
            {ingredients.map((ingredient, index) => (
              <Grid item xs={12} container spacing={2} key={index}>
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    label="材料名"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    label="量"
                    value={ingredient.amount}
                    onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={2}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeIngredient(index)}
                    fullWidth
                  >
                    削除
                  </Button>
                </Grid>
              </Grid>
            ))}
            
            <Grid item xs={12}>
              <Button
                variant="outlined"
                onClick={addIngredient}
                fullWidth
                sx={{ mb: 2 }}
              >
                材料を追加
              </Button>
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                登録
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}
