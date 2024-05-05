import { Paginate } from '@/services/ant-design-pro/project';
import { request } from '@@/exports';

export type Environment = {
    id: number;
    project_id: number;
    name: string;
    created_at: string;
    updated_at: string;
    settings: {
        servers: Server[];
        server_groups: string[];
        default_selected: boolean;
        linkage_deploy: string;
    };
};

export type Server = {
    host: string;
    port: string;
};

export async function getEnvironments(params: Record<any, any>) {
    const result = await request<Paginate<Environment>>('/api/environment/list', { params });
    result.page = params.page || 1;
    result.page_size = params.pageSize || 100;
    return result;
}

export async function createEnvironment(params: Record<string, any>) {
    return await request<{ data: Environment }>('/api/environment/create', {
        data: params,
        method: 'POST',
    }).then((res) => res.data);
}

export async function updateEnvironment(params: Record<string, any>) {
    return await request<{ data: Environment }>('/api/environment/update', {
        data: params,
        method: 'POST',
    }).then((res) => res.data);
}

export async function deleteEnvironment(id: number[]) {
    return await request<{ data: Environment }>('/api/environment/delete', {
        data: { id },
        method: 'POST',
    });
}
