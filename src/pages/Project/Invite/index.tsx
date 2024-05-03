import {
    getUserProjects,
    InviteProject,
    updateUserProject,
} from '@/services/ant-design-pro/user_project';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-table';
import { Button, message } from 'antd';
import React, { useRef, useState } from 'react';

const List: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const tableRef = useRef<ActionType>();
    const update = (projectId: number, status: string) => {
        setLoading(true);
        updateUserProject({
            project_id: projectId,
            status: status,
        }).then(({ msg }) => {
            if (msg !== undefined) {
                return message.error(msg);
            }
            message.success('更新成功!');
            tableRef.current?.reload();
            setLoading(false);
        });
    };
    const columns: ProColumns<InviteProject>[] = [
        { dataIndex: 'id', title: 'ID', search: false },
        { dataIndex: 'project_id', title: '项目ID', search: false },
        { dataIndex: 'project_name', title: '项目名称' },
        {
            dataIndex: 'status',
            title: '状态',
            valueEnum: { inviting: '等待', joined: '已同意', rejected: '已拒绝' },
        },
        { dataIndex: 'created_at', title: '创建时间', search: false },
        {
            title: '操作',
            search: false,
            render: (data: any) => {
                return data.status === 'inviting' ? (
                    <div className="flex gap-3 items-center">
                        <Button onClick={() => update(data.project_id, 'joined')}>同意</Button>
                        <Button danger onClick={() => update(data.project_id, 'rejected')}>
                            拒绝
                        </Button>
                    </div>
                ) : (
                    ''
                );
            },
        },
    ];
    return (
        <div className="">
            <ProTable
                rowKey="id"
                actionRef={tableRef}
                loading={loading}
                columns={columns}
                request={getUserProjects}
                pagination={{ pageSize: 10 }}
            ></ProTable>
        </div>
    );
};

export default List;
