import { Paginate } from '@/services/ant-design-pro/project';
import { request } from '@@/exports';

export type UserGroup = {
    id: number;
    user_id: number;
    group_id: number;
    status: string;
};

export type InviteGroup = {
    id: number;
    group_id: number;
    group_name: string;
    created_at: string;
    status: string;
};

export async function getUserGroups(params: Record<string, any>) {
    return await request<Paginate<InviteGroup>>('/api/user_group/list', {
        params: params,
        method: 'GET',
    });
}

export async function createUserGroup(params: Record<string, any>) {
    return await request<{ msg?: string }>('/api/user_group/create', {
        data: params,
        method: 'POST',
    });
}

export async function updateUserGroup(params: Record<string, any>) {
    return await request<{ msg?: string }>('/api/user_group/update', {
        data: params,
        method: 'POST',
    });
}

export async function deleteUserGroup(id: number[]) {
    return await request<{ msg?: string }>('/api/user_group/delete', {
        data: { id: id },
        method: 'POST',
    });
}
