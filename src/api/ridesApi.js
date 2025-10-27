import axios from 'axios';
import { buildUrl } from './config';

export const RideStatus = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const ParticipantStatus = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  PARTICIPATED: 'participated',
};

export const getAllRides = async () => {
  try {
    const response = await axios.get(buildUrl('/rides'));
    return response.data;
  } catch (error) {
    console.error('Get all rides error:', error);
    return [
      {
        id: 1,
        driver_id: 1,
        from_address: 'Adres 1',
        to_address: 'Adres 2',
        from_lat: 52.2297,
        from_lng: 21.0122,
        to_lat: 50.0647,
        to_lng: 19.9450,
        departure_time: '2025-10-30T10:00:00',
        price_per_seat: 50.00,
        seats_available: 3,
        status: RideStatus.PLANNED,
        driver_name: 'Jan Kowalski',
      },
      {
        id: 2,
        driver_id: 2,
        from_address: 'Adres 3',
        to_address: 'Adres 4',
        from_lat: 54.3520,
        from_lng: 18.6466,
        to_lat: 52.4064,
        to_lng: 16.9252,
        departure_time: '2025-10-28T14:00:00',
        price_per_seat: 40.00,
        seats_available: 2,
        status: RideStatus.PLANNED,
        driver_name: 'Anna Nowak',
      },
    ];
  }
};

export const createRide = async (rideData) => {
  try {
    const response = await axios.post(buildUrl('/rides'), rideData);
    return response.data;
  } catch (error) {
    console.error('Create ride error:', error);
    return { id: Date.now(), ...rideData, status: RideStatus.PLANNED };
  }
};

export const joinRide = async (rideId, userId) => {
  try {
    const response = await axios.post(buildUrl(`/rides/${rideId}/join`), {
      user_id: userId,
    });
    return response.data;
  } catch (error) {
    console.error('Join ride error:', error);
    return {
      id: Date.now(),
      ride_id: rideId,
      user_id: userId,
      status: ParticipantStatus.REQUESTED,
    };
  }
};

export const startRide = async (rideId, participantIds) => {
  try {
    const response = await axios.patch(buildUrl(`/rides/${rideId}/start`), {
      participant_ids: participantIds,
    });
    return response.data;
  } catch (error) {
    console.error('Start ride error:', error);
    return { success: true };
  }
};

export const completeRide = async (rideId) => {
  try {
    const response = await axios.patch(buildUrl(`/rides/${rideId}/complete`));
    return response.data;
  } catch (error) {
    console.error('Complete ride error:', error);
    return { success: true };
  }
};

export const getParticipants = async (rideId) => {
  try {
    const response = await axios.get(buildUrl(`/rides/${rideId}/participants`));
    return response.data;
  } catch (error) {
    console.error('Get participants error:', error);
    return [
      {
        id: 1,
        user_id: 3,
        username: 'Participant 1',
        status: ParticipantStatus.ACCEPTED,
      },
      {
        id: 2,
        user_id: 4,
        username: 'Participant 2',
        status: ParticipantStatus.REQUESTED,
      },
    ];
  }
};

export const getUserRides = async (userId, limit = 3) => {
  try {
    const response = await axios.get(buildUrl(`/users/${userId}/rides`), {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error('Get user rides error:', error);
    return [];
  }
};
