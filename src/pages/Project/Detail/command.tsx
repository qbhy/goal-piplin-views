import {
    Command,
    createCommand,
    deleteCommands,
    getCommands,
    updateCommand,
} from '@/services/ant-design-pro/commands';
import { getEnvironments } from '@/services/ant-design-pro/environment';
import {
    ActionType,
    ProColumns,
    ProForm,
    ProFormGroup,
    ProFormInstance,
    ProFormSelect,
    ProFormSwitch,
    ProFormText,
    ProFormTextArea,
} from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-table';
import { useRequest } from 'ahooks';
import { Button, Modal } from 'antd';
import React, { useRef, useState } from 'react';

const boolText = (data: any) => {
    return data ? '是' : '否';
};
const Commands: React.FC<{ projectId: number }> = ({ projectId }) => {
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState<Command>();
    const { data: environments, refresh: refreshEnv } = useRequest(() =>
        getEnvironments({ project_id: projectId }).then((res) => res),
    );
    const tableRef = useRef<ActionType>();
    const formRef = useRef<ProFormInstance>();
    const setForm = (data?: Command) => {
        setConfig(data);
        if (data !== undefined) {
            setTimeout(() => formRef.current?.setFieldsValue(data), 300);
        }
    };
    const columns: ProColumns<Command>[] = [
        { dataIndex: 'id', title: 'ID', search: false },
        { dataIndex: 'name', title: '步骤名称' },
        {
            dataIndex: 'step',
            title: '步骤',
            valueEnum: {
                before_clone: '克隆之前',
                after_clone: '克隆之后',
                before_prepare: '准备之后',
                after_prepare: '准备之后',
                before_release: '发布之前',
                after_release: '发布之后',
            },
        },
        { dataIndex: 'user', title: '用户' },
        {
            dataIndex: 'optional',
            title: '是否可选',
            render: boolText,
            search: false,
        },
        { dataIndex: 'default_selected', title: '默认选中', render: boolText, search: false },
        { dataIndex: 'created_at', title: '创建时间', search: false },
        { dataIndex: 'updated_at', title: '更新时间', search: false },
        {
            title: '操作',
            search: false,
            render: (data: any | Command) => {
                return (
                    <div className="flex gap-3">
                        <Button onClick={() => setForm(data)}>编辑</Button>
                        <Button
                            onClick={() =>
                                Modal.confirm({
                                    onOk: () => {
                                        setLoading(true);
                                        deleteCommands([data.id]).then(() => {
                                            tableRef.current?.reload();
                                            setLoading(false);
                                            refreshEnv();
                                        });
                                    },
                                    title: `确定删除命令 "${data.name}" 吗？`,
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
                    title="新建环境"
                    loading={loading}
                    onFinish={async (values: Record<string, any>) => {
                        setLoading(true);
                        (config?.id ? updateCommand : createCommand)({
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
                        hidden
                        initialValue={config?.project_id}
                        required
                        disabled
                        name="project_id"
                        label="项目ID"
                    />
                    <ProFormText
                        required
                        name="name"
                        label="名称"
                        tooltip="最长为 24 位"
                        placeholder="请输入名称"
                    />
                    <ProFormSelect
                        required
                        name="step"
                        label="步骤"
                        options={[
                            { value: 'before_clone', label: '克隆之前' },
                            { value: 'after_clone', label: '克隆之后' },
                            { value: 'before_prepare', label: '准备之前' },
                            { value: 'after_prepare', label: '准备之后' },
                            { value: 'before_release', label: '发布之前' },
                            { value: 'after_release', label: '发布之后' },
                        ]}
                    />

                    <ProFormSelect
                        mode="multiple"
                        name="environments"
                        label="环境"
                        options={environments?.data.map((data: any) => ({
                            value: data.id,
                            label: data.name,
                        }))}
                    />
                    <ProFormText required name="user" label="执行用户" tooltip="如：root" />
                    <ProFormText
                        required
                        name="sort"
                        label="排序"
                        initialValue={1}
                        tooltip="越小越靠前"
                    />
                    <ProFormGroup>
                        <ProFormSwitch name="optional" label="是否可选" />
                        <ProFormSwitch name="default_selected" label="是否默认选中" />
                    </ProFormGroup>
                    <ProFormTextArea
                        required
                        name="script"
                        label="部署脚本"
                        placeholder="请输入脚本"
                    />
                </ProForm>
            </Modal>

            <ProTable
                rowKey="id"
                actionRef={tableRef}
                toolBarRender={() => [
                    <Button
                        key="button"
                        type="primary"
                        onClick={() =>
                            setForm({
                                created_at: '',
                                default_selected: true,
                                environments: [],
                                name: '',
                                optional: false,
                                project_id: Number(projectId),
                                script: '',
                                sort: 0,
                                step: '',
                                updated_at: '',
                                user: '',
                            })
                        }
                    >
                        新建部署步骤
                    </Button>,
                ]}
                columns={columns}
                request={async (params) => {
                    return getCommands({
                        project_id: projectId,
                        ...params,
                    });
                }}
                pagination={{ pageSize: 10 }}
            ></ProTable>
        </div>
    );
};

export default Commands;
