// NewTicket.js
export const NewTicket = () => {
  const [ticketData, setTicketData] = useState({
    subject: "",
    category: "general",
    priority: "medium",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: "general", label: "General Inquiry" },
    { value: "technical", label: "Technical Support" },
    { value: "account", label: "Account Issues" },
    { value: "trading", label: "Trading Problems" },
    { value: "deposits", label: "Deposits & Withdrawals" },
    { value: "kyc", label: "KYC Verification" },
    { value: "other", label: "Other" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(`${API_BASE_URL}/api/support/tickets`, ticketData);
      alert("Support ticket created successfully!");
      setTicketData({
        subject: "",
        category: "general",
        priority: "medium",
        description: "",
      });
    } catch (error) {
      console.error("Failed to create ticket:", error);
      alert("Failed to create ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Create New Support Ticket
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white text-sm mb-2">Subject</label>
            <input
              type="text"
              value={ticketData.subject}
              onChange={(e) =>
                setTicketData((prev) => ({ ...prev, subject: e.target.value }))
              }
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
              placeholder="Brief description of your issue"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm mb-2">Category</label>
              <select
                value={ticketData.category}
                onChange={(e) =>
                  setTicketData((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white text-sm mb-2">Priority</label>
              <select
                value={ticketData.priority}
                onChange={(e) =>
                  setTicketData((prev) => ({
                    ...prev,
                    priority: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white text-sm mb-2">Description</label>
            <textarea
              value={ticketData.description}
              onChange={(e) =>
                setTicketData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
              rows="6"
              placeholder="Provide detailed information about your issue..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-orange-400 to-yellow-500 text-black font-semibold rounded-md hover:from-orange-500 hover:to-yellow-600 transition-all duration-300 disabled:opacity-50"
          >
            {isSubmitting ? "Creating Ticket..." : "Create Support Ticket"}
          </button>
        </form>
      </div>
    </div>
  );
};
