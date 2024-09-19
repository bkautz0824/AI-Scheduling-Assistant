"use client";

import { useState } from 'react';
import { Layout, Menu, Button, Tooltip } from 'antd';
import {
  HomeOutlined,
  MessageOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import CalendarDisplay from '@/components/CalendarDisplay';
import ChatDrawer from '@/components/ChatDrawer';

const { Sider, Content } = Layout;

export default function CalendarPage() {
  const [collapsed, setCollapsed] = useState(true); // Sidebar collapsed state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Chat Drawer state

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const toggleDrawer = (open) => {
    setIsDrawerOpen(open);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={200}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        {/* Logo Placeholder */}
        {/* <div className="logo" style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.3)' }} /> */}

        {/* Menu Items */}
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1" icon={<HomeOutlined />}>
            {collapsed ? (
              <Tooltip title="Home" placement="right">
                <Link href="/">
                  <span />
                </Link>
              </Tooltip>
            ) : (
              <Link href="/">
                <span>Home</span>
              </Link>
            )}
          </Menu.Item>
          <Menu.Item key="2" icon={<MessageOutlined />} onClick={() => toggleDrawer(true)}>
            {collapsed ? (
              <Tooltip title="Open Chat" placement="right">
                <span />
              </Tooltip>
            ) : (
              <span>Open Chat</span>
            )}
          </Menu.Item>
        </Menu>

        {/* Toggle Button */}
        <div style={{ textAlign: 'center', padding: '10px' }}>
          <Button type="primary" onClick={toggleCollapsed} style={{ marginTop: '10px' }}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
        </div>
      </Sider>

      {/* Main Content Area */}
      <Layout className="site-layout" style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ padding: 24, background: '#fff', textAlign: 'center' }}>
            <CalendarDisplay />
          </div>
        </Content>
      </Layout>

      {/* Chat Drawer */}
      <ChatDrawer isOpen={isDrawerOpen} toggleDrawer={toggleDrawer} />
    </Layout>
  );
}
