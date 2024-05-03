import { Paginate } from '@/services/ant-design-pro/project';
import { request } from '@umijs/max';

export type Key = {
    id: number;
    name: string;
    private_key: string;
    public_key: string;
    updated_at: string;
    created_at: string;
};

export async function getKeys(params: any = { page: 1, pageSize: 100 }) {
    const result = await request<Paginate<Key>>('/api/key/list', { params });
    result.page = params.page;
    result.page_size = params.pageSize;
    return result;
}

export async function createKey(params: Record<string, any>) {
    return await request<{ data: Key; msg?: string }>('/api/key/create', {
        data: params,
        method: 'POST',
    });
}

export async function updateKey(params: Record<string, any>) {
    return await request<{ data: Key; msg?: string }>('/api/key/update', {
        data: params,
        method: 'POST',
    });
}

export async function deleteKeys(id: number[]) {
    return await request<{ msg?: string }>('/api/key/delete', {
        data: { id: id },
        method: 'POST',
    });
}
