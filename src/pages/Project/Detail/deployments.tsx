import { getCommands } from '@/services/ant-design-pro/commands';
import { createDeployment, Deployment, getDeployments } from '@/services/ant-design-pro/deployment';
import { getEnvironments } from '@/services/ant-design-pro/environment';
import { ProjectDetail } from '@/services/ant-design-pro/project';
import { useRequest } from '@@/plugin-request';
import {
    ActionType,
    ProForm,
    ProFormSelect,
    ProFormSwitch,
    ProFormText,
} from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-table';
import { Button, Modal } from 'antd';
import classNames from 'classnames';
import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'umi';

const Deployments: React.FC<{ project: ProjectDetail }> = ({ project }) => {
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const tableRef = useRef<ActionType>();
    const { data: environments } = useRequest(() => getEnvironments({ project_id: project?.id }));
    const { data: commands } = useRequest(() => getCommands({ project_id: project?.id }));
    const navigate = useNavigate();

    const columns = [
        { dataIndex: 'id', title: 'ID' },
        { dataIndex: 'version', title: '版本' },
        { dataIndex: 'comment', title: '备注' },
        {
            dataIndex: 'status',
            title: '状态',
            render: (status: any | string, data: any | Deployment) => {
                return (
                    <div
                        key={data.id}
                        className={classNames({
                            'text-green-500': status === 'finished',
                            'text-blue-500': status === 'running',
                            'text-red-500': status === 'failed',
                        })}
                    >
                        {status}
                    </div>
                );
            },
        },
        { dataIndex: 'created_at', title: '创建时间' },
        { dataIndex: 'updated_at', title: '更新时间' },
        {
            title: '操作',
            render: (data: any) => {
                return <Link to={`/project/deployment?id=${data.id}`}>详情</Link>;
            },
        },
    ];
    return (
        <div className="">
            <Modal
                open={showForm}
                onCancel={() => setShowForm(false)}
                okButtonProps={{ hidden: true }}
            >
                <ProForm
                    title="新建环境"
                    loading={loading}
                    onFinish={async (values: Record<string, any>) => {
                        setLoading(true);
                        createDeployment({ ...values, project_id: Number(project.id) }).then(
                            (data) => {
                                setLoading(false);
                                setShowForm(false);
                                tableRef.current?.reload();
                                navigate(`/project/deployment?id=${data.id}`);
                            },
                        );
                    }}
                >
                    <ProFormText
                        required
                        name="comment"
                        label="部署备注"
                        tooltip="最长为 24 位"
                        placeholder="如：修复 xxx bug"
                    />
                    <ProFormText
                        required
                        name="version"
                        label="部署版本"
                        tooltip="分支名或者版本号"
                        placeholder="如：master"
                        initialValue={project?.default_branch}
                    />
                    <ProFormSelect
                        required
                        mode="multiple"
                        name="environments"
                        label="环境"
                        options={environments?.map((data) => ({
                            value: data.id,
                            label: data.name,
                        }))}
                        initialValue={environments
                            ?.filter((env) => env.settings.default_selected)
                            .map((env) => env.id)}
                    />
                    {commands
                        ?.filter((command) => command.optional)
                        .map((command) => (
                            <ProFormSwitch
                                label={command.name}
                                key={command.id}
                                name={['params', '' + command.id]}
                                initialValue={command.default_selected}
                            />
                        ))}
                </ProForm>
            </Modal>

            <ProTable
                toolBarRender={() => [
                    <Button key="button" type="primary" onClick={() => setShowForm(true)}>
                        开始部署
                    </Button>,
                ]}
                columns={columns}
                request={async (params) => getDeployments({ ...params, project_id: project?.id })}
                pagination={{ pageSize: 10 }}
            ></ProTable>
        </div>
    );
};

export default Deployments;
