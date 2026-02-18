import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { rejectBookDto, createCategoryDto, updateCategoryDto, createAdminDto } from './admin.dto';
import { CollectionsController } from '../collections/collections.controller';
import {
  createCollectionDto,
  updateCollectionDto,
  addBookToCollectionDto,
} from '../collections/collections.dto';

const router = Router();
const controller = new AdminController();
const collectionsController = new CollectionsController();

// All admin routes require authentication + ADMIN role
router.use(authenticate, authorize('ADMIN'));

// Dashboard
router.get('/dashboard', (req, res, next) => {
  controller.getDashboard(req, res).catch(next);
});

// Users
router.get('/users', (req, res, next) => {
  controller.getUsers(req, res).catch(next);
});

router.get('/users/:id', (req, res, next) => {
  controller.getUserById(req, res).catch(next);
});

router.put('/users/:id/suspend', (req, res, next) => {
  controller.suspendUser(req, res).catch(next);
});

router.put('/users/:id/ban', (req, res, next) => {
  controller.banUser(req, res).catch(next);
});

router.put('/users/:id/activate', (req, res, next) => {
  controller.activateUser(req, res).catch(next);
});

router.post('/users/create-admin', validate(createAdminDto), (req, res, next) => {
  controller.createAdmin(req, res).catch(next);
});

router.put('/users/:id/promote', (req, res, next) => {
  controller.promoteUser(req, res).catch(next);
});

router.put('/users/:id/demote', (req, res, next) => {
  controller.demoteUser(req, res).catch(next);
});

router.delete('/users/:id', (req, res, next) => {
  controller.deleteUser(req, res).catch(next);
});

// Authors
router.get('/authors', (req, res, next) => {
  controller.getAuthors(req, res).catch(next);
});

router.put('/authors/:id/approve', (req, res, next) => {
  controller.approveAuthor(req, res).catch(next);
});

router.put('/authors/:id/reject', (req, res, next) => {
  controller.rejectAuthor(req, res).catch(next);
});

// Books
router.get('/books', (req, res, next) => {
  controller.getBooks(req, res).catch(next);
});

router.get('/books/:id', (req, res, next) => {
  controller.getBookById(req, res).catch(next);
});

router.put('/books/:id/approve', (req, res, next) => {
  controller.approveBook(req, res).catch(next);
});

router.put('/books/:id/reject', validate(rejectBookDto), (req, res, next) => {
  controller.rejectBook(req, res).catch(next);
});

router.put('/books/:id/suspend', (req, res, next) => {
  controller.suspendBook(req, res).catch(next);
});

router.get('/books/:id/download-link', (req, res, next) => {
  controller.getBookDownloadLink(req, res).catch(next);
});

// Categories
router.get('/categories', (req, res, next) => {
  controller.getCategories(req, res).catch(next);
});

router.post('/categories', validate(createCategoryDto), (req, res, next) => {
  controller.createCategory(req, res).catch(next);
});

router.put('/categories/:id', validate(updateCategoryDto), (req, res, next) => {
  controller.updateCategory(req, res).catch(next);
});

router.delete('/categories/:id', (req, res, next) => {
  controller.deleteCategory(req, res).catch(next);
});

// Collections
router.get('/collections', (req, res, next) => {
  collectionsController.getAllAdmin(req, res).catch(next);
});

router.post('/collections', validate(createCollectionDto), (req, res, next) => {
  collectionsController.create(req, res).catch(next);
});

router.put('/collections/:id', validate(updateCollectionDto), (req, res, next) => {
  collectionsController.update(req, res).catch(next);
});

router.delete('/collections/:id', (req, res, next) => {
  collectionsController.delete(req, res).catch(next);
});

router.post('/collections/:id/books', validate(addBookToCollectionDto), (req, res, next) => {
  collectionsController.addBook(req, res).catch(next);
});

router.delete('/collections/:id/books/:bookId', (req, res, next) => {
  collectionsController.removeBook(req, res).catch(next);
});

// Reviews
router.get('/reviews', (req, res, next) => {
  controller.getReviews(req, res).catch(next);
});

router.put('/reviews/:id/hide', (req, res, next) => {
  controller.hideReview(req, res).catch(next);
});

router.put('/reviews/:id/unhide', (req, res, next) => {
  controller.unhideReview(req, res).catch(next);
});

router.delete('/reviews/:id', (req, res, next) => {
  controller.deleteReview(req, res).catch(next);
});

// Transactions
router.get('/transactions', (req, res, next) => {
  controller.getTransactions(req, res).catch(next);
});

export default router;
