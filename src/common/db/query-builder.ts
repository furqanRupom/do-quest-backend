import { Model, Query } from "mongoose";

export class QueryBuilder<T, Q extends Record<string, any> = Record<string, any>> {
  public modelQuery: Query<T[], T>;
  public query: Q;

  constructor(model: Model<T>, query?: Q) {
    this.modelQuery = model.find();
    this.query = (query ?? {}) as Q;
  }

  search(searchableFields: (keyof T | string)[]) {
    const searchTerm = (this.query as any)?.searchTerm;
    if (!searchTerm) return this;
    this.modelQuery = this.modelQuery.find({
      $or: searchableFields.map(field => ({
        [field]: { $regex: searchTerm, $options: 'i' },
      })),
    });
    return this;
  }

  filter(filterableFields: (keyof T | string)[] = [], additionalFilter: Record<string, any> = {}) {
    const queryObj = { ...(this.query ?? {}) };
    const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
    excludeFields.forEach(el => delete queryObj[el]);

    const filteredQuery = filterableFields.length
      ? Object.fromEntries(
        Object.entries(queryObj).filter(([key]) =>
          (filterableFields as string[]).includes(key)
        )
      )
      : queryObj;


      


 const normalizedQuery = Object.fromEntries(
        Object.entries(filteredQuery).map(([key, value]) => {
            if (value === 'true') return [key, true];
            if (value === 'false') return [key, false];
            return [key, value];
        })
    );

     const rangeFilter: Record<string, any> = {};

    if ((this.query as any)?.budgetMin || (this.query as any)?.budgetMax) {
      rangeFilter.budget = {
        ...((this.query as any).budgetMin && { $gte: Number((this.query as any).budgetMin) }),
        ...((this.query as any).budgetMax && { $lte: Number((this.query as any).budgetMax) }),
      };
    }

    if ((this.query as any)?.deadlineMin || (this.query as any)?.deadlineMax) {
      rangeFilter.deadline = {
        ...((this.query as any).deadlineMin && { $gte: new Date((this.query as any).deadlineMin) }),
        ...((this.query as any).deadlineMax && { $lte: new Date((this.query as any).deadlineMax) }),
      };
    }

    const finalFilter = { ...filteredQuery,...normalizedQuery, ...rangeFilter, ...additionalFilter }; this.modelQuery = this.modelQuery.find(finalFilter);
    return this;
  }

  sort() {
    const sort = (this.query as any)?.sort?.split(',').join(' ') || '-createdAt';
    this.modelQuery = this.modelQuery.sort(sort);
    return this;
  }

  paginate() {
    const page = Number((this.query as any)?.page) || 1;
    const limit = Number((this.query as any)?.limit) || 10;
    const skip = (page - 1) * limit;
    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  fields() {
    const fields = (this.query as any)?.fields?.split(',').join(' ') || '-__v';
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  populate(populateOptions: any) {
    if (!populateOptions) return this;
    this.modelQuery = this.modelQuery.populate(populateOptions);
    return this;
  }

  async countTotal() {
    const filter = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(filter);
    const page = Number((this.query as any)?.page) || 1;
    const limit = Number((this.query as any)?.limit) || 10;
    const totalPage = Math.ceil(total / limit);
    return { page, limit, total, totalPage };
  }
}
