import { TaskSockets } from "@client/sockets/taskSockets";
import { setConnected } from "@client/stores/uiStore";
import { Socket, io } from "socket.io-client";

export class WebSocketHandler {
  private socket: Socket | null = null;
  private taskSockets: TaskSockets = new TaskSockets();
  private static instance: WebSocketHandler | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectInterval: number = 5000;
  private heartbeatInterval: number = 25000;
  private heartbeatTimer: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): WebSocketHandler {
    if (!WebSocketHandler.instance) {
      WebSocketHandler.instance = new WebSocketHandler();
    }

    return WebSocketHandler.instance;
  }

  public init(url: string) {
    if (this.socket) {
      console.log("WebSocket is already initialized.");
      return;
    }

    console.log("Initializing WebSocket connection...");
    this.socket = io(url, {
      reconnection: false,
      transports: ["websocket"],
    });

    this.socket.on("connect", () => {
      console.log("WebSocket connected.");
      setConnected(true);
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    });

    this.socket.on("disconnect", () => {
      console.log("WebSocket disconnected.");
      setConnected(false);
      this.stopHeartbeat();
      this.reconnect();
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      this.stopHeartbeat();
      this.reconnect();
    });

    this.socket.on("reconnect_failed", () => {
      console.error("Reconnection failed.");
      setConnected(false);
      this.stopHeartbeat();
    });

    this.socket.on("pong", () => {});

    this.taskSockets.addListeners(this.socket);
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached. Giving up.");
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `Reconnecting attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`
    );

    setTimeout(() => {
      if (this.socket) {
        this.socket.connect();
      }
    }, this.reconnectInterval);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket && this.socket.connected) {
        this.socket.emit("ping");
      }
    }, this.heartbeatInterval) as NodeJS.Timeout;
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

export default WebSocketHandler;
