import Commands from '@/pages/Project/Detail/command';
import ConfigFiles from '@/pages/Project/Detail/config_files';
import Deployments from '@/pages/Project/Detail/deployments';
import Editor from '@/pages/Project/Detail/editor';
import Environments from '@/pages/Project/Detail/environments';
import Members from '@/pages/Project/Detail/members';
import ShareFiles from '@/pages/Project/Detail/share_files';
import { getProjectDetail } from '@/services/ant-design-pro/project';
import { useRequest } from 'ahooks';
import { Spin, Tabs } from 'antd';
import { useSearchParams } from 'react-router-dom';

export default () => {
    const [params, setParams] = useSearchParams();
    const {
        data: project,
        loading,
        refresh,
    } = useRequest(async () => getProjectDetail(params.get('id')));
    return (
        <Spin spinning={loading}>
            <Tabs
                onChange={(e) => {
                    setParams({ id: params.get('id') || '', tab: e });
                }}
                defaultActiveKey={params.get('tab') || 'logs'}
                tabPosition="left"
                destroyInactiveTabPane={true}
                items={[
                    {
                        key: 'logs',
                        label: '部署记录',
                        children: project && <Deployments project={project} />,
                    },
                    {
                        key: 'environments',
                        label: '部署环境',
                        children: project && <Environments projectId={project.id} />,
                    },
                    {
                        key: 'steps',
                        label: '部署步骤',
                        children: project && <Commands projectId={project.id} />,
                    },
                    {
                        key: 'config',
                        label: '配置文件',
                        children: project && <ConfigFiles projectId={project.id} />,
                    },
                    {
                        key: 'share_files',
                        label: '共享目录',
                        children: <ShareFiles projectId={project?.id} />,
                    },
                    {
                        key: 'members',
                        label: '项目成员',
                        children: project && <Members project={project} update={refresh} />,
                    },
                    // {
                    //     key: 'callback',
                    //     label: '部署回调',
                    //     children: <div>部署回调</div>,
                    // },
                    {
                        key: 'editor',
                        label: '更新项目',
                        children: project && <Editor project={project} onUpdated={refresh} />,
                    },
                ]}
            ></Tabs>
        </Spin>
    );
};
