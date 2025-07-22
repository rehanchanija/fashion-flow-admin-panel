import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import Head from 'next/head';

const AdminLoginPage = () => {
  return (
    <>
      <Head>
        <title>Admin Login - Fashion Flow</title>
      </Head>
      <LoginForm />
    </>
  );
};

export default AdminLoginPage;
