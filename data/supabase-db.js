const supabase = require('../config/supabase');

// Get all photos
const getPhotos = async () => {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching photos:', error);
    throw error;
  }
};

// Get photo by ID
const getPhotoById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching photo:', error);
    throw error;
  }
};

// Add photo
const addPhoto = async (photo) => {
  try {
    const { data, error } = await supabase
      .from('photos')
      .insert([
        {
          title: photo.title,
          description: photo.description || '',
          drive_id: photo.driveId,
          image_url: photo.imageUrl,
          category_id: photo.categoryId,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;
    
    if (data && data[0]) {
      return {
        id: data[0].id,
        title: data[0].title,
        description: data[0].description,
        driveId: data[0].drive_id,
        imageUrl: data[0].image_url,
        categoryId: data[0].category_id,
        createdAt: data[0].created_at
      };
    }
  } catch (error) {
    console.error('Error adding photo:', error);
    throw error;
  }
};

// Update photo
const updatePhoto = async (id, updates) => {
  try {
    const updateData = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.driveId) updateData.drive_id = updates.driveId;
    if (updates.imageUrl) updateData.image_url = updates.imageUrl;
    if (updates.categoryId) updateData.category_id = updates.categoryId;

    const { data, error } = await supabase
      .from('photos')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    
    if (data && data[0]) {
      return {
        id: data[0].id,
        title: data[0].title,
        description: data[0].description,
        driveId: data[0].drive_id,
        imageUrl: data[0].image_url,
        categoryId: data[0].category_id,
        createdAt: data[0].created_at
      };
    }
  } catch (error) {
    console.error('Error updating photo:', error);
    throw error;
  }
};

// Delete photo
const deletePhoto = async (id) => {
  try {
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
};

// Get all categories
const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Get category by ID
const getCategoryById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};

// Add category
const addCategory = async (category) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([
        {
          name: category.name,
          icon: category.icon || '📁',
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;
    
    if (data && data[0]) {
      return {
        id: data[0].id,
        name: data[0].name,
        icon: data[0].icon,
        createdAt: data[0].created_at
      };
    }
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

// Update category
const updateCategory = async (id, updates) => {
  try {
    const updateData = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.icon) updateData.icon = updates.icon;

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    
    if (data && data[0]) {
      return {
        id: data[0].id,
        name: data[0].name,
        icon: data[0].icon,
        createdAt: data[0].created_at
      };
    }
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

// Delete category
const deleteCategory = async (id) => {
  try {
    // First delete all photos in this category
    await supabase
      .from('photos')
      .delete()
      .eq('category_id', id);

    // Then delete the category
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

module.exports = {
  getPhotos,
  getPhotoById,
  addPhoto,
  updatePhoto,
  deletePhoto,
  getCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory
};
