import { getCabinets } from '@/services/ant-design-pro/cabinet';
import {
    Environment,
    createEnvironment,
    deleteEnvironment,
    getEnvironments,
    updateEnvironment,
} from '@/services/ant-design-pro/environment';
import { useRequest } from '@@/plugin-request';
import {
    ActionType,
    ProColumns,
    ProForm,
    ProFormCheckbox,
    ProFormGroup,
    ProFormList,
    ProFormSelect,
    ProFormText,
} from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-table';
import { Button, Divider, Modal } from 'antd';
import React, { useRef, useState } from 'react';

const Environments: React.FC<{ projectId?: number }> = ({ projectId }) => {
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [env, setEnv] = useState<Environment>();
    const { data: cabinets } = useRequest(() => getCabinets().then((res) => res));
    const { data: environments, refresh: refreshEnv } = useRequest(() =>
        getEnvironments({ project_id: projectId }).then((res) => res),
    );
    const tableRef = useRef<ActionType>();
    const columns: ProColumns<Environment>[] = [
        { dataIndex: 'id', title: 'ID', search: false },
        { dataIndex: 'name', title: '环境名' },
        { dataIndex: 'created_at', title: '创建时间', search: false },
        { dataIndex: 'updated_at', title: '更新时间', search: false },
        {
            title: '操作',
            render: (data: any | Environment) => {
                return (
                    <div className="flex gap-3">
                        <Button onClick={() => setEnv(data)}>编辑</Button>
                        <Button
                            onClick={() =>
                                Modal.confirm({
                                    onOk: () => {
                                        setLoading(true);
                                        deleteEnvironment([data.id]).then(() => {
                                            tableRef.current?.reload();
                                            setLoading(false);
                                            refreshEnv();
                                        });
                                    },
                                    title: `确定删除环境 "${data.name}" 吗？`,
                                })
                            }
                        >
                            删除
                        </Button>
                    </div>
                );
            },
            search: false,
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
                        createEnvironment({ ...values, project_id: projectId }).then(() => {
                            setLoading(false);
                            setShowForm(false);
                            tableRef.current?.reload();
                            refreshEnv();
                        });
                    }}
                >
                    <ProFormText
                        required
                        name="name"
                        label="环境名称"
                        tooltip="最长为 24 位"
                        placeholder="请输入名称"
                    />
                </ProForm>
            </Modal>

            <Modal
                width="90%"
                open={env !== undefined}
                onCancel={() => setEnv(undefined)}
                okButtonProps={{ hidden: true }}
            >
                <ProForm
                    title="编辑环境"
                    loading={loading}
                    onFinish={async (values: Record<string, any>) => {
                        setLoading(true);
                        updateEnvironment({ ...values, project_id: projectId }).then(() => {
                            setLoading(false);
                            setEnv(undefined);
                            tableRef.current?.reload();
                        });
                    }}
                    initialValues={env}
                >
                    <ProFormText initialValue={env?.id} required disabled name="id" label="ID" />
                    <ProFormText
                        required
                        name="name"
                        label="环境名称"
                        tooltip="最长为 24 位"
                        placeholder="请输入名称"
                    />

                    <ProFormSelect
                        mode="multiple"
                        name={['settings', 'cabinets']}
                        label="机柜"
                        options={
                            cabinets
                                ? cabinets.map((cabinet) => ({
                                      value: cabinet.id,
                                      label: cabinet.name + ` (${cabinet.settings.length}台)`,
                                  }))
                                : []
                        }
                    />

                    <ProFormSelect
                        name={['settings', 'linkage_deploy']}
                        label="联动部署环境"
                        options={environments
                            ?.filter((item) => item.id !== env?.id)
                            .map((cabinet) => ({
                                value: cabinet.id,
                                label: cabinet.name,
                            }))}
                    />

                    <ProFormList
                        className="w-full"
                        containerClassName="w-full"
                        alwaysShowItemLabel
                        creatorButtonProps={{
                            creatorButtonText: '添加服务器',
                        }}
                        label="服务器列表"
                        name={['settings', 'servers']}
                    >
                        <ProFormGroup>
                            <Divider />
                            <ProFormText
                                required
                                name="host"
                                label="服务器地址"
                                tooltip="IP地址或者域名"
                                placeholder="请输入"
                            />
                            <ProFormText
                                dataFormat="number"
                                required
                                name="port"
                                initialValue={22}
                                label="端口号"
                                placeholder="如：22"
                            />
                            <ProFormText
                                required
                                name="user"
                                initialValue="root"
                                label="用户"
                                placeholder="如：root"
                            />
                        </ProFormGroup>
                    </ProFormList>
                    <ProFormCheckbox name={['settings', 'default_selected']} label="是否默认选中" />
                </ProForm>
            </Modal>

            <ProTable
                actionRef={tableRef}
                toolBarRender={() => [
                    // todo 添加环境，弹出表单 (modal)
                    <Button key="button" type="primary" onClick={() => setShowForm(true)}>
                        新建环境
                    </Button>,
                ]}
                columns={columns}
                request={async (params) =>
                    getEnvironments({
                        project_id: projectId,
                        name: params.name,
                        ...params,
                    })
                }
                pagination={{ pageSize: 10 }}
            ></ProTable>
        </div>
    );
};

export default Environments;
