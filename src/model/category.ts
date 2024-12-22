import { Prisma } from '@prisma/client';

export default class CategoryBuilder {
  readonly data: Prisma.CategoriesCreateInput = {
    title: '',
    description: '',
    restaurantId: '',
    sortOrder: 0,
  };

  setTitle(title: string): this {
    this.data.title = title;
    return this;
  }

  setDescription(description: string | null): this {
    this.data.description = description ?? '';
    return this;
  }

  setRestaurantId(id: string): this {
    this.data.restaurantId = id;
    return this;
  }

  setSortOrder(order: number): this {
    this.data.sortOrder = order;
    return this;
  }

  build(): Prisma.CategoriesCreateInput {
    return this.data;
  }
}
