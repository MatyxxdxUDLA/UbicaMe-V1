const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');

class EventBus {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.exchanges = {
      USERS: 'ubicame.users',
      TASKS: 'ubicame.tasks', 
      LOCATIONS: 'ubicame.locations',
      AUTH: 'ubicame.auth',
      NOTIFICATIONS: 'ubicame.notifications'
    };
    this.queues = {
      USER_EVENTS: 'user_events',
      TASK_EVENTS: 'task_events',
      LOCATION_EVENTS: 'location_events',
      AUTH_EVENTS: 'auth_events',
      NOTIFICATION_EVENTS: 'notification_events',
      GATEWAY_ANALYTICS: 'gateway_analytics'
    };
  }

  async connect(url = 'amqp://localhost') {
    try {
      console.log('🔗 Conectando a RabbitMQ...');
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      
      // Crear exchanges
      for (const exchange of Object.values(this.exchanges)) {
        await this.channel.assertExchange(exchange, 'topic', { durable: true });
      }
      
      // Crear colas
      for (const queue of Object.values(this.queues)) {
        await this.channel.assertQueue(queue, { durable: true });
      }
      
      console.log('✅ EventBus conectado a RabbitMQ');
      return true;
    } catch (error) {
      console.error('❌ Error conectando a RabbitMQ:', error.message);
      console.log('⚠️  Continuando sin RabbitMQ (modo degradado)');
      return false;
    }
  }

  async publishEvent(exchange, routingKey, eventData) {
    try {
      if (!this.channel) {
        console.warn('⚠️  EventBus no conectado, saltando evento');
        return false;
      }

      const event = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: routingKey,
        data: eventData,
        source: process.env.SERVICE_NAME || 'unknown'
      };

      const message = Buffer.from(JSON.stringify(event));
      
      await this.channel.publish(exchange, routingKey, message, {
        persistent: true,
        messageId: event.id,
        timestamp: Date.now()
      });

      console.log(`📤 Evento publicado: ${routingKey}`, { eventId: event.id });
      return true;
    } catch (error) {
      console.error('❌ Error publicando evento:', error);
      return false;
    }
  }

  async subscribeToEvents(queue, exchange, routingKeys, handler) {
    try {
      if (!this.channel) {
        console.warn('⚠️  EventBus no conectado, no se puede suscribir');
        return false;
      }

      // Bind queue to exchange with routing keys
      for (const routingKey of routingKeys) {
        await this.channel.bindQueue(queue, exchange, routingKey);
      }

      await this.channel.consume(queue, async (msg) => {
        if (msg) {
          try {
            const event = JSON.parse(msg.content.toString());
            console.log(`📥 Evento recibido: ${event.type}`, { eventId: event.id });
            
            await handler(event);
            this.channel.ack(msg);
          } catch (error) {
            console.error('❌ Error procesando evento:', error);
            this.channel.nack(msg, false, false); // Dead letter
          }
        }
      });

      console.log(`✅ Suscrito a eventos: ${routingKeys.join(', ')}`);
      return true;
    } catch (error) {
      console.error('❌ Error suscribiéndose a eventos:', error);
      return false;
    }
  }

  // Métodos específicos para diferentes tipos de eventos
  async publishUserEvent(action, userData) {
    return this.publishEvent(
      this.exchanges.USERS,
      `user.${action}`,
      userData
    );
  }

  async publishTaskEvent(action, taskData) {
    return this.publishEvent(
      this.exchanges.TASKS,
      `task.${action}`,
      taskData
    );
  }

  async publishLocationEvent(action, locationData) {
    return this.publishEvent(
      this.exchanges.LOCATIONS,
      `location.${action}`,
      locationData
    );
  }

  async publishAuthEvent(action, authData) {
    return this.publishEvent(
      this.exchanges.AUTH,
      `auth.${action}`,
      authData
    );
  }

  async publishNotification(type, notificationData) {
    return this.publishEvent(
      this.exchanges.NOTIFICATIONS,
      `notification.${type}`,
      notificationData
    );
  }

  async subscribeToUserEvents(handler) {
    return this.subscribeToEvents(
      this.queues.USER_EVENTS,
      this.exchanges.USERS,
      ['user.*'],
      handler
    );
  }

  async subscribeToTaskEvents(handler) {
    return this.subscribeToEvents(
      this.queues.TASK_EVENTS,
      this.exchanges.TASKS,
      ['task.*'],
      handler
    );
  }

  async subscribeToLocationEvents(handler) {
    return this.subscribeToEvents(
      this.queues.LOCATION_EVENTS,
      this.exchanges.LOCATIONS,
      ['location.*'],
      handler
    );
  }

  async subscribeToAuthEvents(handler) {
    return this.subscribeToEvents(
      this.queues.AUTH_EVENTS,
      this.exchanges.AUTH,
      ['auth.*'],
      handler
    );
  }

  async subscribeToNotifications(handler) {
    return this.subscribeToEvents(
      this.queues.NOTIFICATION_EVENTS,
      this.exchanges.NOTIFICATIONS,
      ['notification.*'],
      handler
    );
  }

  async close() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      console.log('✅ EventBus desconectado');
    } catch (error) {
      console.error('❌ Error cerrando EventBus:', error);
    }
  }
}

// Singleton instance
const eventBus = new EventBus();

module.exports = eventBus; 