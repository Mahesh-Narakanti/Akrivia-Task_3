// src/app/socket.service.ts
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

  // Send JWT token to the server for authentication
  authenticate(): void {
    const token = sessionStorage.getItem('token');
    if (token) {
      this.socket.emit('authenticate', token); // Emit authenticate event with token
    }
  }

  // Send a chat message
  sendMessage(message: string): void {
    this.socket.emit('chatMessage', message); // Emit chat message event
  }

  // Listen for incoming messages
    onMessage(): Observable<{ username: string; msg: string; color:string }> {
    return new Observable((observer) => {
      this.socket.on('chatMessage', (data) => {
        observer.next(data); // Emit the received chat message
      });
    });
  }

  // Listen for authentication success or failure
  onAuthentication(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('authenticated', (data) => {
        observer.next(data); // Emit successful authentication data
      });

      this.socket.on('error', (error) => {
        observer.error(error); // Handle authentication failure
      });
    });
  }

  // Listen for notifications
  onNotification(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('notification', (notification) => {
        observer.next(notification); // Emit notification data
      });
    });
  }
}
