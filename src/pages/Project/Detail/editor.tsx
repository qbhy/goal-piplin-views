import { getGroups } from '@/services/ant-design-pro/group';
import { getKeys } from '@/services/ant-design-pro/key';
import { ProjectDetail, updateProject } from '@/services/ant-design-pro/project';
import { useRequest } from '@@/plugin-request';
import { ProForm, ProFormInstance, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import React, { useRef } from 'react';

const Editor: React.FC<{ project?: ProjectDetail }> = ({ project }) => {
  const update = async (values: any) => {
    await updateProject(values).then(() => message.success({ content: '修改成功' }));
  };
  const { data: keys } = useRequest(getKeys);
  const { data: groups } = useRequest(getGroups);
  const formRef = useRef<ProFormInstance>();

  return (
    <ProForm formRef={formRef} onFinish={update} initialValues={project}>
      <ProFormText name="id" label="ID" disabled />
      <ProFormText name="name" label="名称" />
      <ProFormText name="default_branch" label="默认分支" />
      <ProFormText name="project_path" label="项目路径" />
      <ProFormText name="repo_address" label="仓库地址" />
      <ProFormSelect
        name="group_id"
        label="分组"
        options={[
          { value: 0, label: '未分组' },
          ...(groups
            ? groups.map((group) => ({
                value: group.id,
                label: group.name,
              }))
            : []),
        ]}
      />
      <ProFormSelect
        name="key_id"
        label="密钥"
        options={[
          ...(keys
            ? keys.map((key) => ({
                value: key.id,
                label: key.name,
              }))
            : []),
        ]}
      />
    </ProForm>
  );
};

export default Editor;
