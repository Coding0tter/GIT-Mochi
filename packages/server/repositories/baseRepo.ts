class BaseRepo<TModel> {
  constructor(protected model: any) {}

  public async getAllAsync(
    filter?: Record<string, unknown> | null
  ): Promise<TModel[]> {
    if (filter) {
      return await this.model.find(filter);
    }

    return await this.model.find();
  }

  public async findOneAsync(filter: Record<string, unknown>): Promise<TModel> {
    return await this.model.findOne(filter);
  }

  public async getByIdAsync(id: string): Promise<TModel> {
    return await this.model.findById(id);
  }

  public async createAsync(data: Partial<TModel>): Promise<TModel> {
    return await this.model.create(data);
  }

  public async updateAsync(id: string, data: Partial<TModel>): Promise<TModel> {
    return await this.model.findByIdAndUpdate(id, data, { new: true });
  }

  public async deleteAsync(id: string): Promise<TModel> {
    return await this.model.findByIdAndDelete(id, { new: true });
  }
}

export default BaseRepo;
