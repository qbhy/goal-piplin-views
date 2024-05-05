import { Paginate } from '@/services/ant-design-pro/project';
import { request } from '@umijs/max';

export type Command = {
    id?: number;
    name: string;
    project_id: number;
    step: string;
    sort: number;
    user: string;
    script: string;
    environments: string[];
    optional: boolean;
    default_selected: boolean;
    updated_at: string;
    created_at: string;
};

export async function getCommands(params: any = { page: 1, pageSize: 100 }) {
    const result = await request<Paginate<Command>>('/api/command/list', { params });
    result.page = params.page;
    result.page_size = params.pageSize;
    return result;
}

export async function createCommand(params: Record<string, any>) {
    return await request<{ data: Command }>('/api/command/create', {
        data: params,
        method: 'POST',
    }).then((res) => res.data);
}

export async function updateCommand(params: Record<string, any>) {
    return await request('/api/command/update', {
        data: params,
        method: 'POST',
    }).then((res) => res.data);
}

export async function deleteCommands(id: number[]) {
    return await request('/api/command/delete', {
        data: { id: id },
        method: 'POST',
    }).then((res) => res.data);
}
