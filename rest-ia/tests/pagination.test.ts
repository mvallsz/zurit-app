import { buildPaginationQuery, buildFilterQuery, paginatedResponse } from '../src/utils';

describe('Pagination Utils', () => {
  describe('buildPaginationQuery', () => {
    it('should return default values when no options provided', () => {
      const result = buildPaginationQuery({});
      expect(result.skip).toBe(0);
      expect(result.limit).toBe(10);
      expect(result.sort).toEqual({ createdAt: -1 });
    });

    it('should calculate skip correctly', () => {
      const result = buildPaginationQuery({ page: 3, limit: 20 });
      expect(result.skip).toBe(40);
      expect(result.limit).toBe(20);
    });

    it('should use custom sort', () => {
      const result = buildPaginationQuery({ sort: { name: 1 } });
      expect(result.sort).toEqual({ name: 1 });
    });
  });

  describe('buildFilterQuery', () => {
    it('should build filter from allowed fields', () => {
      const allowedFields = ['name', 'status'];
      const queryParams = { name: 'test', status: 'active', notAllowed: 'value' };
      
      const result = buildFilterQuery(allowedFields, queryParams);
      
      expect(result.name).toEqual({ $regex: 'test', $options: 'i' });
      expect(result.status).toEqual({ $regex: 'active', $options: 'i' });
      expect(result.notAllowed).toBeUndefined();
    });
  });

  describe('paginatedResponse', () => {
    it('should return correct pagination metadata', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = paginatedResponse(data, 25, 1, 10);
      
      expect(result.ok).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.total).toBe(25);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(3);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPrevPage).toBe(false);
    });

    it('should correctly indicate no next page', () => {
      const data = [{ id: 1 }];
      const result = paginatedResponse(data, 5, 1, 10);
      
      expect(result.hasNextPage).toBe(false);
    });
  });
});
