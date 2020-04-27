import { EventEmitter, Injectable, Inject } from "@angular/core";
import { HubConnection, HubConnectionBuilder } from "@aspnet/signalr";
import { Message } from "../models/Message";
@Injectable({
  providedIn: "root",
})
export class ChatService {
  messageReceived = new EventEmitter<Message>();
  connectionEstablished = new EventEmitter<Boolean>();
  private connectionIsEstablished = false;
  private _hubConnection: HubConnection;
  private baseUrl: string;
  private connectionId: any;
  constructor(@Inject("BASE_URL") baseUrl: string) {
    this.baseUrl = baseUrl;
    this.createConnection();
    this.registerOnServerEvents();
    this.startConnection();
  }
  sendMessage(message: Message) {
    this._hubConnection.invoke("NewMessage", message);
  }
  getConnectionId() {
    return this.connectionId;
  }
  private createConnection() {
    this._hubConnection = new HubConnectionBuilder()
      .withUrl("/MessageHub")
      .build();
  }
  private startConnection(): void {
    this._hubConnection
      .start()
      .then(() => {
        this.connectionIsEstablished = true;
        console.log("Hub connection started");
        this.connectionEstablished.emit(true);
        this.connectionId = this._hubConnection.invoke("GetConnectionId");
      })
      .catch((err) => {
        console.log("Error while establishing connection, retrying...");
        setTimeout(function () {
          this.startConnection();
        }, 5000);
      });
  }
  private registerOnServerEvents(): void {
    this._hubConnection.on("MessageReceived", (data: any) => {
      this.messageReceived.emit(data);
    });
  }
}
