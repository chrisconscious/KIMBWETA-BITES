import { Router } from 'express';
import { followingController } from './following.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

const c = followingController;

router.get('/following', c.getFollowing.bind(c));
router.get('/followers', c.getFollowers.bind(c));
router.post('/:userId', c.follow.bind(c));
router.delete('/:userId', c.unfollow.bind(c));

export default router;
