import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Product } from '@/types/product';

interface ProductFormProps {
  product?: Product;
  onSubmit: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (key !== 'image') {
          formData.append(key, values[key]);
        }
      });
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      if (product?._id) {
        await axios.patch(`http://localhost:3000/products/${product._id}`, formData, config);
        message.success('Product updated successfully');
      } else {
        await axios.post('http://localhost:3000/products', formData, config);
        message.success('Product created successfully');
      }
      
      onSubmit();
      form.resetFields();
    } catch (error) {
      message.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={product}
      className="max-w-2xl mx-auto"
    >
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: 'Please input the product name!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Description"
        name="description"
        rules={[{ required: true, message: 'Please input the product description!' }]}
      >
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item
        label="Price"
        name="price"
        rules={[
          { required: true, message: 'Please input the price!' },
          {
            validator: async (_, value) => {
              if (value < 0) {
                throw new Error('Price must be greater than or equal to 0');
              }
            },
          },
        ]}
      >
        <InputNumber<number>
          min={0}
          precision={2}
          style={{ width: '100%' }}
          formatter={(value) => {
            if (value === null) return '$ ';
            return `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          }}
          parser={(displayValue) => {
            const parsed = (displayValue || '').replace(/\$\s?|(,*)/g, '');
            const num = parsed === '' ? 0 : Number(parsed);
            return isNaN(num) ? 0 : num;
          }}
          placeholder="Enter price"
        />
      </Form.Item>

      <Form.Item
        label="Category"
        name="category"
        rules={[{ required: true, message: 'Please select the category!' }]}
      >
        <Select>
          <Select.Option value="clothing">Clothing</Select.Option>
          <Select.Option value="accessories">Accessories</Select.Option>
          <Select.Option value="shoes">Shoes</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Sizes"
        name="size"
      >
        <Select mode="multiple" placeholder="Select sizes">
          <Select.Option value="XS">XS</Select.Option>
          <Select.Option value="S">S</Select.Option>
          <Select.Option value="M">M</Select.Option>
          <Select.Option value="L">L</Select.Option>
          <Select.Option value="XL">XL</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Colors"
        name="color"
      >
        <Select mode="multiple" placeholder="Select colors">
          <Select.Option value="Black">Black</Select.Option>
          <Select.Option value="White">White</Select.Option>
          <Select.Option value="Red">Red</Select.Option>
          <Select.Option value="Blue">Blue</Select.Option>
          <Select.Option value="Green">Green</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Image"
        name="image"
      >
        <Upload
          beforeUpload={(file) => {
            setImageFile(file);
            return false;
          }}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Select Image</Button>
        </Upload>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} className="w-full">
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProductForm;
