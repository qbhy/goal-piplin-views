import { getGroups } from '@/services/ant-design-pro/group';
import { getKeys } from '@/services/ant-design-pro/key';
import { ProjectDetail, updateProject } from '@/services/ant-design-pro/project';
import { useRequest } from '@@/plugin-request';
import { ProForm, ProFormInstance, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import React, { useRef } from 'react';

const Editor: React.FC<{ project?: ProjectDetail; onUpdated: () => void }> = ({
    project,
    onUpdated,
}) => {
    const update = async (values: any) => {
        await updateProject(values).then(({ msg }) => {
            if (msg) {
                return message.error(msg);
            }
            message.success({ content: '修改成功' });
        });
        onUpdated();
    };
    const { data: keys } = useRequest(getKeys);
    const { data: groups } = useRequest(getGroups);
    const formRef = useRef<ProFormInstance>();

    const branches: { value: string; label: string }[] = [];

    for (const branch of project?.settings.branches || []) {
        branches.push({
            value: branch,
            label: `分支: ${branch}`,
        });
    }

    for (const branch of project?.settings.tags || []) {
        branches.push({
            value: branch,
            label: `标签: ${branch}`,
        });
    }

    return (
        <ProForm formRef={formRef} onFinish={update} initialValues={project}>
            <ProFormText name="id" label="ID" disabled hidden />
            <ProFormText name="name" label="名称" />
            <ProFormSelect name="default_branch" label="默认分支" options={branches} />
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
