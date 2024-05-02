import { deleteProject, getProjects } from '@/services/ant-design-pro/project';
import { ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-table';
import { Button, Modal, message } from 'antd';
import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'umi';

const List: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const tableRef = useRef<ActionType>();
    const columns = [
        { dataIndex: 'id', title: 'ID' },
        { dataIndex: 'name', title: '名称', filtered: true },
        { dataIndex: 'repo_address', title: '仓库地址' },
        { dataIndex: 'project_path', title: '项目路径' },
        { dataIndex: 'default_branch', title: '默认分支' },
        { dataIndex: 'created_at', title: '创建时间' },
        { dataIndex: 'updated_at', title: '更新时间' },
        {
            title: '操作',
            render: (data: any) => {
                return (
                    <div className="flex gap-3 items-center">
                        <Link to={`/project/detail?id=${data.id}`}>详情</Link>
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
    return (
        <div className="">
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
