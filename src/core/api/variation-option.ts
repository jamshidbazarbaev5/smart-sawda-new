import { createResourceApiHooks } from '../helpers/createResourceApi';

export interface VariationValue {
  id?: number;
  option: number;
  value: string;
}

export interface VariationOption {
  id?: number;
  name: string;
  is_system?: boolean;
  values?: VariationValue[];
}

export interface VariationOptionValueResponse {
  id: number;
  value: string;
}

export interface VariationOptionResponse {
  id: number;
  name: string;
  is_system: boolean;
  values: VariationOptionValueResponse[];
}

const VARIATION_OPTION_URL = 'variation-options/';
const VARIATION_VALUE_URL = 'variation-values/';

export const {
  useGetResources: useGetVariationOptions,
  useGetResource: useGetVariationOption,
  useCreateResource: useCreateVariationOption,
  useUpdateResource: useUpdateVariationOption,
  useDeleteResource: useDeleteVariationOption,
} = createResourceApiHooks<VariationOption>(VARIATION_OPTION_URL, 'variationOptions');

export const {
  useGetResources: useGetVariationValues,
  useGetResource: useGetVariationValue,
  useCreateResource: useCreateVariationValue,
  useUpdateResource: useUpdateVariationValue,
  useDeleteResource: useDeleteVariationValue,
} = createResourceApiHooks<VariationValue>(VARIATION_VALUE_URL, 'variationValues');
