import axios from 'axios';
import { GOOGLE_MAPS_API_KEY } from './config';

export const geocodeAddress = async (address) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (response.data.status === 'OK') {
      const { lat, lng } = response.data.results[0].geometry.location;
      return {
        address: response.data.results[0].formatted_address,
        lat,
        lng,
      };
    } else {
      throw new Error('Nie udało się znaleźć lokalizacji');
    }
  } catch (error) {
    throw new Error('Błąd podczas geokodowania adresu: ' + error.message);
  }
};

export const calculateDistance = async (origin, destination) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
        origin
      )}&destinations=${encodeURIComponent(
        destination
      )}&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (response.data.status === 'OK') {
      const distance = response.data.rows[0].elements[0].distance;
      const duration = response.data.rows[0].elements[0].duration;
      return {
        distance: distance.text,
        duration: duration.text,
        distanceValue: distance.value,
        durationValue: duration.value, 
      };
    } else {
      throw new Error('Nie udało się obliczyć odległości');
    }
  } catch (error) {
    throw new Error('Błąd podczas obliczania odległości: ' + error.message);
  }
};

export const getPlacePredictions = async (input) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
      )}&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (response.data.status === 'OK') {
      return response.data.predictions.map((prediction) => ({
        description: prediction.description,
        placeId: prediction.place_id,
      }));
    } else {
      throw new Error('Nie udało się pobrać podpowiedzi adresów');
    }
  } catch (error) {
    throw new Error('Błąd podczas pobierania podpowiedzi adresów: ' + error.message);
  }
};