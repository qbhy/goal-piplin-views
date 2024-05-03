import {
    Cabinet,
    createCabinet,
    deleteCabinets,
    getCabinets,
    updateCabinet,
} from '@/services/ant-design-pro/cabinet';
import {
    ActionType,
    ProColumns,
    ProForm,
    ProFormGroup,
    ProFormInstance,
    ProFormList,
    ProFormSwitch,
    ProFormText,
} from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-table';
import { Button, Divider, Modal, message } from 'antd';
import React, { useRef, useState } from 'react';

const List: React.FC = () => {
    const [cabinet, setCabinet] = useState<Cabinet>();
    const [loading, setLoading] = useState(false);
    const formRef = useRef<ProFormInstance>();
    const tableRef = useRef<ActionType>();
    const [] = useState<number[]>([]);
    const setCabinetForm = (data: any) => {
        setCabinet(data);
        formRef.current?.setFieldsValue(data);
    };
    const columns: ProColumns<Cabinet>[] = [
        { dataIndex: 'id', title: 'ID', search: false },
        { dataIndex: 'name', title: '名称', filtered: true },
        { dataIndex: 'created_at', title: '创建时间', search: false },
        { dataIndex: 'updated_at', title: '更新时间', search: false },
        {
            title: '操作',
            search: false,
            render: (data: any | Cabinet) => {
                return (
                    <div className="flex gap-3">
                        <Button onClick={() => setCabinetForm(data)}>详情</Button>
                        <Button
                            onClick={() =>
                                Modal.confirm({
                                    onOk: () => {
                                        setLoading(true);
                                        deleteCabinets([data.id]).then(({ msg }) => {
                                            if (msg !== undefined) return message.error(msg);
                                            tableRef.current?.reload();
                                            setLoading(false);
                                        });
                                    },
                                    title: `确定删除机柜 "${data.name}" 吗？`,
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
                open={cabinet !== undefined}
                onCancel={() => setCabinetForm(undefined)}
                okButtonProps={{ hidden: true }}
            >
                <ProForm
                    formRef={formRef}
                    title="新建环境"
                    loading={loading}
                    onFinish={async (values: Record<string, any>) => {
                        setLoading(true);
                        (cabinet?.id
                            ? updateCabinet({ id: cabinet.id, ...values })
                            : createCabinet(values)
                        )
                            .then(({ msg }) => {
                                setLoading(false);
                                setCabinetForm(undefined);
                                tableRef.current?.reload();
                                if (msg) {
                                    message.error(msg);
                                } else {
                                    message.success('修改成功!');
                                }
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                    }}
                    initialValues={cabinet}
                >
                    <ProFormText
                        required
                        name="name"
                        label="机柜名称"
                        tooltip="最长为 24 位"
                        placeholder="请输入名称"
                    />

                    <ProFormList
                        className="w-full"
                        containerClassName="w-full"
                        required
                        alwaysShowItemLabel
                        creatorButtonProps={{
                            creatorButtonText: '添加服务器',
                        }}
                        label="服务器列表"
                        name="settings"
                    >
                        <ProFormGroup>
                            <Divider />
                            <ProFormText
                                required
                                name="name"
                                label="服务器名称"
                                tooltip="最长为 24 位"
                                placeholder="请输入"
                            />
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
                            <ProFormSwitch required name="disabled" label="是否禁用" />
                        </ProFormGroup>
                    </ProFormList>
                </ProForm>
            </Modal>

            <ProTable
                actionRef={tableRef}
                toolBarRender={() => [
                    <>
                        <Button
                            onClick={() =>
                                setCabinetForm({
                                    created_at: '',
                                    id: 0,
                                    name: '',
                                    settings: [],
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
                request={getCabinets}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default List;
