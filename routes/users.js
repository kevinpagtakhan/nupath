var
	userRouter = require('express').Router(),
	usersController = require("../controllers/users.js"),
	achievementsController = require('../controllers/achievements.js');

userRouter.route('/')
	 .get(usersController.index)
	 .post(usersController.create)

userRouter.route('/sign-s3')
	 .get(usersController.upload)

userRouter.route('/:id')
	  .get(usersController.show)
	  .patch(usersController.update)
	  .delete(usersController.delete);

userRouter.get('/new', usersController.new);

userRouter.get('/:id/edit', usersController.edit);

userRouter.get('/:id/threads', usersController.threads);

userRouter.route('/:id/achievements')
					.get(achievementsController.index)
					.post(achievementsController.create);

userRouter.route('/:id/achievements/:achId')
					.get(achievementsController.show)
					.patch(achievementsController.update)
					.delete(achievementsController.delete);

module.exports = userRouter;
