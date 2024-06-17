import { Command } from '@/services/ant-design-pro/commands';
import {
    CommandOutput,
    Deployment,
    getDeploymentDetail,
    runDeployment,
} from '@/services/ant-design-pro/deployment';
import { notify } from '@/services/ant-design-pro/notify';
import { Project, getProjects } from '@/services/ant-design-pro/project';
import { Link } from '@@/exports';
import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { Button, Dropdown, Modal, message } from 'antd';
import { DownOutline } from 'antd-mobile-icons';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'umi';

function renderServers(servers: Record<string, CommandOutput>, onClick: (key: string) => void) {
    const items = [];
    // eslint-disable-next-line guard-for-in
    for (let key in servers) {
        items.push(
            <div key={key}>
                <div className={classNames('flex justify-between p-3 ml-5 border-b items-center')}>
                    <div>{servers[key].host}</div>
                    <div className="flex-1 flex justify-between pl-3 items-center">
                        <div
                            className={classNames({
                                'text-green-500': servers[key].status === 'finished',
                                'text-blue-500': servers[key].status === 'running',
                                'text-red-500': servers[key].status === 'failed',
                            })}
                        >
                            {servers[key].status}
                        </div>
                        <Button onClick={() => onClick(key)}>输出</Button>
                    </div>
                </div>
            </div>,
        );
    }
    return items;
}

export default function () {
    const [params] = useSearchParams();
    const [output, setOutput] = useState<CommandOutput>();
    const [products, setProjects] = useState<Project[]>([]);
    const navigate = useNavigate();
    const [deployment, setDeployment] = useState<Deployment>();

    const { data, loading } = useRequest(async () => {
        const data = await getDeploymentDetail(params.get('id'));
        if (data.project.group_id) {
            const list = await getProjects({ group_id: data.project.group_id });
            setProjects(list.data);
        }

        setDeployment(data.deployment);
        const commands: Record<number, Command> = {};
        for (const command of data.commands) {
            if (command.id) {
                commands[command.id] = command;
            }
        }

        return { ...data, commands };
    });

    useEffect(() => {
        const eventSource = notify();
        eventSource.onmessage = (event) => {
            if (event.data === 'heartbeat') {
                return;
            }
            const newDeployment: Deployment = JSON.parse(event.data);
            if (newDeployment.status === 'finished') {
                message.success({ content: `${data?.project.name} 部署成功!` });
            }
            if (newDeployment.status === 'failed') {
                message.warning({ content: `${data?.project.name} 部署失败!` });
            }
            if (deployment?.id === newDeployment.id) {
                setDeployment(newDeployment);
            }
        };

        eventSource.onerror = (err) => {
            message.error({ content: err.type });
        };

        return () => {
            eventSource.close();
        };
    }, [data]);

    return (
        <PageContainer
            title={
                <div className="flex gap-3 items-center">
                    <Link to={`/project/detail?id=${data?.project?.id}`}>
                        {data?.project?.name}
                    </Link>
                    {products.length > 0 && (
                        <Dropdown
                            menu={{
                                items: products.map((item) => ({
                                    key: item.id,
                                    label: (
                                        <Link to={`/project/detail?id=${item.id}`}>
                                            {`${item.name}` +
                                                (data?.project?.id === item.id
                                                    ? '    (当前项目)'
                                                    : '')}
                                        </Link>
                                    ),
                                    disabled: data?.project?.id === item.id,
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
                <div>
                    <Modal
                        width="80%"
                        open={output !== undefined}
                        onOk={() => setOutput(undefined)}
                        onCancel={() => setOutput(undefined)}
                    >
                        <div
                            className="pt-5 w-full"
                            dangerouslySetInnerHTML={{
                                __html: (output?.outputs || '无输出').replaceAll('\n', '<br>'),
                            }}
                        ></div>
                    </Modal>

                    <div className="grid-cols-3 grid px-5">
                        <div>
                            <div>评论：</div>
                            <div>{deployment?.comment || '无评论'}</div>
                        </div>
                        <div>
                            <div>版本：</div>
                            <div className="mb-3">{deployment?.version}</div>
                            <div>提交：</div>
                            <div className="mb-3">{deployment?.commit}</div>
                        </div>
                        <div className="">
                            <div className="flex">
                                <div>状态：</div>
                                <div
                                    className={classNames({
                                        'text-green-500': deployment?.status === 'finished',
                                        'text-blue-500': deployment?.status === 'running',
                                        'text-red-500': deployment?.status === 'failed',
                                    })}
                                >
                                    {deployment?.status}
                                </div>
                            </div>
                            <div className="p-3">
                                <Button.Group>
                                    {deployment?.status === 'failed' && (
                                        <Button onClick={() => runDeployment(deployment?.id)}>
                                            重新运行
                                        </Button>
                                    )}

                                    <Button
                                        onClick={() =>
                                            navigate(
                                                `/project/detail?id=${data?.project.id}&deploy`,
                                            )
                                        }
                                    >
                                        再次部署
                                    </Button>
                                </Button.Group>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5">
                        {deployment?.results.map((result, index) => (
                            <div className={classNames('rounded border mb-3 px-5', {})} key={index}>
                                <div className="flex justify-between py-3 border-b">
                                    <div>
                                        步骤：
                                        {result.command > 0
                                            ? data?.commands[result.command].name
                                            : {
                                                  init: '初始化',
                                                  before_clone: '克隆前',
                                                  clone: '克隆',
                                                  prepare: '准备',
                                                  release: '发布',
                                              }[result.step] || result.step}
                                    </div>
                                    <div>
                                        耗时：
                                        {result.time_consuming
                                            ? result.time_consuming / 1000 + '秒'
                                            : '未完成'}
                                    </div>
                                </div>

                                <div>
                                    {renderServers(result.servers, (key) =>
                                        setOutput(result.servers[key]),
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            }
        />
    );
}
