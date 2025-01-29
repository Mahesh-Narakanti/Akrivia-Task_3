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

  authenticate(): void {
    const token = sessionStorage.getItem('token');
    if (token) {
      this.socket.emit('authenticate', token);
    }
  }

  sendMessage(message: string): void {
    this.socket.emit('chatMessage', message);
  }

  onMessage(): Observable<{ username: string; msg: string; color: string }> {
    return new Observable((observer) => {
      this.socket.on('chatMessage', (data) => {
        observer.next(data); // Emit the received chat message
      });
    });
  }


  onNotification(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('notification', (notification) => {
        observer.next(notification); // Emit notification data
      });
    });
  }
}
