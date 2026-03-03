import api from './client';
import type { Room, RoomRequest } from '@/types';

export const getRooms = () =>
    api.get<Room[]>('/rooms').then((r) => r.data);

export const getRoom = (id: number) =>
    api.get<Room>(`/rooms/${id}`).then((r) => r.data);

export const createRoom = (body: RoomRequest) =>
    api.post<Room>('/rooms', body).then((r) => r.data);

export const updateRoom = (id: number, body: RoomRequest) =>
    api.put<Room>(`/rooms/${id}`, body).then((r) => r.data);

export const deleteRoom = (id: number) =>
    api.delete(`/rooms/${id}`);
