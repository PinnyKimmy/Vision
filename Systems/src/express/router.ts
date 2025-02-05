import { Router } from 'express';
import { systemsRouter } from './systems/routes.js';

export const appRouter = Router();

appRouter.use('/api/systems', systemsRouter);

appRouter.use(['/isAlive', '/isalive', '/health'], (_req, res) => {
    res.status(200).send('alive');
});

appRouter.use('*', (_req, res) => {
    res.status(404).send('Invalid Route');
});
