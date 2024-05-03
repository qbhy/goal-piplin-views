import { Paginate } from '@/services/ant-design-pro/project';
import { request } from '@@/exports';

export type UserProject = {
    id: number;
    user_id: number;
    project_id: number;
    status: string;
};

export type InviteProject = {
    id: number;
    project_id: number;
    project_name: string;
    created_at: string;
    status: string;
};

export async function getUserProjects(params: Record<string, any>) {
    return await request<Paginate<InviteProject>>('/api/user_project/list', {
        params: params,
        method: 'GET',
    });
}

export async function createUserProject(params: Record<string, any>) {
    return await request<{ msg?: string }>('/api/user_project/create', {
        data: params,
        method: 'POST',
    });
}

export async function updateUserProject(params: Record<string, any>) {
    return await request<{ msg?: string }>('/api/user_project/update', {
        data: params,
        method: 'POST',
    });
}

export async function deleteUserProject(id: number[]) {
    return await request<{ msg?: string }>('/api/user_project/delete', {
        data: { id: id },
        method: 'POST',
    });
}
