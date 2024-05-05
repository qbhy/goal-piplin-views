import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
    return (
        <DefaultFooter
            style={{
                background: 'none',
            }}
            links={[
                {
                    key: 'Goal Piplin',
                    title: 'Goal Piplin',
                    href: 'https://pro.ant.design',
                    blankTarget: true,
                },
                {
                    key: 'github',
                    title: <GithubOutlined />,
                    href: 'https://github.com/ant-design/ant-design-pro',
                    blankTarget: true,
                },
                {
                    key: 'Ant Design',
                    title: 'Ant Design',
                    href: 'https://ant.design',
                    blankTarget: true,
                },
            ]}
        />
    );
};

export default Footer;
