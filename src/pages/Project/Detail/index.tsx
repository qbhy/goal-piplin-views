import Commands from '@/pages/Project/Detail/command';
import ConfigFiles from '@/pages/Project/Detail/config_files';
import Deployments from '@/pages/Project/Detail/deployments';
import Editor from '@/pages/Project/Detail/editor';
import Environments from '@/pages/Project/Detail/environments';
import Members from '@/pages/Project/Detail/members';
import ShareFiles from '@/pages/Project/Detail/share_files';
import { getProjectDetail, getProjects, Project } from '@/services/ant-design-pro/project';
import { PageContainer } from '@ant-design/pro-components';
import { Link } from '@umijs/max';
import { useRequest } from 'ahooks';
import { Dropdown, Tabs } from 'antd';
import { DownOutline } from 'antd-mobile-icons';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default () => {
    const [params, setParams] = useSearchParams();
    const [products, setProjects] = useState<Project[]>([]);
    const {
        data: project,
        loading,
        refresh,
    } = useRequest(async () => {
        const data = await getProjectDetail(params.get('id'));
        if (data.group_id) {
            const list = await getProjects({ group_id: data.group_id });
            setProjects(list.data);
        }

        return data;
    });

    useEffect(() => {
        if (!loading) {
            refresh();
        }
    }, [params.get('id')]);

    return (
        <PageContainer
            title={
                <div className="flex gap-3 items-center">
                    <Link to={`/project/detail?id=${project?.id}`}>{project?.name}</Link>
                    {products.length > 0 && (
                        <Dropdown
                            menu={{
                                items: products.map((item) => ({
                                    key: item.id,
                                    label: (
                                        <Link to={`/project/detail?id=${item.id}`}>
                                            {`${item.name}` +
                                                (project?.id === item.id ? '    (当前项目)' : '')}
                                        </Link>
                                    ),
                                    disabled: project?.id === item.id,
                                })),
                            }}
                        >
                            <DownOutline />
                        </Dropdown>
                    )}
                </div>
            }
            loading={loading}
            contentWidth="Fluid"
            content={
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
                            children: project && !loading && <Deployments project={project} />,
                        },
                        {
                            key: 'environments',
                            label: '部署环境',
                            children: project && !loading && (
                                <Environments projectId={project.id} />
                            ),
                        },
                        {
                            key: 'steps',
                            label: '部署步骤',
                            children: project && !loading && <Commands projectId={project.id} />,
                        },
                        {
                            key: 'config',
                            label: '配置文件',
                            children: project && !loading && <ConfigFiles projectId={project.id} />,
                        },
                        {
                            key: 'share_files',
                            label: '共享目录',
                            children: !loading && <ShareFiles projectId={project?.id} />,
                        },
                        {
                            key: 'members',
                            label: '项目成员',
                            children: project && !loading && (
                                <Members project={project} update={refresh} />
                            ),
                        },
                        // {
                        //     key: 'callback',
                        //     label: '部署回调',
                        //     children: <div>部署回调</div>,
                        // },
                        {
                            key: 'editor',
                            label: '更新项目',
                            children: project && !loading && (
                                <Editor project={project} onUpdated={refresh} />
                            ),
                        },
                    ]}
                />
            }
        />
    );
};
