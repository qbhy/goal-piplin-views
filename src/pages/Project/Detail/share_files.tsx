import {
    ShareFile,
    createShareFile,
    deleteShareFiles,
    getShareFiles,
    updateShareFile,
} from '@/services/ant-design-pro/share_files';
import { ActionType, ProForm, ProFormInstance, ProFormText } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-table';
import { Button, Modal } from 'antd';
import React, { useRef, useState } from 'react';

const ShareFiles: React.FC<{ projectId?: number }> = ({ projectId }) => {
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState<ShareFile>();
    const tableRef = useRef<ActionType>();
    const formRef = useRef<ProFormInstance>();
    const setForm = (data: any) => {
        setConfig(data);
        if (data !== undefined) {
            formRef.current?.setFieldsValue(data);
        }
    };
    const columns = [
        { dataIndex: 'id', title: 'ID' },
        { dataIndex: 'name', title: '共享目录名' },
        { dataIndex: 'created_at', title: '创建时间' },
        { dataIndex: 'updated_at', title: '更新时间' },
        {
            title: '操作',
            render: (data: any | ShareFile) => {
                return (
                    <div className="flex gap-3">
                        <Button onClick={() => setForm(data)}>编辑</Button>
                        <Button
                            onClick={() =>
                                Modal.confirm({
                                    onOk: () => {
                                        setLoading(true);
                                        deleteShareFiles([data.id]).then(() => {
                                            tableRef.current?.reload();
                                            setLoading(false);
                                        });
                                    },
                                    title: `确定删除共享文件 "${data.name}" 吗？`,
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
                    title="共享目录"
                    loading={loading}
                    onFinish={async (values: Record<string, any>) => {
                        setLoading(true);
                        (config?.id ? updateShareFile : createShareFile)({
                            ...values,
                            project_id: projectId,
                        }).then(() => {
                            setLoading(false);
                            setForm(undefined);
                            tableRef.current?.reload();
                        });
                    }}
                >
                    <ProFormText initialValue={config?.id} required disabled name="id" label="ID" />
                    <ProFormText
                        initialValue={config?.project_id}
                        required
                        disabled
                        name="project_id"
                        label="项目ID"
                    />
                    <ProFormText
                        required
                        name="name"
                        label="文件/文件夹名称"
                        tooltip="最长为 24 位"
                        placeholder="请输入名称"
                    />
                    <ProFormText
                        required
                        name="path"
                        label="文件/文件夹路径"
                        placeholder="/storage"
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
                        新建共享文件/目录
                    </Button>,
                ]}
                columns={columns}
                request={async (params) =>
                    getShareFiles({
                        project_id: projectId,
                        page: params.current,
                        page_size: params.pageSize,
                    })
                }
                pagination={{ pageSize: 10 }}
            ></ProTable>
        </div>
    );
};

export default ShareFiles;
