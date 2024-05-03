import { Key, createKey, deleteKeys, getKeys, updateKey } from '@/services/ant-design-pro/key';
import {
    ActionType,
    ProColumns,
    ProForm,
    ProFormInstance,
    ProFormText,
    ProFormTextArea,
} from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-table';
import { Button, Modal, message } from 'antd';
import React, { useRef, useState } from 'react';

const List: React.FC = () => {
    const [key, setKey] = useState<Key>();
    const [loading, setLoading] = useState(false);
    const formRef = useRef<ProFormInstance>();
    const tableRef = useRef<ActionType>();
    const [] = useState<number[]>([]);
    const setForm = (data: any) => {
        setKey(data);
        formRef.current?.setFieldsValue(data);
    };
    const columns: ProColumns<Key>[] = [
        { dataIndex: 'id', title: 'ID', search: false },
        { dataIndex: 'name', title: '名称', filtered: true },
        { dataIndex: 'created_at', title: '创建时间', search: false },
        { dataIndex: 'updated_at', title: '更新时间', search: false },
        {
            title: '操作',
            search: false,
            render: (data: any | Key) => {
                return (
                    <div className="flex gap-3">
                        <Button onClick={() => setForm(data)}>详情</Button>
                        <Button
                            onClick={() =>
                                Modal.confirm({
                                    onOk: () => {
                                        setLoading(true);
                                        deleteKeys([data.id]).then(({ msg }) => {
                                            if (msg !== undefined) return message.error(msg);
                                            tableRef.current?.reload();
                                            setLoading(false);
                                        });
                                    },
                                    title: `确定删除密钥 "${data.name}" 吗？`,
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
                open={key !== undefined}
                onCancel={() => setForm(undefined)}
                okButtonProps={{ hidden: true }}
            >
                <ProForm
                    formRef={formRef}
                    title="新建环境"
                    loading={loading}
                    onFinish={async (values: Record<string, any>) => {
                        setLoading(true);
                        (key?.id ? updateKey : createKey)(values).then(({ msg }) => {
                            setLoading(false);
                            setForm(undefined);
                            tableRef.current?.reload();
                            if (msg) {
                                message.error(msg);
                            } else {
                                message.success('修改成功!');
                            }
                        });
                    }}
                    initialValues={key}
                >
                    <ProFormText required hidden name="id" label="ID" />
                    <ProFormText
                        required
                        name="name"
                        label="密钥名称"
                        tooltip="最长为 24 位"
                        placeholder="请输入名称"
                    />
                    <ProFormTextArea
                        required={key?.id !== undefined}
                        name="public_key"
                        label="公钥"
                    />
                    <ProFormTextArea
                        required={key?.id !== undefined}
                        name="private_key"
                        label="私钥"
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
                request={getKeys}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default List;
