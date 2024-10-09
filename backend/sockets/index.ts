import { Server, Socket } from "socket.io";
import { logInfo } from "../utils/logger";

export class SocketHandler {
  private static instance: SocketHandler | null = null;
  private io: Server | null = null;

  private constructor() {} // Private constructor to prevent direct instantiation

  // Method to get the singleton instance
  public static getInstance(): SocketHandler {
    if (!SocketHandler.instance) {
      SocketHandler.instance = new SocketHandler();
    }
    return SocketHandler.instance;
  }

  // Init function to start the WebSocket connection
  public init(server: any) {
    if (this.io) {
      console.log("Socket.IO is already initialized.");
      return;
    }

    this.io = new Server(server, {
      cors: {
        origin: "*", // You can specify allowed origins here
      },
    });

    this.io.on("connection", (socket: Socket) => {
      console.log("New connection: " + socket.id);
      logInfo("New connection: " + socket.id);

      // Listen for ping events and respond with pong
      socket.on("ping", () => {
        console.log("Ping received from client. Sending pong...");
        socket.emit("pong");
      });

      socket.on("disconnect", () => {
        logInfo("Disconnected: " + socket.id);
      });
    });
  }

  // Method to get the io instance
  public getIO(): Server {
    if (!this.io) {
      throw new Error("Socket.IO not initialized");
    }
    return this.io;
  }
}

export default SocketHandler;
