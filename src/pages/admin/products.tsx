import React, { useState, useEffect } from 'react';
import { Layout, Button, Input, Space, Modal, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import ProductTable from '@/components/products/ProductTable';
import ProductForm from '@/components/products/ProductForm';
import { Product, ProductsResponse } from '@/types/product';
import Head from 'next/head';
import { useRouter } from 'next/router';

const { Header, Content } = Layout;

const ProductsPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchProducts = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await axios.get<ProductsResponse>(
        `http://localhost:3003/products?page=${page}&limit=${pagination.pageSize}&search=${search}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProducts(response.data.data);
      setPagination({
        ...pagination,
        current: response.data.page,
        total: response.data.total,
      });
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'status' in error.response &&
        error.response.status === 401
      ) {
        router.push('/admin/login');
      } else {
        message.error('Failed to fetch products');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchProducts(1, searchTerm);
  };

  const handleTableChange = (page: number, pageSize: number) => {
    const newPagination = { ...pagination, current: page, pageSize };
    setPagination(newPagination);
    fetchProducts(page > 0 ? page : 1, searchTerm);
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    await fetchProducts(pagination.current, searchTerm);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditProduct(undefined);
  };

  const handleFormSubmit = () => {
    handleModalClose();
    fetchProducts(pagination.current, searchTerm);
  };

  return (
    <>
      <Head>
        <title>Manage Products - Fashion Flow</title>
      </Head>
      <Layout className="min-h-screen">
        <Header className="bg-white shadow-md flex items-center justify-between px-6">
          <h1 className="text-2xl font-bold">Product Management</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Add Product
          </Button>
        </Header>
        <Content className="p-6">
          <div className="mb-4">
            <Space>
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onPressEnter={handleSearch}
                prefix={<SearchOutlined />}
                className="w-64"
              />
              <Button type="primary" onClick={handleSearch}>
                Search
              </Button>
            </Space>
          </div>

          <ProductTable
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
          />

          <Modal
            title={editProduct ? 'Edit Product' : 'Add New Product'}
            open={modalVisible}
            onCancel={handleModalClose}
            footer={null}
            width={800}
          >
            <ProductForm product={editProduct} onSubmit={handleFormSubmit} />
          </Modal>
        </Content>
      </Layout>
    </>
  );
};

export default ProductsPage;
