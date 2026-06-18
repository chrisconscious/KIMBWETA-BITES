import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { logger } from '../config/logger';
import { env } from '../config/env';

const Rooms = {
  campus: (id: string) => `campus:${id}`,
  user:   (id: string) => `user:${id}`,
  superAdmin: () => 'super_admin',
} as const;

class SocketService {
  private io: SocketIOServer | null = null;

  async initialize(httpServer: HttpServer): Promise<void> {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: env.CORS_ORIGINS.split(',').map(o => o.trim()),
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    // JWT auth middleware
    this.io.use((socket: Socket, next) => {
      const token = socket.handshake.auth.token as string | undefined;
      if (!token) return next(new Error('Authentication token required'));
      try {
        const payload = verifyAccessToken(token);
        socket.data.userId  = payload.sub;
        socket.data.role    = payload.role;
        socket.data.campusId = payload.campusId;
        next();
      } catch {
        next(new Error('Invalid token'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const { userId, role, campusId } = socket.data;
      logger.debug({ userId, role, socketId: socket.id }, 'Socket connected');

      void socket.join(Rooms.user(userId));
      if ((role === 'admin' || role === 'super_admin') && campusId) {
        void socket.join(Rooms.campus(campusId));
      }
      if (role === 'super_admin') {
        void socket.join(Rooms.superAdmin());
      }

      socket.on('disconnect', () => {
        logger.debug({ userId, socketId: socket.id }, 'Socket disconnected');
      });
    });

    logger.info('✅ Socket.io initialized (in-memory mode)');
  }

  emitToRoom(room: string, event: string, data: unknown): void {
    this.io?.to(room).emit(event, data);
  }

  emitNewOrder(campusId: string, order: unknown): void {
    this.io?.to(Rooms.campus(campusId)).emit('new_order', order);
    this.io?.to(Rooms.superAdmin()).emit('new_order', order);
  }

  emitOrderUpdate(userId: string, campusId: string, order: unknown): void {
    this.io?.to(Rooms.user(userId)).emit('order_updated', order);
    this.io?.to(Rooms.campus(campusId)).emit('order_updated', order);
  }
}

export const socketService = new SocketService();
