import React, { useState } from 'react';
import { Table, Button, Space, Modal, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import { Product } from '@/types/product';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  loading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  onChange: (page: number, pageSize: number) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
  loading,
  pagination,
  onChange,
}) => {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (selectedProduct) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/products/${selectedProduct._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success('Product deleted successfully');
        onDelete(selectedProduct._id);
      } catch (error) {
        message.error('Failed to delete product');
      }
    }
    setDeleteModalVisible(false);
  };

  const columns: ColumnsType<Product> = [
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (url: string) => (
        <img src={url} alt="product" className="w-16 h-16 object-cover rounded" />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Product, b: Product) => a.name.localeCompare(b.name),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
      sorter: (a: Product, b: Product) => a.price - b.price,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: Array.from(new Set(products.map((p) => p.category))).map((cat) => ({
        text: cat,
        value: cat,
      })),
      onFilter: (value, record: Product) =>
        record.category === String(value),
    },
    {
      title: 'Available',
      dataIndex: 'isAvailable',
      key: 'isAvailable',
      render: (isAvailable: boolean) => (isAvailable ? 'Yes' : 'No'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Product) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        columns ={columns}
        dataSource={products}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => onChange(page, pageSize),
        }}
        className="shadow-lg bg-white rounded-lg"
      />

      <Modal
        title="Delete Product"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete {selectedProduct?.name}?</p>
      </Modal>
    </>
  );
};

export default ProductTable;
