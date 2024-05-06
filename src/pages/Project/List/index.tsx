import { getGroups } from '@/services/ant-design-pro/group';
import { getKeys } from '@/services/ant-design-pro/key';
import {
    copyProject,
    deleteProject,
    getProjects,
    Project,
} from '@/services/ant-design-pro/project';
import { useRequest } from '@@/plugin-request';
import {
    ActionType,
    ProColumns,
    ProForm,
    ProFormInstance,
    ProFormSelect,
    ProFormText,
} from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-table';
import { Button, message, Modal } from 'antd';
import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'umi';

const List: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const tableRef = useRef<ActionType>();
    const [targetProject, setTargetProject] = useState<Project>();
    const formRef = useRef<ProFormInstance>();
    const columns: ProColumns<Project>[] = [
        { dataIndex: 'id', title: 'ID', search: false },
        { dataIndex: 'name', title: '名称', filtered: true },
        { dataIndex: 'repo_address', title: '仓库地址' },
        { dataIndex: 'project_path', title: '项目路径' },
        { dataIndex: 'default_branch', title: '默认分支' },
        { dataIndex: 'created_at', title: '创建时间', search: false },
        { dataIndex: 'updated_at', title: '更新时间', search: false },
        {
            title: '操作',
            search: false,
            render: (data: any | Project) => {
                return (
                    <div className="flex gap-3 items-center">
                        <Link to={`/project/detail?id=${data.id}`}>详情</Link>
                        <Button
                            onClick={() => {
                                setTargetProject(data);
                                setTimeout(() => formRef.current?.setFieldsValue(data), 100);
                            }}
                        >
                            复制
                        </Button>
                        <Button
                            danger={true}
                            onClick={() =>
                                Modal.confirm({
                                    onOk: () => {
                                        setLoading(true);
                                        deleteProject(data.id).then(({ msg }) => {
                                            if (msg !== undefined) {
                                                return message.error(msg);
                                            }
                                            message.success('删除成功!');
                                            tableRef.current?.reload();
                                            setLoading(false);
                                        });
                                    },
                                    title: `确定删除项目 "${data.name}" 吗？`,
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
    const { data: groups } = useRequest(getGroups);
    const { data: keys } = useRequest(async () =>
        getKeys().then((res) => {
            return res;
        }),
    );

    return (
        <div className="">
            <Modal
                width="90%"
                open={targetProject !== undefined}
                onCancel={() => setTargetProject(undefined)}
                okButtonProps={{ hidden: true }}
            >
                <ProForm
                    formRef={formRef}
                    loading={loading}
                    onFinish={async (values: Record<string, any>) => {
                        setLoading(true);
                        copyProject({
                            ...values,
                            target_project: targetProject?.id,
                        }).then(({ msg }) => {
                            setLoading(false);
                            setTargetProject(undefined);
                            if (msg) {
                                return message.error(msg);
                            }
                            message.success('复制成功!');
                            tableRef.current?.reload();
                        });
                    }}
                >
                    <ProFormText
                        required
                        name="name"
                        label="名称"
                        tooltip="最长为 24 位"
                        placeholder="请输入名称"
                    />

                    <ProFormSelect
                        name="key_id"
                        label="密钥"
                        options={[
                            ...(keys
                                ? keys.map((key) => ({
                                      value: key.id,
                                      label: key.name,
                                  }))
                                : []),
                        ]}
                    />

                    <ProFormText
                        required
                        name="repo_address"
                        label="仓库地址"
                        tooltip="git仓库地址"
                        placeholder="请输入 git 仓库地址"
                    />

                    <ProFormSelect
                        required
                        name="default_branch"
                        label="默认分支"
                        options={[
                            ...(targetProject?.settings.branches.map((branch) => ({
                                label: '分支：' + branch,
                                value: branch,
                            })) || []),
                            ...(targetProject?.settings.tags.map((tag) => ({
                                label: '分支：' + tag,
                                value: tag,
                            })) || []),
                        ]}
                    />

                    <ProFormSelect
                        required
                        width="md"
                        name="group_id"
                        label="分组"
                        initialValue={0}
                        options={[
                            {
                                value: 0,
                                label: '未分组',
                            },
                            ...(groups || []).map((item) => ({ value: item.id, label: item.name })),
                        ]}
                    />
                </ProForm>
            </Modal>

            <ProTable
                actionRef={tableRef}
                loading={loading}
                toolBarRender={() => [
                    <Button onClick={() => navigate('/project/create')} key="button" type="primary">
                        新建
                    </Button>,
                ]}
                columns={columns}
                request={getProjects}
                pagination={{ pageSize: 10 }}
            ></ProTable>
        </div>
    );
};

export default List;
