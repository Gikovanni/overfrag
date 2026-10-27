import { defineRoom } from '@colyseus/core';
import { NETWORK } from '@overfrag/shared';
import { GameRoom } from '../rooms/GameRoom.js';

export const rooms = { [NETWORK.roomName]: defineRoom(GameRoom) };
