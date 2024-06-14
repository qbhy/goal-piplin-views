import { getCommands } from '@/services/ant-design-pro/commands';
import { Deployment, createDeployment } from '@/services/ant-design-pro/deployment';
import { getEnvironments } from '@/services/ant-design-pro/environment';
import { Project } from '@/services/ant-design-pro/project';
import { useRequest } from '@@/plugin-request';
import {
    ProForm,
    ProFormInstance,
    ProFormSelect,
    ProFormSwitch,
    ProFormText,
} from '@ant-design/pro-components';
import { ProFormItem } from '@ant-design/pro-form';
import { AutoComplete, Button, Modal } from 'antd';
import copy from 'copy-to-clipboard';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

type DeployProps = {
    project: Project;
    open?: boolean;
    onDeploy: (deployment: Deployment) => void;
    onClose?: () => void;
};

export type DeployAction = {
    switch: (open?: boolean) => void;
};

export default forwardRef<DeployAction | undefined, DeployProps>(
    ({ project, open, onClose, onDeploy }, ref) => {
        const [showForm, setShowForm] = useState(open);
        const formRef = useRef<ProFormInstance>();
        const { data: environments } = useRequest(() =>
            getEnvironments({ project_id: project?.id }),
        );
        const { data: commands } = useRequest(() => getCommands({ project_id: project?.id }));
        const [loading, setLoading] = useState(false);

        useImperativeHandle(
            ref,
            () => ({
                switch: (open) => {
                    setShowForm(!!open);
                },
            }),
            [formRef],
        );
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
            <Modal
                open={showForm}
                onCancel={() => {
                    setShowForm(false);
                    if (onClose) onClose();
                }}
                okButtonProps={{ hidden: true }}
            >
                <ProForm
                    formRef={formRef}
                    title="开始部署"
                    loading={loading}
                    onFinish={async (values: Record<string, any>) => {
                        setLoading(true);
                        createDeployment({ ...values, project_id: Number(project.id) }).then(
                            (data) => {
                                setLoading(false);
                                setShowForm(false);
                                onDeploy(data);
                            },
                        );
                    }}
                >
                    <ProFormText
                        required
                        name="comment"
                        label="部署备注"
                        tooltip="最长为 24 位"
                        placeholder="如：修复 xxx bug"
                    />

                    <ProFormText name="version" hidden initialValue={project.default_branch} />

                    <ProFormItem name="version" label="版本/分支">
                        <AutoComplete
                            className="w-full"
                            placeholder="如：master"
                            options={branches}
                        />
                    </ProFormItem>

                    {environments && (
                        <ProFormSelect
                            required
                            mode="multiple"
                            name="environments"
                            label="环境"
                            options={environments?.map((data) => ({
                                value: data.id,
                                label: data.name,
                            }))}
                            initialValue={environments
                                ?.filter((env) => env.settings.default_selected)
                                .map((env) => env.id)}
                        />
                    )}
                    {commands
                        ?.filter((command) => command.optional)
                        .map((command) => (
                            <ProFormSwitch
                                label={command.name}
                                key={command.id}
                                name={['params', '' + command.id]}
                                initialValue={command.default_selected}
                            />
                        ))}

                    <Button
                        className="mb-5"
                        onClick={() =>
                            copy(`curl -X POST ${location.origin}/api/deployment/go \\
  -H "Content-Type: application/json" \\
  -d '{
    "uuid": "${project.uuid}",
    "version": "${formRef.current?.getFieldValue('version')}",
    "comment": "${formRef.current?.getFieldValue('comment')}",
    "params": ${JSON.stringify(formRef.current?.getFieldValue('params') || null)},
    "environments": ${JSON.stringify(formRef.current?.getFieldValue('environments'))}
  }'
`)
                        }
                    >
                        复制 CURL 命令
                    </Button>
                </ProForm>
            </Modal>
        );
    },
);
