// NewsComponent.js
export const NewsComponent = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/news/latest`);
      setNews(response.data);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getNewsIcon = (category) => {
    switch (category) {
      case "market":
        return "📈";
      case "company":
        return "🏢";
      case "update":
        return "🔄";
      case "announcement":
        return "📢";
      default:
        return "📰";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Latest News</h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-white text-lg">Loading news...</div>
          </div>
        ) : news.length > 0 ? (
          <div className="space-y-4">
            {news.map((article) => (
              <div
                key={article.id}
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => setSelectedNews(article)}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">
                    {getNewsIcon(article.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-white font-semibold text-lg mb-1">
                          {article.title}
                        </h4>
                        <p className="text-gray-400 text-sm mb-2">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{formatDate(article.published_at)}</span>
                          <span className="capitalize">{article.category}</span>
                        </div>
                      </div>
                      {article.image && (
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-16 h-16 object-cover rounded-lg ml-4"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400">No news available</div>
          </div>
        )}
      </div>

      {/* News Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-900 rounded-lg p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-800">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedNews.title}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>{formatDate(selectedNews.published_at)}</span>
                  <span className="capitalize">{selectedNews.category}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNews(null)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            {selectedNews.image && (
              <img
                src={selectedNews.image}
                alt={selectedNews.title}
                className="w-full h-48 object-cover rounded-lg mb-6"
              />
            )}

            <div className="text-gray-300 leading-relaxed">
              {selectedNews.content.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// MyTickets.js
export const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/support/tickets`);
      setTickets(response.data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-blue-800 text-blue-200";
      case "in_progress":
        return "bg-yellow-800 text-yellow-200";
      case "resolved":
        return "bg-green-800 text-green-200";
      case "closed":
        return "bg-gray-800 text-gray-200";
      default:
        return "bg-gray-800 text-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">
            My Support Tickets
          </h3>
          <button
            onClick={() => (window.location.hash = "#new-ticket")}
            className="px-4 py-2 bg-gradient-to-r from-orange-400 to-yellow-500 text-black font-semibold rounded-md hover:from-orange-500 hover:to-yellow-600 transition-all duration-300"
          >
            Create New Ticket
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-white text-lg">Loading tickets...</div>
          </div>
        ) : tickets.length > 0 ? (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <span className="text-gray-400 text-sm">
                        #{ticket.id}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {ticket.status.replace("_", " ")}
                      </span>
                      <span
                        className={`text-sm ${getPriorityColor(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority} priority
                      </span>
                    </div>
                    <h4 className="text-white font-semibold text-lg mb-1">
                      {ticket.subject}
                    </h4>
                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                      {ticket.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>
                        Created:{" "}
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                      <span>
                        Updated:{" "}
                        {new Date(ticket.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 text-sm">Category</div>
                    <div className="text-white font-medium">
                      {ticket.category}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400">No support tickets found</div>
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-900 rounded-lg p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-800">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  #{selectedTicket.id} - {selectedTicket.subject}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                      selectedTicket.status
                    )}`}
                  >
                    {selectedTicket.status.replace("_", " ")}
                  </span>
                  <span
                    className={`${getPriorityColor(selectedTicket.priority)}`}
                  >
                    {selectedTicket.priority} priority
                  </span>
                  <span>{selectedTicket.category}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            <div className="text-gray-300 leading-relaxed mb-6">
              <h3 className="text-white font-semibold mb-2">Description:</h3>
              <p>{selectedTicket.description}</p>
            </div>

            {selectedTicket.responses &&
              selectedTicket.responses.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-white font-semibold">Responses:</h3>
                  {selectedTicket.responses.map((response, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-white">
                          {response.is_staff ? "Support Team" : "You"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(response.created_at).toLocaleString()}
                        </div>
                      </div>
                      <p className="text-gray-300">{response.message}</p>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};
