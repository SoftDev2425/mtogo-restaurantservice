import { Response } from 'express';
import { CustomRequest } from '../types/CustomRequest';
import { ZodError } from 'zod';

// Helper: Common error handler
function handleError(error: unknown, res: Response) {
  if (error instanceof ZodError) {
    const errorMessages = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return res.status(400).json({ errors: errorMessages });
  } else if (error instanceof Error) {
    return res.status(400).json({ message: error.message });
  }

  console.error(error);
  return res.status(500).json({ message: 'Internal Server Error' });
}

// Helper: Format success response
function successResponse(
  res: Response,
  statusCode: number,
  message: string,
  data: object,
) {
  return res.status(statusCode).json({ message, ...data });
}

export default async function controllerWorkflow<T, R extends object>(
  req: CustomRequest,
  res: Response,
  options: {
    validateSchema?: (data: T) => void;
    sanitize?: (data: T) => T;
    serviceCall: (data: T) => Promise<R>;
    successMessage: string;
    successStatusCode?: number;
  },
) {
  try {
    // Step 1: Validation
    if (options.validateSchema) {
      options.validateSchema(req.body as T);
    }

    // Step 2: Sanitization
    const sanitizedData: T = options.sanitize
      ? options.sanitize(req.body as T)
      : (req.body as T);

    // Step 3: Service Call
    const result: R = await options.serviceCall(sanitizedData);

    // Step 4: Success Response
    return successResponse(
      res,
      options.successStatusCode ?? 200,
      options.successMessage,
      result,
    );
  } catch (error) {
    handleError(error, res);
  }
}
