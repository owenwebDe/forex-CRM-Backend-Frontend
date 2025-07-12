from fastapi import APIRouter, HTTPException, Depends, status
from database import get_database
from models.user import UserInDB
from models.ticket import TicketCreate, TicketResponse, TicketInDB, TicketMessage
from utils.auth import get_current_active_user, get_admin_user
from datetime import datetime
from typing import List

router = APIRouter()

@router.post("/create", response_model=TicketResponse)
async def create_ticket(
    ticket_data: TicketCreate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Create a new support ticket"""
    try:
        db = get_database()
        
        # Create ticket
        ticket = TicketInDB(
            user_id=current_user.id,
            subject=ticket_data.subject,
            description=ticket_data.description,
            category=ticket_data.category,
            priority=ticket_data.priority,
            attachments=ticket_data.attachments or []
        )
        
        # Save ticket
        await db.tickets.insert_one(ticket.dict())
        
        return TicketResponse(
            id=ticket.id,
            user_id=ticket.user_id,
            subject=ticket.subject,
            description=ticket.description,
            category=ticket.category,
            priority=ticket.priority,
            status=ticket.status,
            created_at=ticket.created_at,
            updated_at=ticket.updated_at,
            messages=ticket.messages
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating ticket: {str(e)}"
        )

@router.get("/list", response_model=List[TicketResponse])
async def list_tickets(current_user: UserInDB = Depends(get_current_active_user)):
    """List user's tickets"""
    try:
        db = get_database()
        tickets = await db.tickets.find({"user_id": current_user.id}).sort("created_at", -1).to_list(100)
        
        return [
            TicketResponse(
                id=ticket["id"],
                user_id=ticket["user_id"],
                subject=ticket["subject"],
                description=ticket["description"],
                category=ticket["category"],
                priority=ticket["priority"],
                status=ticket["status"],
                created_at=ticket["created_at"],
                updated_at=ticket["updated_at"],
                closed_at=ticket.get("closed_at"),
                assigned_to=ticket.get("assigned_to"),
                messages=ticket.get("messages", [])
            )
            for ticket in tickets
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing tickets: {str(e)}"
        )

@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(
    ticket_id: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Get a specific ticket"""
    try:
        db = get_database()
        ticket = await db.tickets.find_one({"id": ticket_id, "user_id": current_user.id})
        
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ticket not found"
            )
        
        return TicketResponse(
            id=ticket["id"],
            user_id=ticket["user_id"],
            subject=ticket["subject"],
            description=ticket["description"],
            category=ticket["category"],
            priority=ticket["priority"],
            status=ticket["status"],
            created_at=ticket["created_at"],
            updated_at=ticket["updated_at"],
            closed_at=ticket.get("closed_at"),
            assigned_to=ticket.get("assigned_to"),
            messages=ticket.get("messages", [])
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving ticket: {str(e)}"
        )

@router.post("/{ticket_id}/message")
async def add_message_to_ticket(
    ticket_id: str,
    message_data: TicketMessage,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Add a message to a ticket"""
    try:
        db = get_database()
        
        # Check if ticket exists and belongs to user
        ticket = await db.tickets.find_one({"id": ticket_id, "user_id": current_user.id})
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ticket not found"
            )
        
        # Create message
        message = {
            "id": f"msg_{datetime.utcnow().isoformat()}",
            "user_id": current_user.id,
            "user_name": current_user.name,
            "user_role": current_user.role,
            "message": message_data.message,
            "attachments": message_data.attachments or [],
            "created_at": datetime.utcnow()
        }
        
        # Add message to ticket
        await db.tickets.update_one(
            {"id": ticket_id},
            {
                "$push": {"messages": message},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        return {"message": "Message added successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding message: {str(e)}"
        )

@router.put("/{ticket_id}/close")
async def close_ticket(
    ticket_id: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Close a ticket"""
    try:
        db = get_database()
        
        # Check if ticket exists and belongs to user
        ticket = await db.tickets.find_one({"id": ticket_id, "user_id": current_user.id})
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ticket not found"
            )
        
        # Close ticket
        await db.tickets.update_one(
            {"id": ticket_id},
            {
                "$set": {
                    "status": "closed",
                    "closed_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return {"message": "Ticket closed successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error closing ticket: {str(e)}"
        )

@router.get("/admin/all", response_model=List[TicketResponse])
async def list_all_tickets(admin_user: UserInDB = Depends(get_admin_user)):
    """List all tickets (admin only)"""
    try:
        db = get_database()
        tickets = await db.tickets.find({}).sort("created_at", -1).to_list(1000)
        
        return [
            TicketResponse(
                id=ticket["id"],
                user_id=ticket["user_id"],
                subject=ticket["subject"],
                description=ticket["description"],
                category=ticket["category"],
                priority=ticket["priority"],
                status=ticket["status"],
                created_at=ticket["created_at"],
                updated_at=ticket["updated_at"],
                closed_at=ticket.get("closed_at"),
                assigned_to=ticket.get("assigned_to"),
                messages=ticket.get("messages", [])
            )
            for ticket in tickets
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing tickets: {str(e)}"
        )

@router.put("/admin/{ticket_id}/assign")
async def assign_ticket(
    ticket_id: str,
    assign_data: dict,
    admin_user: UserInDB = Depends(get_admin_user)
):
    """Assign ticket to admin (admin only)"""
    try:
        db = get_database()
        
        # Update ticket
        await db.tickets.update_one(
            {"id": ticket_id},
            {
                "$set": {
                    "assigned_to": assign_data.get("assigned_to"),
                    "status": assign_data.get("status", "in_progress"),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return {"message": "Ticket assigned successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error assigning ticket: {str(e)}"
        )

@router.post("/admin/{ticket_id}/reply")
async def admin_reply_to_ticket(
    ticket_id: str,
    message_data: TicketMessage,
    admin_user: UserInDB = Depends(get_admin_user)
):
    """Admin reply to ticket"""
    try:
        db = get_database()
        
        # Check if ticket exists
        ticket = await db.tickets.find_one({"id": ticket_id})
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ticket not found"
            )
        
        # Create admin message
        message = {
            "id": f"msg_{datetime.utcnow().isoformat()}",
            "user_id": admin_user.id,
            "user_name": admin_user.name,
            "user_role": "admin",
            "message": message_data.message,
            "attachments": message_data.attachments or [],
            "created_at": datetime.utcnow()
        }
        
        # Add message to ticket
        await db.tickets.update_one(
            {"id": ticket_id},
            {
                "$push": {"messages": message},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        return {"message": "Reply sent successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error sending reply: {str(e)}"
        )