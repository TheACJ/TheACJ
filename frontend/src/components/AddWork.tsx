import { useState, useEffect } from 'react';
import axios from 'axios';
import { workService } from '../services/api';

interface WorkItemFormProps {
  workItemId?: string; // For editing a WorkItem
  onSuccess?: () => void; // Callback for successful submission
}

interface WorkItem {
  title: string;
  description: string;
  category: string;
  link?: string;
}

const WorkItemForm = ({ workItemId, onSuccess }: WorkItemFormProps) => {
  const [formData, setFormData] = useState<WorkItem>({
    title: '',
    description: '',
    category: '',
    link: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const categories = ['Web App', 'Data Science / Analytics', 'Web3 Dev'];

  useEffect(() => {
    const fetchWorkItem = async () => {
      if (!workItemId) return;

      try {
        setLoading(true);
        const response = await axios.get(`/api/works/${workItemId}/`);
        const data = response.data;
        setFormData({
          title: data.title,
          description: data.description,
          category: data.category,
          link: data.link || '',
        });
        setImagePreview(data.image || null);
      } catch (err) {
        setError('Failed to fetch work item data.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkItem();
  }, [workItemId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const dataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          dataToSend.append(key, value);
        }
      });

      if (imageFile) {
        dataToSend.append('image', imageFile);
      }

      if (workItemId) {
        // Update existing WorkItem using the service
        await workService.updateWorkItem(workItemId, dataToSend);
      } else {
        // Create new WorkItem
        await workService.createWorkItem(dataToSend);
      }

      setSuccess(true);
      if (onSuccess) onSuccess();
      if (!workItemId) {
        // Reset the form after creation
        setFormData({ title: '', description: '', category: '', link: '' });
        setImageFile(null);
        setImagePreview(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save work item.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="lg:ml-[300px]  dark:bg-gray-900 dark:text-[#b9b8b8]  mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold">{workItemId ? 'Edit Work Item' : 'Create New Work Item'}</h2>

        {error && <div className="bg-red-100 text-red-500 p-4 rounded">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-4 rounded">Work item saved successfully!</div>}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {imagePreview && (
            <div className="mt-4">
              <img src={imagePreview} alt="Preview" className="h-32 rounded-lg object-cover" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="mt-2 text-red-500 underline"
              >
                Remove Image
              </button>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="link" className="block text-sm font-medium text-gray-700">Project Link</label>
          <input
            type="url"
            id="link"
            name="link"
            value={formData.link || ''}
            onChange={handleInputChange}
            placeholder="https://example.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white px-4 py-2 rounded-lg ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-blue-600'
          }`}
        >
          {loading ? 'Saving...' : workItemId ? 'Update Work Item' : 'Create Work Item'}
        </button>
      </form>
    </div>
  );
};

export default WorkItemForm;
