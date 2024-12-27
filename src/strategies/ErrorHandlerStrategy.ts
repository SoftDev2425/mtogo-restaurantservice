import { Prisma } from '@prisma/client';

interface ErrorHandlerStrategy {
  handle(error: unknown): void;
}

class DuplicateKeyErrorHandler implements ErrorHandlerStrategy {
  handle(error: Prisma.PrismaClientKnownRequestError): void {
    const target = error.meta?.target as string[];
    const targetString = target?.join(', ') || 'unknown fields(s)';
    throw new Error(
      `Could not complete operation: ${targetString} already exists.`,
    );
  }
}

class DefaultErrorHandler implements ErrorHandlerStrategy {
  handle(error: unknown): void {
    console.error('Unhandled error:', error);
    throw new Error('An unexpected error occurred.');
  }
}

export { ErrorHandlerStrategy, DuplicateKeyErrorHandler, DefaultErrorHandler };
