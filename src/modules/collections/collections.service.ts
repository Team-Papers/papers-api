import { CollectionsRepository } from './collections.repository';
import { NotFoundError, BadRequestError } from '../../shared/errors/app-error';

export class CollectionsService {
  private collectionsRepository: CollectionsRepository;

  constructor() {
    this.collectionsRepository = new CollectionsRepository();
  }

  // Public
  async getAll() {
    return this.collectionsRepository.findAll();
  }

  async getById(id: string) {
    const collection = await this.collectionsRepository.findById(id);
    if (!collection) {
      throw new NotFoundError('Collection');
    }
    return collection;
  }

  // Admin
  async getAllAdmin() {
    return this.collectionsRepository.findAllAdmin();
  }

  async create(data: {
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    orderIndex?: number;
  }) {
    return this.collectionsRepository.create(data);
  }

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      imageUrl?: string;
      orderIndex?: number;
      isActive?: boolean;
    },
  ) {
    const collection = await this.collectionsRepository.findById(id);
    if (!collection) {
      throw new NotFoundError('Collection');
    }
    return this.collectionsRepository.update(id, data);
  }

  async delete(id: string) {
    const collection = await this.collectionsRepository.findById(id);
    if (!collection) {
      throw new NotFoundError('Collection');
    }
    return this.collectionsRepository.delete(id);
  }

  async addBook(collectionId: string, bookId: string, orderIndex: number = 0) {
    const collection = await this.collectionsRepository.findById(collectionId);
    if (!collection) {
      throw new NotFoundError('Collection');
    }
    const alreadyExists = collection.books.some((cb) => cb.bookId === bookId);
    if (alreadyExists) {
      throw new BadRequestError('Book is already in this collection');
    }
    return this.collectionsRepository.addBook(collectionId, bookId, orderIndex);
  }

  async removeBook(collectionId: string, bookId: string) {
    return this.collectionsRepository.removeBook(collectionId, bookId);
  }
}
