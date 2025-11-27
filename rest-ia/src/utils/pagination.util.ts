import { PaginationOptions } from '../interfaces';

export const buildPaginationQuery = (options: PaginationOptions) => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;
  const sort = options.sort || { createdAt: -1 };

  return { skip, limit, sort };
};

export const buildFilterQuery = (
  allowedFields: string[],
  queryParams: Record<string, unknown>
): Record<string, unknown> => {
  const filter: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (queryParams[field] !== undefined) {
      if (typeof queryParams[field] === 'string') {
        // Text search with regex
        filter[field] = { $regex: queryParams[field], $options: 'i' };
      } else {
        filter[field] = queryParams[field];
      }
    }
  }

  return filter;
};

export const paginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) => {
  return {
    ok: true,
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  };
};

export default {
  buildPaginationQuery,
  buildFilterQuery,
  paginatedResponse,
};
