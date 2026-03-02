import { Router } from 'express';
import { nanoid } from 'nanoid';
import { sseService } from '../services/sseService.js';

const router = Router();

router.get('/events', (req, res) => {
  const clientId = nanoid(8);
  sseService.addClient(clientId, res);

  req.on('close', () => {
    sseService.removeClient(clientId);
  });
});

export default router;
