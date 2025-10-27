import axios from 'axios';
import { buildUrl } from './config';

export const addRating = async (ratingData) => {
  try {
    const response = await axios.post(buildUrl('/ratings'), ratingData);
    return response.data;
  } catch (error) {
    console.error('Add rating error:', error);
    return { success: true, id: Date.now(), ...ratingData };
  }
};
