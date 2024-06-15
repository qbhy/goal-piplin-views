import Deploy, { DeployAction } from '@/components/Deploy';
import { getCommands } from '@/services/ant-design-pro/commands';
import {
    Deployment,
    getDeployments,
    rollbackDeployment,
} from '@/services/ant-design-pro/deployment';
import { ProjectDetail } from '@/services/ant-design-pro/project';
import { useRequest } from '@@/plugin-request';
import {
    ActionType,
    ProColumns,
    ProForm,
    ProFormSelect,
    ProFormTextArea,
} from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-table';
import { Button, Modal, message } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'umi';

const Deployments: React.FC<{ project: ProjectDetail }> = ({ project }) => {
    const [showRollbackForm, setShowRollbackForm] = useState<Deployment & { outputs?: string[] }>();
    const [params] = useSearchParams();
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
                return (
                    <div>
                        <Button.Group>
                            <Button onClick={() => navigate(`/project/deployment?id=${data.id}`)}>
                                详情
                            </Button>
                            {data.status === 'finished' && (
                                <Button onClick={() => setShowRollbackForm(data)}>撤回</Button>
                            )}
                        </Button.Group>
                    </div>
                );
            },
        },
    ];
    const { data: commands } = useRequest(() => getCommands({ project_id: project?.id }));
    const tableRef = useRef<ActionType>();
    const deployRef = useRef<DeployAction>();

    useEffect(() => {
        if (params.has('deploy')) {
            deployRef?.current?.switch(true);
        }
    }, [params]);

    return (
        <div className="">
            <Modal
                open={showRollbackForm !== undefined}
                onCancel={() => setShowRollbackForm(undefined)}
                title={
                    <div className="font-normal mb-3">
                        <div className="text-xl font-bold">
                            撤回到提交记录为：{showRollbackForm?.comment}
                        </div>
                        <div className="mt-3">提交版本为：{showRollbackForm?.commit}</div>
                    </div>
                }
            >
                {showRollbackForm?.outputs ? (
                    <div>
                        <div>回滚成功</div>
                        <div
                            className="py-3 mt-3"
                            dangerouslySetInnerHTML={{
                                __html: showRollbackForm?.outputs
                                    .join('<br/>')
                                    .replaceAll('\n', '<br/>'),
                            }}
                        ></div>
                    </div>
                ) : (
                    <ProForm
                        onFinish={async (value) => {
                            rollbackDeployment({ id: Number(showRollbackForm?.id), ...value })
                                .then(({ msg, data }) => {
                                    if (msg) {
                                        setShowRollbackForm(undefined);
                                        return message.error(msg);
                                    }
                                    message.success('回滚成功');
                                    if (showRollbackForm)
                                        setShowRollbackForm({ ...showRollbackForm, outputs: data });
                                })
                                .catch(() => setShowRollbackForm(undefined));
                        }}
                    >
                        {commands && (
                            <ProFormSelect
                                label="部署步骤"
                                name="commands"
                                mode="multiple"
                                initialValue={commands
                                    .filter(
                                        (cmd) =>
                                            ['before_release', 'after_release'].includes(
                                                cmd.step,
                                            ) && cmd.default_selected,
                                    )
                                    .map((cmd) => cmd.id)}
                                options={commands
                                    .filter((cmd) =>
                                        ['before_release', 'after_release'].includes(cmd.step),
                                    )
                                    .map((cmd) => ({
                                        value: cmd.id,
                                        label: `${cmd.name}    (${cmd.step})`,
                                    }))}
                            />
                        )}
                        <ProFormTextArea name="before_release" label="切换之前运行的脚本" />
                        <ProFormTextArea name="after_release" label="切换之后运行的脚本" />
                    </ProForm>
                )}
            </Modal>

            <Deploy
                ref={deployRef}
                project={project}
                onDeploy={(data) => {
                    tableRef.current?.reload();
                    navigate(`/project/deployment?id=${data.id}`);
                }}
            />

            <ProTable
                actionRef={tableRef}
                rowKey="id"
                toolBarRender={() => [
                    <Button
                        key="button"
                        type="primary"
                        onClick={() => deployRef.current?.switch(true)}
                    >
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
