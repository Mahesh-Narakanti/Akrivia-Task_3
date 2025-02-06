import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;
  private serverUrl: string = 'http://localhost:3000'; // Backend URL

  constructor() {
    this.socket = io(this.serverUrl);
  }

  // Authenticate the user by sending the token
  authenticate(): void {
    const token = sessionStorage.getItem('token');
    if (token) {
      this.socket.emit('authenticate', token);
    }
  }

  // Send a message (for group chat)
  sendGroupMessage(room: string, message: string): void {
    this.socket.emit('sendGroupMessage', room, message);
  }

  // Send a private message
  sendPrivateMessage(userId: string, message: string): void {
    this.socket.emit('sendPrivateMessage', userId, message);
  }

  // Join a room
  joinRoom(roomName: string): void {
    this.socket.emit('joinRoom', roomName);
  }

  // Leave a room
  leaveRoom(roomName: string): void {
    this.socket.emit('leaveRoom', roomName);
  }

  // Create a new room
  createRoom(roomName: string): void {
    this.socket.emit('createRoom', roomName);
  }

  userDetails(): Observable<string>{
    return new Observable((observer) => {
      this.socket.on("userName", (data) => {
        observer.next(data);
      })
    });
  }

  // Get group chat messages (received messages in rooms)
  onGroupMessage(): Observable<{
    username: string;
    msg: string;
    color: string;
    id: string;
  }> {
    return new Observable((observer) => {
      this.socket.on('receiveGroupMessage', (data) => {
        observer.next(data); // Emit the received group message
      });
    });
  }

  // Get private messages (messages from other users)
  onPrivateMessage(): Observable<{
    username: string;
    msg: string;
    color: string;
    id: string;
  }> {
    return new Observable((observer) => {
      this.socket.on('receivePrivateMessage', (data) => {
        observer.next(data); // Emit the received private message
      });
    });
  }

  // Listen for user status changes (online/offline)
  onUserStatus(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('userStatus', (status) => {
        observer.next(status); // Emit user status (online/offline)
      });
    });
  }

  // Listen for updates to rooms and their members
  onUpdateRooms(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('updateRooms', (rooms) => {
        observer.next(rooms); // Emit the updated list of rooms and their members
      });
    });
  }

  // Listen for room updates when users join or leave
  onRoomUpdated(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('roomUpdated', (members) => {
        observer.next(members); // Emit the updated list of members in a room
      });
    });
  }

  // Listen for notifications (e.g., file processing completion)
  onNotification(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('notification', (notification) => {
        observer.next(notification); // Emit notification data
      });
    });
  }

  // Listen for the list of online users
  onUpdateOnlineUsers(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('updateOnlineUsers', (onlineUsers) => {
        observer.next(onlineUsers); // Emit the list of online users
      });
    });
  }
}
