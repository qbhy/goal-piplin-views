import {
    Group,
    GroupMember,
    createGroup,
    deleteGroups,
    getGroupMembers,
    getGroups,
    updateGroup,
} from '@/services/ant-design-pro/group';
import { getUsers } from '@/services/ant-design-pro/user';
import { createUserGroup, deleteUserGroup } from '@/services/ant-design-pro/user_group';
import { UserProject } from '@/services/ant-design-pro/user_project';
import {
    ActionType,
    ProColumns,
    ProForm,
    ProFormInstance,
    ProFormSelect,
    ProFormText,
} from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-table';
import { useRequest } from 'ahooks';
import { Button, Modal, message } from 'antd';
import React, { useRef, useState } from 'react';
import { useNavigate } from 'umi';

const List: React.FC = () => {
    const [inviteGroup, setInviteGroup] = useState<Group>();
    const [group, setGroup] = useState<Group>();
    const [loading, setLoading] = useState(false);
    const formRef = useRef<ProFormInstance>();
    const tableRef = useRef<ActionType>();
    const { data: users } = useRequest(async (name: string = '') =>
        getUsers({ nickname: name, username: name }),
    );
    const [showInvite, setShowInvite] = useState(false);
    const [members, setMembers] = useState<GroupMember[]>();
    const setForm = (data: any) => {
        setGroup(data);
        formRef.current?.setFieldsValue(data);
    };
    const updateMembers = (id: number) =>
        getGroupMembers({ id }).then(({ data }) => {
            setMembers(data);
        });

    const navigate = useNavigate();
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
                        <Button.Group>
                            <Button
                                onClick={() => {
                                    setInviteGroup(data);
                                    updateMembers(data.id);
                                }}
                            >
                                项目成员
                            </Button>
                            <Button onClick={() => navigate('/project/list?group_id=' + data.id)}>
                                项目
                            </Button>
                            <Button onClick={() => setForm(data)}>详情</Button>
                            <Button
                                danger
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
                                        title: `确定删除分组 "${data.name}" 吗？`,
                                    })
                                }
                            >
                                删除
                            </Button>
                        </Button.Group>
                    </div>
                );
            },
        },
    ];
    return (
        <div className="">
            <Modal
                width="90%"
                open={showInvite}
                onCancel={() => setShowInvite(false)}
                okButtonProps={{ hidden: true }}
            >
                <ProForm
                    formRef={formRef}
                    loading={loading}
                    onFinish={async (values: UserProject) => {
                        if (values.user_id === 0) {
                            return message.warning('请选择用户');
                        }
                        setLoading(true);
                        createUserGroup(values).then(({ msg }) => {
                            setLoading(false);
                            updateMembers(Number(inviteGroup?.id));
                            setShowInvite(false);

                            if (msg) {
                                message.warning(msg);
                            } else {
                                message.success('邀请成功');
                            }
                        });
                    }}
                >
                    {inviteGroup && (
                        <ProFormText
                            hidden
                            initialValue={inviteGroup?.id}
                            required
                            name="group_id"
                            label="项目ID"
                        />
                    )}

                    <ProFormSelect
                        required
                        name="user_id"
                        label="用户"
                        showSearch
                        options={[
                            { value: 0, label: '请选择用户' },
                            ...(users?.data.map((user) => ({
                                value: user.id,
                                label: user.username,
                            })) || []),
                        ]}
                    />
                </ProForm>
            </Modal>

            <Modal
                width="90%"
                open={members !== undefined}
                onCancel={() => setMembers(undefined)}
                okButtonProps={{ hidden: true }}
                className="mt-5"
            >
                <ProTable
                    search={false}
                    dataSource={members}
                    rowKey="id"
                    toolBarRender={() => [
                        <>
                            <Button onClick={() => setShowInvite(true)}>邀请用户</Button>
                        </>,
                    ]}
                    columns={[
                        { dataIndex: 'id', title: 'ID', search: false },
                        { dataIndex: 'username', title: '用户名', filtered: true },
                        {
                            dataIndex: 'status',
                            title: '状态',
                            valueEnum: {
                                inviting: <div className="text-blue-500">等待</div>,
                                joined: <div className="text-green-500">已同意</div>,
                                rejected: <div className="text-gray-500">已拒绝</div>,
                            },
                        },
                        { dataIndex: 'nickname', title: '昵称', filtered: true },
                        { dataIndex: 'created_at', title: '创建时间', search: false },
                        {
                            title: '操作',
                            search: false,
                            render: (data: any | GroupMember) => {
                                return (
                                    <Button
                                        danger={true}
                                        onClick={() =>
                                            Modal.confirm({
                                                onOk: () => {
                                                    setLoading(true);
                                                    deleteUserGroup([data.id]).then(({ msg }) => {
                                                        setLoading(false);
                                                        if (msg !== undefined) {
                                                            return message.error(msg);
                                                        }
                                                        message.success('删除成功!');
                                                        updateMembers(Number(inviteGroup?.id));
                                                    });
                                                },
                                                title: `确定删除成员 "${data.username}" 吗？`,
                                            })
                                        }
                                    >
                                        删除
                                    </Button>
                                );
                            },
                        },
                    ]}
                    pagination={{ pageSize: 10 }}
                />
            </Modal>

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
