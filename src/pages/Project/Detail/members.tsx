import { ProjectDetail, ProjectMember } from '@/services/ant-design-pro/project';
import { getUsers } from '@/services/ant-design-pro/user';
import {
    UserProject,
    createUserProject,
    deleteUserProject,
    updateUserProject,
} from '@/services/ant-design-pro/user_project';
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

const Members: React.FC<{ project: ProjectDetail; update: () => void }> = ({ project, update }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<UserProject>();
    const { data: users } = useRequest(async (name: string = '') =>
        getUsers({ nickname: name, username: name }),
    );
    const tableRef = useRef<ActionType>();
    const formRef = useRef<ProFormInstance>();
    const setForm = (data?: UserProject) => {
        setData(data);
        if (data !== undefined) {
            setTimeout(() => formRef.current?.setFieldsValue(data), 300);
        }
    };

    const columns: ProColumns<ProjectMember>[] = [
        { dataIndex: 'id', title: '用户ID', search: false },
        { dataIndex: 'user_id', title: '用户ID', search: false },
        { dataIndex: 'username', title: '用户名', search: false },
        { dataIndex: 'nickname', title: '昵称', search: false },
        {
            dataIndex: 'status',
            title: '状态',
            valueEnum: { inviting: '等待', joined: '已同意', rejected: '已拒绝' },
            search: false,
        },
        {
            title: '操作',
            search: false,
            render: (item: any | UserProject) => {
                console.log('item', item);
                return (
                    <div className="flex gap-3">
                        <Button
                            onClick={() =>
                                Modal.confirm({
                                    onOk: () => {
                                        setLoading(true);
                                        deleteUserProject([item.id]).then(({ msg }) => {
                                            tableRef.current?.reload();
                                            setLoading(false);
                                            if (msg) {
                                                message.warning(msg);
                                            } else {
                                                update();
                                            }
                                        });
                                    },
                                    title: `确定删除该成员 "${item.nickname}" 吗？`,
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
                open={data !== undefined}
                onCancel={() => setForm(undefined)}
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
                        (data?.id ? updateUserProject : createUserProject)({
                            ...values,
                            project_id: project?.id,
                        }).then(({ msg }) => {
                            setLoading(false);
                            setForm(undefined);
                            tableRef.current?.reload();

                            if (msg) {
                                message.warning(msg);
                            } else {
                                update();
                            }
                        });
                    }}
                >
                    <ProFormText
                        hidden
                        initialValue={project.id}
                        required
                        name="project_id"
                        label="项目ID"
                    />
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

            <ProTable
                search={false}
                dataSource={project.members}
                rowKey="user_id"
                actionRef={tableRef}
                toolBarRender={() => [
                    <Button
                        key="button"
                        type="primary"
                        onClick={() =>
                            setForm({
                                id: 0,
                                project_id: project.id,
                                user_id: 0,
                                status: 'inviting',
                            })
                        }
                    >
                        邀请新用户
                    </Button>,
                ]}
                columns={columns}
                pagination={{ pageSize: 10 }}
            ></ProTable>
        </div>
    );
};

export default Members;
