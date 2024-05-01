import { Group } from '@/services/ant-design-pro/group';
import { Key } from '@/services/ant-design-pro/key';
import { request } from '@umijs/max';

export type Paginate<T> = {
    data: T[];
    total: number;
    page: number;
    page_size: number;
    success: boolean;
};

export type Project = {
    id: number;
    uuid: string;
    name: string;
    creator_id: number;
    group_id: number;
    key_id: number;
    repo_address: string;
    project_path: string;
    default_branch: string;
    settings: {
        branches: string[];
        tags: string[];
        env_vars: string[];
        callbacks: string[];
    };
    created_at: string;
    updated_at: string;
};

export type ProjectDetail = Project & {
    key: Key | null;
    group: Group | null;
};

export async function getProjects(params: Record<any, any>) {
    const result = await request<Paginate<Project>>('/api/project/list', params);
    result.page = params.page;
    result.page_size = params.pageSize;
    return result;
}

export async function getProjectDetail(id: any) {
    return request<{ data: ProjectDetail }>(`/api/project/detail?id=${id}`).then((res) => res.data);
}

export async function createProject(params: Record<string, any>) {
    return request<{ data: Project }>('/api/project/create', { method: 'POST', data: params });
}

export async function updateProject(params: Record<string, any>) {
    return request<{ data: Project }>('/api/project/update', { method: 'POST', data: params });
}
