import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'restaurant-service',
  brokers: ['kafka:9092', 'kafka:9093'],
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'restaurant-service-group' });
