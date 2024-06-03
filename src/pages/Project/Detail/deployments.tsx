import { getCommands } from '@/services/ant-design-pro/commands';
import { createDeployment, Deployment, getDeployments } from '@/services/ant-design-pro/deployment';
import { getEnvironments } from '@/services/ant-design-pro/environment';
import { ProjectDetail } from '@/services/ant-design-pro/project';
import { useRequest } from '@@/plugin-request';
import {
    ActionType,
    ProColumns,
    ProForm,
    ProFormInstance,
    ProFormSelect,
    ProFormSwitch,
    ProFormText,
} from '@ant-design/pro-components';
import { ProFormItem } from '@ant-design/pro-form';
import { ProTable } from '@ant-design/pro-table';
import { AutoComplete, Button, Modal } from 'antd';
import classNames from 'classnames';
import copy from 'copy-to-clipboard';
import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'umi';

const Deployments: React.FC<{ project: ProjectDetail }> = ({ project }) => {
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const tableRef = useRef<ActionType>();
    const { data: environments } = useRequest(() => getEnvironments({ project_id: project?.id }));
    const { data: commands } = useRequest(() => getCommands({ project_id: project?.id }));
    const navigate = useNavigate();

    const columns: ProColumns<Deployment>[] = [
        { dataIndex: 'id', title: 'ID', search: false },
        { dataIndex: 'comment', title: '备注' },
        { dataIndex: 'version', title: '版本' },
        {
            dataIndex: 'status',
            title: '状态',
            render: (status: any, data: Deployment) => {
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
            valueEnum: {
                waiting: '等待',
                running: '运行中',
                failed: '失败',
                finished: '成功',
            },
        },
        { dataIndex: 'created_at', title: '创建时间', search: false },
        { dataIndex: 'updated_at', title: '更新时间', search: false },
        {
            title: '操作',
            search: false,
            render: (data: any) => {
                return <Link to={`/project/deployment?id=${data.id}`}>详情</Link>;
            },
        },
    ];
    const branches: { value: string; label: string }[] = [];
    for (const branch of project?.settings.branches || []) {
        branches.push({
            value: branch,
            label: `分支: ${branch}`,
        });
    }

    for (const branch of project?.settings.tags || []) {
        branches.push({
            value: branch,
            label: `标签: ${branch}`,
        });
    }

    const formRef = useRef<ProFormInstance>();

    return (
        <div className="">
            <Modal
                open={showForm}
                onCancel={() => setShowForm(false)}
                okButtonProps={{ hidden: true }}
            >
                <ProForm
                    formRef={formRef}
                    title="开始部署"
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

                    <ProFormText name="version" hidden initialValue={project.default_branch} />

                    <ProFormItem name="version" label="版本/分支">
                        <AutoComplete
                            className="w-full mb-5"
                            placeholder="如：master"
                            options={branches}
                        />
                    </ProFormItem>
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

                    <Button
                        className="mb-5"
                        onClick={() =>
                            copy(`curl -X POST ${location.origin}/api/deployment/go \\
  -H "Content-Type: application/json" \\
  -d '{
    "uuid": "${project.uuid}",
    "version": "${formRef.current?.getFieldValue('version')}",
    "comment": "${formRef.current?.getFieldValue('comment')}",
    "params": ${JSON.stringify(formRef.current?.getFieldValue('params') || null)},
    "environments": ${JSON.stringify(formRef.current?.getFieldValue('environments'))}
  }'
`)
                        }
                    >
                        复制 CURL 命令
                    </Button>
                </ProForm>
            </Modal>

            <ProTable
                rowKey="id"
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
