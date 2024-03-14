import { CommandOutput, getDeploymentDetail } from '@/services/ant-design-pro/deployment';
import { notify } from '@/services/ant-design-pro/notify';
import { useRequest } from 'ahooks';
import { Button, Modal, Spin } from 'antd';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function renderServers(servers: Record<string, CommandOutput>, onClick: (key: string) => void) {
  const items = [];
  // eslint-disable-next-line guard-for-in
  for (let key in servers) {
    items.push(
      <div key={key}>
        <div className={classNames('flex justify-between p-3 ml-5 border-b')}>
          <div>{servers[key].host}</div>
          <div className="flex-1 flex justify-between pl-3">
            <div>{servers[key].status}</div>
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
  const { data, loading } = useRequest(async () => getDeploymentDetail(params.get('id')));

  useEffect(() => {
    const eventSource = notify();
    eventSource.onmessage = (event) => {
      console.log(event.data);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <Spin spinning={loading}>
      <Modal open={output !== undefined} onCancel={() => setOutput(undefined)}>
        {output?.outputs}
      </Modal>

      <div className="p-5 text-2xl">项目：{data?.project.name}</div>

      <div className="flex justify-between gap-10">
        <div className="p-3 ml-5">评论 {data?.deployment.comment}</div>
        <div className="p-3">
          <Button>运行</Button>
        </div>
      </div>

      <div className="mt-5">
        {data?.deployment.results.map((result, index) => (
          <div className="rounded border mb-3 px-5" key={index}>
            <div className="flex justify-between py-3 border-b">
              <div>步骤：{result.step}</div>
              <div>耗时：{result.time_consuming ? result.time_consuming + '秒' : '未完成'}</div>
            </div>

            <div>{renderServers(result.servers, (key) => setOutput(result.servers[key]))}</div>
          </div>
        ))}
      </div>
    </Spin>
  );
}
