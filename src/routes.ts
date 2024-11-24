import { Express, NextFunction, Request, Response } from 'express';
import RestaurantRouter from './routes/restaurant.routes';
import SearchRouter from './routes/search.routes';
import { logger } from './utils/logger';

function routes(app: Express) {
  app.get('/', (_req: Request, res: Response) =>
    res.send(`Hello from MTOGO: Restaurant Service!`),
  );

  app.get('/healthcheck', (_req: Request, res: Response) =>
    res.sendStatus(200),
  );

  app.use('/api/restaurants', RestaurantRouter);

  app.use('/api/search', SearchRouter);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    const { method, originalUrl, ip } = req;

    if (err instanceof Error) {
      logger.error(`Error: ${err.message}`, {
        method,
        url: originalUrl,
        ip,
        stack: err.stack,
      });
      res.status(500).send('Internal Server Error');
    } else {
      logger.error('An unknown error occurred', {
        method,
        url: originalUrl,
        ip,
      });
      res.status(500).send('An unknown error occurred');
    }
  });

  // Catch unregistered routes
  app.all('*', (req: Request, res: Response) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
  });
}

export default routes;
