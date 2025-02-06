import { HttpClient } from '@angular/common/http';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { FileService } from 'src/app/core/services/file.service';
import * as JSZip from 'jszip';
import { SocketService } from 'src/app/core/services/socket.service';
import { Message, User } from 'src/app/core/interfaces/message';
import { user } from 'src/app/core/interfaces/user';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-bucket',
  templateUrl: './bucket.component.html',
  styleUrls: ['./bucket.component.css'],
})
export class BucketComponent implements OnInit {
  files: any[] = [];
  isUploadModalOpen: boolean = false;
  selectedFile: File | null = null;
  isPreviewOpen: boolean = false; // Flag to control modal visibility
  selectedFileURL: SafeResourceUrl = ''; // Use SafeUrl type
  fileType: string = '';
  selectedFiles: any[] = [];
  excelData: any[] = []; // Parsed data for xlsx files
  xlsxUrl: SafeResourceUrl = '';
  isChatOpen = false;
  isPrivateChat = false;
  showRoomList = false;
  message = '';
  onlineUsers: User[] = []; // List of online users
  roomNames: string[] = []; // Room names
  selectedUser: User | null = null; // Selected user for private chat
  messages: Message[] = []; // Store messages for the current chat
  currentRoom = ''; // Current room for group chat
  recipientId: string | null = ''; // ID of selected user for private chat
  curUser = '';
  backButtonVisible = false; // Flag to show back button
  chatName = ''; // Store the name of the selected user/room
  messagesByRoom: { [key: string]: Message[] } = {}; // Store messages by room name or user ID
  userRole = '';
  userBranch = '';
  // @Input() userRole?:string = '';
  // @Input() userBranch?:string = '';

  constructor(
    private fileService: FileService,
    private socketService: SocketService,
    private sanitizer: DomSanitizer,
    private auth:AuthService
  ) {
    this.socketService.authenticate();
  }

  ngOnInit() {

    this.auth.getUser().subscribe((response)=>{
      this.userRole = response.role;
      this.userBranch = response.branch;
      // Get files from the file service
      this.fileService.getFiles(this.userBranch).subscribe((data) => {
        console.log('in files bucket:' + this.userBranch);
        this.files = data; // Store files if needed
      });
    });
    // Listen to private messages
    this.socketService.onPrivateMessage().subscribe((message) => {

      if (!this.messagesByRoom[message.id]) {
        this.messagesByRoom[message.id] = [];
      }
      // console.log(this.recipientId);
      if (message.id != this.recipientId) 
      for (let i = 0; i < this.onlineUsers.length;i++)
      {
        if (this.onlineUsers[i].username === message.username)
        {
          
          console.log(this.onlineUsers[i].notification);
          this.onlineUsers[i].notification = this.onlineUsers[i].notification + 1;
          console.log(this.onlineUsers[i].notification);
          break;
        }   
      }
      this.messagesByRoom[message.id].push(message);
      console.log(this.messagesByRoom[message.id]);
    });

    this.socketService.userDetails().subscribe((response) => {
      console.log(response);
      this.curUser = response;
    });

    // Listen to group messages
    this.socketService.onGroupMessage().subscribe((message) => {
      if (!this.messagesByRoom[message.id]) {
        this.messagesByRoom[message.id] = [];
      }
      
      console.log('current user:' + this.curUser);
      if (message.username !== this.curUser) {
        this.messagesByRoom[message.id].push(message);
      }
    });

    // Listen to user status updates (online/offline)
    this.socketService.onUserStatus().subscribe((status) => {
      const user = this.onlineUsers.find((u) => u.username === status.username);
      if (user) {
        user.status = status.status; // Update the user's status
      } else {
        // Add the user if they are new and come online
        this.onlineUsers.push({
          username: status.username,
          status: status.status,
          color: status.color,
          id: status.id,
          notification: 0,
        });
      }
    });

    // Listen for the updated list of online users
    this.socketService.onUpdateOnlineUsers().subscribe((users) => {
      this.onlineUsers = [];
      for(let user of users)
      {
        this.onlineUsers.push({
          username: user.username,
          status: user.status,
          id: user.id,
          color: user.color,
          notification:0
        })
      }
     // this.onlineUsers = users; // Update the list of online users
    });

    // Listen to room updates (joining or creating rooms)
    this.socketService.onUpdateRooms().subscribe((rooms) => {
      this.roomNames = Object.keys(rooms); // Get room names
    });

    

    // Listen to notifications (e.g., file processed)
    this.socketService.onNotification().subscribe((notification) => {
      this.showNotification(notification.message);
    });
  }

  // Toggle chat window visibility
  toggleChatWindow() {
    this.isChatOpen = !this.isChatOpen;
    this.resetChatState(); // Reset the chat state when closing
  }

  // Show notification for events (e.g., file processed)
  showNotification(message: string): void {
    alert(message);
  }

  // Switch to private chat view
  switchToPrivateChat(): void {
    this.isPrivateChat = true;
    this.currentRoom = ''; // Clear current room for group chat
    this.messages = []; // Clear messages when switching to private chat
    this.chatName = this.selectedUser!.username; // Set chat name to selected user
    this.backButtonVisible = true; // Show back button
  }

  // Switch to group chat view
  switchToGroupChat(): void {
    this.isPrivateChat = false;
    this.currentRoom = 'general'; // Set to default room (or allow room names)
    this.messages = []; // Clear messages when switching to group chat
    this.chatName = this.currentRoom; // Set chat name to current room
    this.backButtonVisible = true; // Show back button
  }

  // Send message to the selected user (private or group chat)
  sendMessage(): void {
    if (this.recipientId) {
      if (this.message.trim()) {
        // Send private message
        this.socketService.sendPrivateMessage(this.recipientId, this.message);
        const messageToSend={
          username: 'You',
          msg: this.message,
          color: '#007bff',
          id:"7"
        };
        if (!this.messagesByRoom[this.recipientId])
          this.messagesByRoom[this.recipientId] = [];
        this.messagesByRoom[this.recipientId].push(messageToSend);
        
        this.message = ''; // Clear input after sending
      }
    } else {
      if (this.message.trim()) {
        // Send group message
        this.socketService.sendGroupMessage(this.currentRoom, this.message);
        const messageToSend = {
          username: 'You',
          msg: this.message,
          color: '#007bff',
          id:"7"
        };
        if (!this.messagesByRoom[this.currentRoom])
          this.messagesByRoom[this.currentRoom] = [];
        this.messagesByRoom[this.currentRoom].push(messageToSend);
        this.message = ''; // Clear input after sending
      }
    }
  }

  // Select a user to start a private chat
  selectUserForPrivateChat(user: User): void {
    this.selectedUser = user;
    this.recipientId = user.id; // Set the recipient ID for private messages
    this.messages = []; // Clear previous messages
    user.notification = 0;
    this.switchToPrivateChat(); // Switch to private chat view
  }

  // Join an existing room
  joinRoom(roomName: string): void {
    this.socketService.joinRoom(roomName);
    this.currentRoom = roomName; // Set the current room for group chat
    this.messages = []; // Clear private chat messages
    this.recipientId = null;
    this.chatName = roomName; // Set chat name to the room name
    this.backButtonVisible = true; // Show back button

    // Display a join room message
    this.socketService.sendGroupMessage(
      roomName,
      ` has joined the room.`
    );
  }

  // Create a new room
  createRoom(): void {
    const roomName = prompt('Enter new room name:');
    if (roomName) {
      this.socketService.createRoom(roomName);
      this.roomNames.push(roomName); // Add the new room to the list
    }
  }

  // Open the room list to allow room joining
  openJoinRoomModal(): void {
    this.showRoomList = !this.showRoomList;
  }

  // Back button action (go back to the previous state)
  goBack(): void {
    const curRoom = this.currentRoom;
    if (curRoom) {
      console.log(curRoom);
      this.socketService.sendGroupMessage(
        curRoom,
        ` has left the room.`
      );
            this.socketService.leaveRoom(curRoom);

    }
    this.resetChatState();
  }

  // Reset the chat state to default (for private or group chat view)
  resetChatState(): void {
    this.isPrivateChat = false;
    this.messages = [];
    this.recipientId = null;
    this.selectedUser = null;
    this.chatName = '';
    this.backButtonVisible = false;
    this.currentRoom = '';
  }

  onChatContainerClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  // Close the chat window if clicked outside
  @HostListener('document:click', ['$event'])
  closeChatOnOutsideClick(event: MouseEvent): void {
    const chatWindow = document.querySelector('.chat-window');
    const chatContainer = document.querySelector('.chat-container');
    if (
      this.isChatOpen &&
      chatWindow &&
      !chatWindow.contains(event.target as Node) &&
      !chatContainer?.contains(event.target as Node)
    ) {
      this.isChatOpen = false;
    }
  }

  toggleProductSelection(event: any, product: any): void {
    if (event.target.checked) {
      this.selectedFiles.push(product);
    } else {
      const index = this.selectedFiles.indexOf(product);
      if (index > -1) {
        this.selectedFiles.splice(index, 1);
      }
    }
  }

  downloadAll() {
    const zip = new JSZip();
    let filesToDownload = this.files;
    if (this.selectedFiles.length != 0) filesToDownload = this.selectedFiles;
    Promise.all(
      filesToDownload.map((file) => this.fetchAndAddFileToZip(file.url, zip))
    )
      .then(() => {
        zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
          const blob = content;
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'all_files.zip';
          link.click();
        });
      })
      .catch((error) => {
        console.error('Error downloading files:', error);
      });
  }

  fetchAndAddFileToZip(fileUrl: string, zip: any): Promise<void> {
    return new Promise((resolve, reject) => {
      fetch(fileUrl)
        .then((response) => response.blob())
        .then((blob) => {
          // Extract file name from URL
          const fileName = fileUrl.split('/').pop() || 'unnamed-file';

          zip.file(fileName, blob);

          resolve();
        })
        .catch((error) => {
          console.error('Error fetching file:', error);
          reject(error);
        });
    });
  }

  uploadFiles() {
    this.isUploadModalOpen = true;
    console.log(this.isUploadModalOpen);
  }

  closeModal() {
    this.isUploadModalOpen = false;
  }

  onFileSelected(event: any) {
    console.log('File selected event triggered');
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      console.log('File selected:', file.name);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragLeave() {}

  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.selectedFile = file;
      console.log(this.selectedFile);
      (document.getElementById('fileInput') as HTMLInputElement).files =
        event.dataTransfer.files;
    }
  }

  uploadFile() {
    if (this.selectedFile) {
      console.log('Uploading file:', this.selectedFile);
      this.upload(this.selectedFile);
    } else {
      alert('Please select a file to upload.');
    }
  }

  upload(file: File): void {
    this.fileService.uploadFile(file,this.userBranch).subscribe({
      next: (response: any) => {
        console.log('File uploaded successfully:', response.fileURL);

        this.fileService.getFiles(this.userBranch).subscribe((data) => {
          this.files = data;
          //console.log('files: ', this.files);
        });
        // this.fileService.add(response.fileURL);
        alert('file uploaded successfully!');
        this.isUploadModalOpen = false; // Close the modal
      },
      error: (err) => {
        console.error('Error uploading file:', err);
        alert('Error uploading file');
      },
    });
  }

  getFileName(url: string): string {
    const urlSegments = url.split('/');
    const fileNameWithQuery = urlSegments[urlSegments.length - 1];
    return fileNameWithQuery.split('?')[0];
  }

  getFileType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase(); // Extract the file extension
    if (['jpg', 'jpeg', 'png'].includes(extension!)) {
      return 'image';
    } else if (['mp4'].includes(extension!)) {
      return 'video';
    } else if (extension === 'pdf') {
      return 'pdf';
    } else if (extension === 'xlsx') {
      this.xlsxUrl = this.getOfficeViewerURL(url);
      return 'xlsx';
    } else {
      return 'other'; // For any unsupported file types
    }
  }

  getFormattedFileSize(size: number): string {
    if (size < 1024) {
      return `${size} Bytes`;
    } else if (size < 1048576) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else if (size < 1073741824) {
      return `${(size / 1048576).toFixed(2)} MB`;
    } else {
      return `${(size / 1073741824).toFixed(2)} GB`;
    }
  }

  getFileIcon(file: any): string {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    switch (fileExtension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'bi bi-file-earmark-image';
      case 'pdf':
        return 'bi bi-file-earmark-pdf';
      case 'doc':
      case 'docx':
        return 'bi bi-file-earmark-word';
      case 'xls':
      case 'xlsx':
        return 'bi bi-file-earmark-excel';
      case 'txt':
        return 'bi bi-file-earmark-text';
      default:
        return 'bi bi-file-earmark';
    }
  }

  getOfficeViewerURL(url: string): SafeUrl {
    const viewerURL = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
      url
    )}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(viewerURL);
  }

  showPreview(url: string): void {
    this.selectedFileURL = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.fileType = this.getFileType(url);

    this.isPreviewOpen = true;
  }

  closePreview(): void {
    this.isPreviewOpen = false;
  }

  async downloadSingleFile(fileUrl: string, fileName:string){
    const response = await fetch(fileUrl);
    const blob = await response.blob();
   const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  }
}
