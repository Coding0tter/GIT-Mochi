import { io, Socket } from "socket.io-client";
import { setConnected } from "../stores/uiStore";
import { updateComments } from "../stores/taskStore";
import { TaskSockets } from "./taskSockets";

export class WebSocketHandler {
  private socket: Socket | null = null;
  private taskSockets: TaskSockets = new TaskSockets();
  private static instance: WebSocketHandler | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectInterval: number = 5000; // 5 seconds
  private heartbeatInterval: number = 25000; // 25 seconds
  private heartbeatTimer: NodeJS.Timeout | null = null;

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
    this.socket = io(url, {
      reconnection: false, // Disable default reconnection to use custom logic
      transports: ["websocket"], // Ensures it uses WebSocket only, not polling
    });

    this.socket.on("connect", () => {
      console.log("WebSocket connected.");
      setConnected(true);
      this.reconnectAttempts = 0; // Reset attempts on successful connection
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

  // Custom reconnection logic
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

  // Start heartbeat mechanism
  private startHeartbeat() {
    this.stopHeartbeat(); // Clear any existing interval
    this.heartbeatTimer = setInterval(() => {
      if (this.socket && this.socket.connected) {
        this.socket.emit("ping");
      }
    }, this.heartbeatInterval) as NodeJS.Timeout;
  }

  // Stop heartbeat mechanism
  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

export default WebSocketHandler;
