import { Paginate } from '@/services/ant-design-pro/project';
import { request } from '@umijs/max';

export type ShareFile = {
  id?: number;
  name: string;
  project_id: number;
  path: string;
  updated_at: string;
  created_at: string;
};

export async function getShareFiles(params: any = { page: 1, pageSize: 100 }) {
  const result = await request<Paginate<ShareFile>>('/api/share/list', { params });
  result.page = params.page;
  result.page_size = params.pageSize;
  return result;
}

export async function createShareFile(params: Record<string, any>) {
  return await request<{ data: ShareFile }>('/api/share/create', {
    data: params,
    method: 'POST',
  }).then((res) => res.data);
}

export async function updateShareFile(params: Record<string, any>) {
  return await request('/api/share/update', {
    data: params,
    method: 'POST',
  }).then((res) => res.data);
}

export async function deleteShareFiles(id: number[]) {
  return await request('/api/share/delete', {
    data: { id: id },
    method: 'POST',
  }).then((res) => res.data);
}
