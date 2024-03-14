import { getGroups } from '@/services/ant-design-pro/group';
import { getKeys } from '@/services/ant-design-pro/key';
import { createProject } from '@/services/ant-design-pro/project';
import { useRequest } from '@@/plugin-request';
import { ProForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { useNavigate } from 'umi';

export default () => {
  const navigate = useNavigate();
  const { data } = useRequest(getKeys);
  const { data: groups } = useRequest(getGroups);

  console.log('keys', data, groups);

  return (
    <div className="flex justify-center">
      <ProForm
        onFinish={async (values: any) => {
          await createProject(values).then(({ data }) => {
            navigate('/project/detail?id=' + data.id);
          });
        }}
        initialValues={{}}
      >
        <ProForm.Group>
          <ProFormText
            required
            width="md"
            name="name"
            label="项目名称"
            tooltip="最长为 24 位"
            placeholder="请输入名称"
          />
          <ProFormText
            required
            width="md"
            name="repo_address"
            label="仓库地址"
            placeholder="请输入仓库地址"
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormText
            required
            width="md"
            name="default_branch"
            label="默认分支"
            initialValue="master"
            placeholder="请输入默认分支"
          />
          <ProFormSelect
            required
            width="md"
            name="key_id"
            label="密钥"
            initialValue={0}
            options={[
              {
                value: 0,
                label: '新建密钥',
              },
              ...(data || []).map((item) => ({ value: item.id, label: item.name })),
            ]}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormText
            required
            width="md"
            name="project_path"
            label="项目目录"
            initialValue="/var/www/app"
            placeholder="请输入项目目录"
          />
          <ProFormSelect
            required
            width="md"
            name="group_id"
            label="分组"
            initialValue={0}
            options={[
              {
                value: 0,
                label: '未分组',
              },
              ...(groups || []).map((item) => ({ value: item.id, label: item.name })),
            ]}
          />
        </ProForm.Group>
      </ProForm>
    </div>
  );
};
