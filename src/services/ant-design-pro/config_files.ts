import { Paginate } from '@/services/ant-design-pro/project';
import { request } from '@umijs/max';

export type ConfigFile = {
  id?: number;
  name: string;
  project_id: number;
  environments: number[];
  content: string;
  path: string;
  updated_at: string;
  created_at: string;
};

export async function getConfigFiles(params: any = { page: 1, pageSize: 100 }) {
  const result = await request<Paginate<ConfigFile>>('/api/config/list', { params });
  result.page = params.page;
  result.page_size = params.pageSize;
  return result;
}

export async function createConfigFile(params: Record<string, any>) {
  return await request<{ data: ConfigFile }>('/api/config/create', {
    data: params,
    method: 'POST',
  }).then((res) => res.data);
}

export async function updateConfigFile(params: Record<string, any>) {
  return await request('/api/config/update', {
    data: params,
    method: 'POST',
  }).then((res) => res.data);
}

export async function deleteConfigFiles(id: number[]) {
  return await request('/api/config/delete', {
    data: { id: id },
    method: 'POST',
  }).then((res) => res.data);
}
