import { Paginate } from '@/services/ant-design-pro/project';
import { request } from '@umijs/max';

export type User = {
    id: number;
    avatar: string;
    created_at: string;
    nickname: string;
    password: string;
    role: string;
    updated_at: string;
    username: string;
};

export async function getUsers(params: any = { page: 1, pageSize: 100 }) {
    const result = await request<Paginate<User>>('/api/user/list', { params });
    result.page = params.page;
    result.page_size = params.pageSize;
    return result;
}

export async function createUser(params: Record<string, any>) {
    return await request<{ data: User; msg?: string }>('/api/user/create', {
        data: params,
        method: 'POST',
    });
}

export async function updateUser(params: Record<string, any>) {
    return await request<{ data: User; msg?: string }>('/api/user/update', {
        data: params,
        method: 'POST',
    });
}

export async function deleteUsers(id: number[]) {
    return await request<{ msg?: string }>('/api/user/delete', {
        data: { id: id },
        method: 'POST',
    });
}
