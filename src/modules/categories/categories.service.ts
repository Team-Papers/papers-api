import { CategoriesRepository } from './categories.repository';
import { NotFoundError } from '../../shared/errors/app-error';
import type { PaginationQuery } from '../../shared/utils/pagination';

export class CategoriesService {
  private categoriesRepository: CategoriesRepository;

  constructor() {
    this.categoriesRepository = new CategoriesRepository();
  }

  async getAll() {
    return this.categoriesRepository.findAll();
  }

  async getById(id: string) {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category');
    }
    return category;
  }

  async getBooksByCategory(categoryId: string, query: PaginationQuery) {
    const category = await this.categoriesRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundError('Category');
    }
    return this.categoriesRepository.findBooksByCategory(categoryId, query);
  }
}
