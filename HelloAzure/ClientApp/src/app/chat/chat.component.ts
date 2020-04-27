import { Component, OnInit, NgZone } from "@angular/core";
import { Message } from "../models/Message";
import { ChatService } from "../services/chat.service";
@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.css"],
})
export class ChatComponent implements OnInit {
  title = "ClientApp";
  txtMessage: string = "";
  uniqueID: string = new Date().getTime().toString();
  messages = new Array<Message>();
  message = new Message();
  connectionId: any;
  constructor(private chatService: ChatService, private _ngZone: NgZone) {
    this.subscribeToEvents();
   
  }
  sendMessage(): void {
    if (this.txtMessage) {
      this.connectionId = this.chatService.getConnectionId();
      this.message = new Message();
      this.message.clientuniqueid = this.uniqueID;
      this.message.type = "sent";
      this.message.message = this.txtMessage;
      this.message.date = new Date();
      this.message.hubConnectionId = this.connectionId.__zone_symbol__value;
      console.log(this.connectionId);
      this.messages.push(this.message);
      this.chatService.sendMessage(this.message);
      this.txtMessage = "";
    }
  }
  private subscribeToEvents(): void {
    this.chatService.messageReceived.subscribe((message: Message) => {
      this._ngZone.run(() => {
        if (message.clientuniqueid !== this.uniqueID) {
          message.type = "received";
          this.messages.push(message);
        }
      });
    });
  }
  ngOnInit() {
   
  }
}
