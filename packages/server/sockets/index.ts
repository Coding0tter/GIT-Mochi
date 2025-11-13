import { Server, Socket } from "socket.io";
import { logInfo } from "../utils/logger";

export class SocketHandler {
  private static instance: SocketHandler | null = null;
  private io: Server | null = null;

  private constructor() {}

  public static getInstance(): SocketHandler {
    if (!SocketHandler.instance) {
      SocketHandler.instance = new SocketHandler();
    }
    return SocketHandler.instance;
  }

  public init(server: any) {
    if (this.io) {
      console.log("Socket.IO is already initialized.");
      return;
    }

    this.io = new Server(server, {
      cors: {
        origin: "*",
      },
    });

    this.io.on("connection", (socket: Socket) => {
      console.log("New connection: " + socket.id);
      logInfo("New connection: " + socket.id);

      socket.on("ping", () => {
        socket.emit("pong");
      });

      socket.on("disconnect", () => {
        logInfo("Disconnected: " + socket.id);
      });
    });
  }

  public getIO(): Server {
    if (!this.io) {
      throw new Error("Socket.IO not initialized");
    }
    return this.io;
  }
}

export default SocketHandler;
