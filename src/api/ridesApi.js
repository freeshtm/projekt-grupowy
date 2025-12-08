import axios from 'axios';
import { buildUrl } from './config';

export const getAllRides = async (filters = {}) => {
  const params = {};

  if (filters.origin) {
    params.origin = filters.origin.toLowerCase();
  }

  if (filters.destination) {
    params.destination = filters.destination.toLowerCase();
  }

  if (filters.date) {
    params.date = filters.date;
  }

  const response = await axios.get(buildUrl('/rides'), { params });
  return response.data;
};

export const createRide = async (rideData) => {
  const response = await axios.post(buildUrl('/rides'), rideData);
  return response.data;
};

export const joinRide = async (rideId, passengerId) => {
  const response = await axios.post(buildUrl(`/rides/${rideId}/join`), {
    passenger_id: passengerId,
  });
  return response.data;
};

export const startRide = async (rideId, driverId, participantIds) => {
  const response = await axios.patch(buildUrl(`/rides/${rideId}/start`), {
    driver_id: driverId,
    participant_ids: participantIds,
  });
  return response.data;
};

export const completeRide = async (rideId, driverId) => {
  const response = await axios.patch(buildUrl(`/rides/${rideId}/complete`), {
    driver_id: driverId,
  });
  return response.data;
};

export const getParticipants = async (rideId) => {
  const response = await axios.get(buildUrl(`/rides/${rideId}/participants`));
  return response.data;
};

export const getAllParticipants = async () => {
  const response = await axios.get(buildUrl('/participants'));
  return response.data;
};

export const deleteRide = async (rideId) => {
  const response = await axios.delete(buildUrl('/rides'), {
    data: { id: rideId },
  });
  return response.data;
};

export const cancelRide = async (rideId, driverId) => {
  const response = await axios.patch(buildUrl(`/rides/${rideId}/cancel`), {
    driver_id: driverId,
  });
  return response.data;
};

export const leaveRide = async (rideId, passengerId) => {
  const response = await axios.post(buildUrl(`/rides/${rideId}/leave`), {
    passenger_id: passengerId,
  });
  return response.data;
};

export const getUserRides = async (userId, limit) => {
  const response = await axios.get(buildUrl(`/users/${userId}/rides`), {
    params: { limit },
  });
  return response.data;
};
