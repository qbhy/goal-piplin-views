import { Paginate } from '@/services/ant-design-pro/project';
import { request } from '@@/exports';

export type Group = {
    id: number;
    name: string;
    creator_id: number;
    created_at: string;
    updated_at: string;
};

export type GroupMember = {
    id: number;
    status: string;
    username: string;
    nickname: string;
    created_at: string;
};

export async function getGroups(params: any = { page: 1, pageSize: 100 }) {
    const result = await request<Paginate<Group>>('/api/group/list', { params });
    result.page = params.page;
    result.page_size = params.pageSize;
    return result;
}

export async function getGroupMembers(params: any = { page: 1, pageSize: 100 }) {
    const result = await request<Paginate<GroupMember>>('/api/group/members', { params });
    result.page = params.page;
    result.page_size = params.pageSize;
    return result;
}

export async function createGroup(params: Record<string, any>) {
    return await request<{ data: Group }>('/api/group/create', {
        data: params,
        method: 'POST',
    }).then((res) => res.data);
}

export async function updateGroup(params: Record<string, any>) {
    return await request<{ data: Group }>('/api/group/update', {
        data: params,
        method: 'POST',
    }).then((res) => res.data);
}

export async function deleteGroups(id: number[]) {
    return await request('/api/group/delete', {
        data: { id: id },
        method: 'POST',
    }).then((res) => res.data);
}
