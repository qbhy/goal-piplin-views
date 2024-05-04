import { InviteGroup, getUserGroups, updateUserGroup } from '@/services/ant-design-pro/user_group';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-table';
import { Button, message } from 'antd';
import React, { useRef, useState } from 'react';

const List: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const tableRef = useRef<ActionType>();
    const update = (groupId: number, status: string) => {
        setLoading(true);
        updateUserGroup({
            group_id: groupId,
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
    const columns: ProColumns<InviteGroup>[] = [
        { dataIndex: 'id', title: 'ID', search: false },
        { dataIndex: 'group_id', title: '分组ID', search: false },
        { dataIndex: 'group_name', title: '分组名称' },
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
                        <Button onClick={() => update(data.group_id, 'joined')}>同意</Button>
                        <Button danger onClick={() => update(data.group_id, 'rejected')}>
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
                request={getUserGroups}
                pagination={{ pageSize: 10 }}
            ></ProTable>
        </div>
    );
};

export default List;
