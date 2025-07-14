import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


const TicketsList = ({role}) => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const showTickets = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            });

            if (!response.ok) {
            throw new Error("Failed to fetch tickets");
            }

            const data = await response.json();
            let modifiedData = [];

            if(role === 'moderator') {
                const currentUser = JSON.parse(localStorage.getItem('user'));
                modifiedData = data.filter((a) => a.assignedTo.email === currentUser.email);
                setTickets(modifiedData);
            }
            else {
                setTickets(data);
            }
        } catch (err) {
            console.error(err);
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
        };

    showTickets();
  }, []);

    const handleClick = (ticketId) => {
        navigate(`/tickets/${ticketId}`);
    }

  if (loading) return <div className="text-center text-gray-600">Loading tickets...</div>;

  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="p-6 space-y-4">
      {tickets.map((ticket) => (
        <div
            onClick={() => handleClick(ticket._id)} 
          key={ticket._id}
          className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-md border-l-4 border-blue-500 cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {ticket.title}
            </h2>
            <span className="text-sm font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              {ticket.status}
            </span>
          </div>

          <p className="text-gray-700 dark:text-gray-300 mt-2">{ticket.description}</p>

          <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            <p>
              <strong>Assigned to:</strong> {ticket.assignedTo.email}
            </p>
            <p>
              <strong>Created by:</strong> {ticket.createdBy.email}
            </p>
            <p>
              <strong>Created:</strong>{" "}
              {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}

      {tickets.length === 0 && (
        <p className="text-center text-gray-500">No tickets found.</p>
      )}
    </div>
  );
};

export default TicketsList;
