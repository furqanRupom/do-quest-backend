import type { Model, Query } from 'mongoose';

export class QueryBuilder<T> {
    public modelQuery: Query<T[], T>;
    public query: Record<string, unknown>;

    constructor(model: Model<T>, query: Record<string, unknown>) {
        this.modelQuery = model.find();
        this.query = query;
    }

    search(searchableFields: (keyof T | string)[]) {
        const searchTerm = this.query?.searchTerm as string;

        if (searchTerm) {
            this.modelQuery = this.modelQuery.find({
                $or: searchableFields.map(field => ({
                    [field]: { $regex: searchTerm, $options: 'i' },
                })),
            });
        }

        return this;
    }

    filter() {
        const queryObj = { ...this.query };

        const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
        excludeFields.forEach(el => delete queryObj[el]);

        this.modelQuery = this.modelQuery.find(queryObj as any);
        return this;
    }

    sort() {
        const sort =
            (this.query?.sort as string)?.split(',').join(' ') || '-createdAt';

        this.modelQuery = this.modelQuery.sort(sort);
        return this;
    }

    paginate() {
        const page = Number(this.query?.page) || 1;
        const limit = Number(this.query?.limit) || 10;
        const skip = (page - 1) * limit;

        this.modelQuery = this.modelQuery.skip(skip).limit(limit);
        return this;
    }

    fields() {
        const fields =
            (this.query?.fields as string)?.split(',').join(' ') || '-__v';

        this.modelQuery = this.modelQuery.select(fields);
        return this;
    }

    async countTotal() {
        const filter = this.modelQuery.getFilter();
        const total = await this.modelQuery.model.countDocuments(filter);

        const page = Number(this.query?.page) || 1;
        const limit = Number(this.query?.limit) || 10;
        const totalPage = Math.ceil(total / limit);

        return {
            page,
            limit,
            total,
            totalPage,
        };
    }
}
