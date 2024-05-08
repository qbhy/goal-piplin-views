import {
    ConfigFile,
    createConfigFile,
    deleteConfigFiles,
    getConfigFiles,
    updateConfigFile,
} from '@/services/ant-design-pro/config_files';
import { getEnvironments } from '@/services/ant-design-pro/environment';
import { useRequest } from '@@/plugin-request';
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
import { Button, Modal } from 'antd';
import React, { useRef, useState } from 'react';

const ConfigFiles: React.FC<{ projectId?: number }> = ({ projectId }) => {
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState<ConfigFile>();
    const { data: environments, refresh: refreshEnv } = useRequest(() =>
        getEnvironments({ project_id: projectId }).then((res) => res),
    );
    const tableRef = useRef<ActionType>();
    const formRef = useRef<ProFormInstance>();
    const setForm = (data: any) => {
        setConfig(data);
        if (data !== undefined) {
            setTimeout(() => formRef.current?.setFieldsValue(data), 300);
        }
    };
    const columns: ProColumns<ConfigFile>[] = [
        { dataIndex: 'id', title: 'ID', search: false },
        { dataIndex: 'name', title: '配置文件名' },
        { dataIndex: 'content', title: '内容', hidden: true },
        { dataIndex: 'created_at', title: '创建时间', search: false },
        { dataIndex: 'updated_at', title: '更新时间', search: false },
        {
            title: '操作',
            search: false,
            render: (data: any | ConfigFile) => {
                return (
                    <div className="flex gap-3">
                        <Button onClick={() => setForm(data)}>编辑</Button>
                        <Button
                            onClick={() =>
                                Modal.confirm({
                                    onOk: () => {
                                        setLoading(true);
                                        deleteConfigFiles([data.id]).then(() => {
                                            tableRef.current?.reload();
                                            setLoading(false);
                                            refreshEnv();
                                        });
                                    },
                                    title: `确定删除文件 "${data.name}" 吗？`,
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
                open={config !== undefined}
                onCancel={() => setForm(undefined)}
                okButtonProps={{ hidden: true }}
            >
                <ProForm
                    formRef={formRef}
                    title="新建配置文件"
                    loading={loading}
                    onFinish={async (values: Record<string, any>) => {
                        setLoading(true);
                        (config?.id ? updateConfigFile : createConfigFile)({
                            ...values,
                            project_id: projectId,
                        }).then(() => {
                            setLoading(false);
                            setForm(undefined);
                            tableRef.current?.reload();
                        });
                    }}
                >
                    <ProFormText
                        initialValue={config?.id}
                        required
                        disabled
                        hidden
                        name="id"
                        label="ID"
                    />
                    <ProFormText
                        required
                        name="name"
                        label="配置名称"
                        tooltip="最长为 24 位"
                        placeholder="请输入名称"
                    />
                    <ProFormText
                        required
                        name="path"
                        label="文件路径"
                        placeholder="如：config.toml"
                    />

                    <ProFormSelect
                        mode="multiple"
                        name="environments"
                        label="环境"
                        options={environments?.map((data) => ({
                            value: data.id,
                            label: data.name,
                        }))}
                    />

                    <ProFormTextArea
                        required
                        name="content"
                        label="文件内容"
                        placeholder="请输入文件内容"
                    />
                </ProForm>
            </Modal>

            <ProTable
                actionRef={tableRef}
                toolBarRender={() => [
                    <Button
                        key="button"
                        type="primary"
                        onClick={() =>
                            setForm({
                                content: '',
                                created_at: '',
                                environments: undefined,
                                id: undefined,
                                name: '',
                                path: '',
                                project_id: Number(projectId),
                                updated_at: '',
                            })
                        }
                    >
                        新建配置文件
                    </Button>,
                ]}
                columns={columns}
                request={async (params) =>
                    getConfigFiles({
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

export default ConfigFiles;
