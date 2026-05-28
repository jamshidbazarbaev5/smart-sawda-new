import { createResourceApiHooks } from '../helpers/createResourceApi'
import api from './api'

import type { Attribute } from '@/types/attribute';

export interface CategoryV2 {
  id: number;
  name: string;
  parent: number | null;
  is_system: boolean;
  is_active: boolean;
  sell_from_stock: boolean;
  is_recyclable: boolean;
  recyclable_to: { id: number; name: string }[];
  attributes_read?: Attribute[];
}

export interface CategoryWrite {
  id?: number;
  name: string;
  parent?: number | null;
  is_active?: boolean;
  sell_from_stock?: boolean;
  is_recyclable?: boolean;
  recyclable_to?: number[];
}

export interface Category {
  id?: number;
  name: string;
  category_name?: string;
  parent?: number | null;
  is_system?: boolean;
  is_active?: boolean;
  sell_from_stock?: boolean;
  is_recyclable?: boolean;
  recyclable_to?: { id: number; name: string }[];
  attributes?: number[];
  attributes_read?: Attribute[];
  store_write?: number;
  store_read?: {
    id: number;
    name: string;
    address: string;
    phone_number: string;
    created_at: string;
    is_main: boolean;
    parent_store: number | null;
    owner: number;
  };
}

export interface CategoryWithAttributesResponse {
  links: {
    first: string | null;
    last: string | null;
    next: string | null;
    previous: string | null;
  };
  total_pages: number;
  current_page: number;
  page_range: number[];
  page_size: number;
  results: Category[];
  count: number;
}

const CATEGORY_URL = 'categories/';

export const {
  useGetResources: useGetCategories,
  useGetResource: useGetCategory,
  useCreateResource: useCreateCategory,
  useUpdateResource: useUpdateCategory,
  useDeleteResource: useDeleteCategory,
} = createResourceApiHooks<Category>(CATEGORY_URL, 'categories');

export const fetchCategoriesWithAttributes = async (categoryName?: string): Promise<CategoryWithAttributesResponse> => {
  const params = categoryName ? { name: categoryName } : {};
  const response = await api.get<CategoryWithAttributesResponse>(CATEGORY_URL, { params });
  return response.data;
};

export const fetchAllCategories = async (): Promise<Category[]> => {
  let allCategories: Category[] = [];
  let currentPage = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const response = await api.get<CategoryWithAttributesResponse>(CATEGORY_URL, {
        params: { page: currentPage }
      });

      allCategories = [...allCategories, ...response.data.results];

      hasMorePages = response.data.links.next !== null;
      currentPage++;
    } catch (error) {
      console.error('Error fetching categories page:', currentPage, error);
      hasMorePages = false;
    }
  }

  return allCategories;
};
