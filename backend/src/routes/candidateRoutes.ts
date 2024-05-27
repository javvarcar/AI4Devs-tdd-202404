import { Router } from 'express';
import { addCandidateController, getCandidateController } from '../presentation/controllers/candidateController';

const router = Router();

router.post('/', addCandidateController);

router.get('/:id', getCandidateController);

export default router;
