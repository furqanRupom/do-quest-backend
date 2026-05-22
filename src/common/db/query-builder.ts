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
      $or: searchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: "i" },
      })),
    });

    return this;
  }

  filter(
    filterableFields: (keyof T | string)[] = [],
    additionalFilter: Record<string, any> = {}
  ) {
    const queryObj = { ...(this.query ?? {}) };

    // remove non-filter fields
    const excludeFields = ["searchTerm", "sort", "limit", "page", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);

    const filteredQuery = Object.fromEntries(
      Object.entries(queryObj).filter(([key, value]) => {
        const isAllowed =
          !filterableFields.length ||
          (filterableFields as string[]).includes(key);

        return isAllowed && value !== undefined;
      })
    );

    const normalizedQuery = Object.fromEntries(
      Object.entries(filteredQuery).map(([key, value]) => {
        if (value === "true") return [key, true];
        if (value === "false") return [key, false];
        return [key, value];
      })
    );

    const rangeFilter: Record<string, any> = {};

    const q: any = this.query;

    if (q?.budgetMin !== undefined || q?.budgetMax !== undefined) {
      rangeFilter.budget = {
        ...(q.budgetMin !== undefined && { $gte: Number(q.budgetMin) }),
        ...(q.budgetMax !== undefined && { $lte: Number(q.budgetMax) }),
      };
    }

    if (q?.deadlineMin !== undefined || q?.deadlineMax !== undefined) {
      rangeFilter.deadline = {
        ...(q.deadlineMin !== undefined && {
          $gte: new Date(q.deadlineMin),
        }),
        ...(q.deadlineMax !== undefined && {
          $lte: new Date(q.deadlineMax),
        }),
      };
    }

    const finalFilter = {
      ...normalizedQuery,
      ...rangeFilter,
      ...additionalFilter,
    };

    this.modelQuery = this.modelQuery.find(finalFilter);

    return this;
  }

  sort() {
    const sort =
      (this.query as any)?.sort?.split(",").join(" ") || "-createdAt";

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
    const fields =
      (this.query as any)?.fields?.split(",").join(" ") || "-__v";

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

    const totalPages = Math.ceil(total / limit) || 1;

    return { page, limit, total, totalPages };
  }
}
