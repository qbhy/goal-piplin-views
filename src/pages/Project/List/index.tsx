import { getProjects } from '@/services/ant-design-pro/project';
import { ProTable } from '@ant-design/pro-table';
import { Button } from 'antd';
import React from 'react';
import { Link, useNavigate } from 'umi';

const List: React.FC = () => {
  const navigate = useNavigate();
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
        console.log('render', data);
        return <Link to={`/project/detail?id=${data.id}`}>详情</Link>;
      },
    },
  ];
  return (
    <div className="">
      <ProTable
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
