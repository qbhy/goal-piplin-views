import { Paginate } from '@/services/ant-design-pro/project';
import { request } from '@umijs/max';

export type Cabinet = {
  id: number;
  name: string;
  settings: ServerGroupSettings[];
  updated_at: string;
  created_at: string;
};

export type ServerGroupSettings = {
  name: string;
  host: string;
  port: string;
  user: string;
  disabled: boolean;
};

export async function getCabinets(params: any = { page: 1, pageSize: 100 }) {
  const result = await request<Paginate<Cabinet>>('/api/cabinet/list', { params });
  result.page = params.page;
  result.page_size = params.pageSize;
  return result;
}

export async function createCabinet(params: Record<string, any>) {
  return await request<{ data: Cabinet }>('/api/cabinet/create', {
    data: params,
    method: 'POST',
  }).then((res) => res.data);
}

export async function updateCabinet(params: Record<string, any>) {
  return await request('/api/cabinet/update', {
    data: params,
    method: 'POST',
  }).then((res) => res.data);
}

export async function deleteCabinets(id: number[]) {
  return await request('/api/cabinet/delete', {
    data: { id: id },
    method: 'POST',
  }).then((res) => res.data);
}
