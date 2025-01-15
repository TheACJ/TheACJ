import { useState, useEffect } from 'react';
import { workService } from '../services/api'; // Import your API service


interface WorkItemFormProps {
  workItemId?: string; // For editing an existing WorkItem
  onSuccess?: () => void; // Callback for successful submission
}

const WorkItemForm = ({ workItemId, onSuccess }: WorkItemFormProps) => {
  const [formData, setFormData] = useState({
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

  const categories = ['Graphics Design', 'Web Design', 'Software', 'Web App'];

  useEffect(() => {
    const fetchWorkItem = async () => {
      if (!workItemId) return;

      try {
        setLoading(true);
        const { data } = await workService.getWorkItem(workItemId);
        setFormData({
          title: data.title,
          description: data.description,
          category: data.category || '',
          link: data.link || '',
        });
        setImagePreview(data.image || null);
      } catch (err) {
        setError('Failed to fetch work item details.');
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
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      if (imageFile) data.append('image', imageFile);

      if (workItemId) {
        // Update existing work item
        await workService.updateWorkItem(workItemId, data);
      } else {
        // Create new work item
        await workService.createWorkItem(data);
      }

      setSuccess(true);
      if (onSuccess) onSuccess();
      if (!workItemId) {
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
    <div className="max-w-4xl mx-auto lg:ml-[300px]">
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
          <label htmlFor="link" className="block text-sm font-medium text-gray-700">Link</label>
          <input
            type="url"
            id="link"
            name="link"
            value={formData.link}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="https://example.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white px-4 py-2 rounded-lg ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {loading ? 'Saving...' : workItemId ? 'Update Work Item' : 'Create Work Item'}
        </button>
      </form>
    </div>
  );
};

export default WorkItemForm;
