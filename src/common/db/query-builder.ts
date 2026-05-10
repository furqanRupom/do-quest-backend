import type { Model, Query, PopulateOptions } from "mongoose";

export class QueryBuilder<T, Q extends Record<string, any> = Record<string, any>> {
    public modelQuery: Query<T[], T>;
    public query: Q;

    constructor(model: Model<T>, query: Q) {
        this.modelQuery = model.find();
        this.query = query;
    }

    search(searchableFields: (keyof T | string)[]) {
        const searchTerm = (this.query as any).searchTerm as string;

        if (searchTerm) {
            this.modelQuery = this.modelQuery.find({
                $or: searchableFields.map(field => ({
                    [field]: { $regex: searchTerm, $options: 'i' },
                })),
            });
        }
        return this;
    }

    filter(additionalFilter: Record<string, any> = {}) {
        const queryObj = { ...this.query } as any;

        const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
        excludeFields.forEach(el => delete queryObj[el]);

        const finalFilter = { ...queryObj, ...additionalFilter };

        this.modelQuery = this.modelQuery.find(finalFilter);
        return this;
    }

    sort() {
        const sort = (this.query as any).sort?.split(',').join(' ') || '-createdAt';
        this.modelQuery = this.modelQuery.sort(sort);
        return this;
    }

    paginate() {
        const page = Number((this.query as any).page) || 1;
        const limit = Number((this.query as any).limit) || 10;
        const skip = (page - 1) * limit;

        this.modelQuery = this.modelQuery.skip(skip).limit(limit);
        return this;
    }

    fields() {
        const fields = (this.query as any).fields?.split(',').join(' ') || '-__v';
        this.modelQuery = this.modelQuery.select(fields);
        return this;
    }

    populate(
        populateOptions: string | string[] | PopulateOptions | PopulateOptions[]
    ) {
        if (!populateOptions) return this;

        // Handle different input formats safely
        if (typeof populateOptions === 'string' || Array.isArray(populateOptions)) {
            this.modelQuery = this.modelQuery.populate(populateOptions as any);
        } else {
            this.modelQuery = this.modelQuery.populate(populateOptions);
        }

        return this;
    }

    async countTotal() {
        const filter = this.modelQuery.getFilter();
        const total = await this.modelQuery.model.countDocuments(filter);

        const page = Number((this.query as any).page) || 1;
        const limit = Number((this.query as any).limit) || 10;
        const totalPage = Math.ceil(total / limit);

        return { page, limit, total, totalPage };
    }
}
