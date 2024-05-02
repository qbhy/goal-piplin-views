import {
    Group,
    createGroup,
    deleteGroups,
    getGroups,
    updateGroup,
} from '@/services/ant-design-pro/group';
import {
    ActionType,
    ProColumns,
    ProForm,
    ProFormInstance,
    ProFormText,
} from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-table';
import { Button, Modal, message } from 'antd';
import React, { useRef, useState } from 'react';

const List: React.FC = () => {
    const [group, setGroup] = useState<Group>();
    const [loading, setLoading] = useState(false);
    const formRef = useRef<ProFormInstance>();
    const tableRef = useRef<ActionType>();
    const [] = useState<number[]>([]);
    const setForm = (data: any) => {
        setGroup(data);
        formRef.current?.setFieldsValue(data);
    };
    const columns: ProColumns<Group>[] = [
        { dataIndex: 'id', title: 'ID', search: false },
        { dataIndex: 'name', title: '名称', filtered: true },
        { dataIndex: 'created_at', title: '创建时间', search: false },
        { dataIndex: 'updated_at', title: '更新时间', search: false },
        {
            title: '操作',
            search: false,
            render: (data: any | Group) => {
                return (
                    <div className="flex gap-3">
                        <Button onClick={() => setForm(data)}>详情</Button>
                        <Button
                            onClick={() =>
                                Modal.confirm({
                                    onOk: () => {
                                        setLoading(true);
                                        deleteGroups([data.id]).then(({ msg }) => {
                                            if (msg !== undefined) return message.error(msg);
                                            tableRef.current?.reload();
                                            setLoading(false);
                                        });
                                    },
                                    title: `确定删除密钥 "${data.name}" 吗？`,
                                })
                            }
                        >
                            删除
                        </Button>
                    </div>
                );
            },
        },
    ];
    return (
        <div className="">
            <Modal
                width="90%"
                open={group !== undefined}
                onCancel={() => setForm(undefined)}
                okButtonProps={{ hidden: true }}
            >
                <ProForm
                    formRef={formRef}
                    loading={loading}
                    onFinish={async (values: Record<string, any>) => {
                        setLoading(true);
                        const callback = () => {
                            setLoading(false);
                            setForm(undefined);
                            tableRef.current?.reload();
                        };
                        (group?.id ? updateGroup : createGroup)(values)
                            .then(callback)
                            .catch((err) => {
                                console.log(err);
                            });
                    }}
                    initialValues={group}
                >
                    <ProFormText disabled name="id" label="ID" hidden />
                    <ProFormText
                        required
                        name="name"
                        label="分组名称"
                        tooltip="最长为 24 位"
                        placeholder="请输入名称"
                    />
                </ProForm>
            </Modal>

            <ProTable
                rowKey="id"
                actionRef={tableRef}
                toolBarRender={() => [
                    <>
                        <Button
                            onClick={() =>
                                setForm({
                                    created_at: '',
                                    id: undefined,
                                    name: '',
                                    public_key: '',
                                    private_key: '',
                                    updated_at: '',
                                })
                            }
                            key="button"
                            type="primary"
                        >
                            新建
                        </Button>
                        <Button onClick={() => tableRef.current}>删除所选</Button>
                    </>,
                ]}
                columns={columns}
                request={getGroups}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default List;
