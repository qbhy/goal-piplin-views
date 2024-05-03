import {
    User,
    createUser,
    deleteUsers,
    getUsers,
    updateUser,
} from '@/services/ant-design-pro/user';
import {
    ActionType,
    ProColumns,
    ProForm,
    ProFormInstance,
    ProFormSelect,
    ProFormText,
    ProFormTextArea,
} from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-table';
import { Button, Modal, message } from 'antd';
import React, { useRef, useState } from 'react';

const List: React.FC = () => {
    const [user, setUser] = useState<User>();
    const [loading, setLoading] = useState(false);
    const formRef = useRef<ProFormInstance>();
    const tableRef = useRef<ActionType>();
    const setForm = (data: any) => {
        setUser(data);
        formRef.current?.setFieldsValue(data || {});
    };
    const columns: ProColumns<User>[] = [
        { dataIndex: 'id', title: 'ID', search: false },
        { dataIndex: 'username', title: '用户名', filtered: true },
        { dataIndex: 'nickname', title: '昵称', filtered: true },
        {
            dataIndex: 'role',
            title: '角色',
            filtered: true,
            valueEnum: { admin: '管理员', user: '普通用户' },
        },
        { dataIndex: 'created_at', title: '创建时间', search: false },
        { dataIndex: 'updated_at', title: '更新时间', search: false },
        {
            title: '操作',
            search: false,
            render: (data: any | User) => {
                return (
                    <div className="flex gap-3">
                        <Button onClick={() => setForm(data)}>详情</Button>
                        <Button
                            danger
                            onClick={() =>
                                Modal.confirm({
                                    onOk: () => {
                                        setLoading(true);
                                        deleteUsers(data.id).then(({ msg }) => {
                                            if (msg !== undefined) return message.error(msg);
                                            tableRef.current?.reload();
                                            setLoading(false);
                                        });
                                    },
                                    title: `确定删除用户 "${data.username}" 吗？`,
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
                open={user !== undefined}
                onCancel={() => setForm(undefined)}
                okButtonProps={{ hidden: true }}
            >
                <ProForm
                    formRef={formRef}
                    loading={loading}
                    onFinish={async (values: Record<string, any>) => {
                        setLoading(true);
                        (user?.id ? updateUser : createUser)(values).then(({ msg }) => {
                            setLoading(false);
                            setForm(undefined);
                            if (msg) {
                                return message.error(msg);
                            }
                            tableRef.current?.reload();
                        });
                    }}
                    initialValues={user}
                >
                    <ProFormText name="avatar" label="头像" hidden />
                    <ProFormText
                        hidden={Number(user?.id) > 0}
                        required
                        name="username"
                        label="用户名"
                        tooltip="最长为 24 位"
                        placeholder="请输入名称"
                    />
                    <ProFormText required hidden name="id" label="ID" />
                    {Number(user?.id) > 0 && (
                        <ProFormText
                            required
                            name="nickname"
                            label="昵称"
                            tooltip="最长为 24 位"
                            placeholder="请输入名称"
                        />
                    )}
                    <ProFormSelect
                        required
                        name="role"
                        label="角色"
                        initialValue="user"
                        options={[
                            { label: '管理员', value: 'admin' },
                            { label: '普通用户', value: 'user' },
                        ]}
                    />
                    <ProFormTextArea
                        required={user?.id !== undefined}
                        name="password"
                        label="密码"
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
                                    id: 0,
                                    username: '',
                                    nickname: '',
                                    password: '',
                                    role: 'user',
                                })
                            }
                            key="button"
                            type="primary"
                        >
                            新建
                        </Button>
                    </>,
                ]}
                columns={columns}
                request={getUsers}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default List;
