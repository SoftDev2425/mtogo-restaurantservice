import { producer } from '../config/kafka.config';

export const produceMessage = async (topic: string, message: string) => {
  try {
    await producer.connect();
    await producer.send({
      topic,
      messages: [{ value: message }],
    });
    await producer.disconnect();
  } catch (error) {
    console.error('Error producing message:', error);
  }
};
