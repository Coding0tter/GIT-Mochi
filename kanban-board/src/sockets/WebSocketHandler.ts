import { io, Socket } from "socket.io-client";
import { setConnected } from "../stores/uiStore";
import { updateComments } from "../stores/taskStore";
import { TaskSockets } from "./taskSockets";

export class WebSocketHandler {
  private socket: Socket | null = null;
  private taskSockets: TaskSockets = new TaskSockets();
  private static instance: WebSocketHandler | null = null;

  private constructor() {}

  public static getInstance(): WebSocketHandler {
    if (!WebSocketHandler.instance) {
      WebSocketHandler.instance = new WebSocketHandler();
    }

    return WebSocketHandler.instance;
  }

  // Init function to start WebSocket connection
  public init(url: string) {
    if (this.socket) {
      console.log("WebSocket is already initialized.");
      return;
    }

    console.log("Initializing WebSocket connection...");
    this.socket = io(url);

    this.socket.on("connect", () => {
      if (this.socket) {
        setConnected(true);
      }
    });

    this.socket.on("disconnect", () => {
      if (this.socket) {
        setConnected(false);
      }
    });

    this.taskSockets.addListeners(this.socket);
  }
}

export default WebSocketHandler;
