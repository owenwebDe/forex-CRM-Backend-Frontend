from fastapi import APIRouter, HTTPException, Depends, status
from database import get_database
from models.user import UserInDB
from models.document import DocumentUpload, DocumentResponse, DocumentInDB, BankDetailsCreate, BankDetailsResponse
from utils.auth import get_current_active_user, get_admin_user
from utils.helpers import save_base64_file
from datetime import datetime
from typing import List

router = APIRouter()

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    document: DocumentUpload,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Upload a document"""
    try:
        db = get_database()
        
        # Create document record
        document_record = DocumentInDB(
            user_id=current_user.id,
            document_type=document.document_type,
            file_name=document.file_name,
            mime_type=document.mime_type,
            file_data=document.file_data,
            status="pending"
        )
        
        # Save document to database
        await db.documents.insert_one(document_record.dict())
        
        # Update user's documents list
        await db.users.update_one(
            {"id": current_user.id},
            {"$push": {"documents": {
                "id": document_record.id,
                "type": document.document_type,
                "status": "pending",
                "uploaded_at": document_record.uploaded_at
            }}}
        )
        
        return DocumentResponse(
            id=document_record.id,
            user_id=document_record.user_id,
            document_type=document_record.document_type,
            file_name=document_record.file_name,
            mime_type=document_record.mime_type,
            status=document_record.status,
            uploaded_at=document_record.uploaded_at
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading document: {str(e)}"
        )

@router.get("/list", response_model=List[DocumentResponse])
async def list_documents(current_user: UserInDB = Depends(get_current_active_user)):
    """List user's documents"""
    try:
        db = get_database()
        documents = await db.documents.find({"user_id": current_user.id}).to_list(100)
        
        return [
            DocumentResponse(
                id=doc["id"],
                user_id=doc["user_id"],
                document_type=doc["document_type"],
                file_name=doc["file_name"],
                mime_type=doc["mime_type"],
                status=doc["status"],
                uploaded_at=doc["uploaded_at"],
                reviewed_at=doc.get("reviewed_at"),
                reviewer_notes=doc.get("reviewer_notes")
            )
            for doc in documents
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing documents: {str(e)}"
        )

@router.get("/{document_id}")
async def get_document(
    document_id: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Get a specific document"""
    try:
        db = get_database()
        document = await db.documents.find_one({"id": document_id, "user_id": current_user.id})
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        return {
            "id": document["id"],
            "document_type": document["document_type"],
            "file_name": document["file_name"],
            "mime_type": document["mime_type"],
            "file_data": document["file_data"],
            "status": document["status"],
            "uploaded_at": document["uploaded_at"]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving document: {str(e)}"
        )

@router.put("/{document_id}/review")
async def review_document(
    document_id: str,
    review_data: dict,
    admin_user: UserInDB = Depends(get_admin_user)
):
    """Review a document (admin only)"""
    try:
        db = get_database()
        
        # Update document status
        await db.documents.update_one(
            {"id": document_id},
            {"$set": {
                "status": review_data.get("status", "pending"),
                "reviewed_at": datetime.utcnow(),
                "reviewer_notes": review_data.get("notes", "")
            }}
        )
        
        # Update user's KYC status if all documents are approved
        document = await db.documents.find_one({"id": document_id})
        if document and review_data.get("status") == "approved":
            user_documents = await db.documents.find({"user_id": document["user_id"]}).to_list(100)
            if all(doc["status"] == "approved" for doc in user_documents):
                await db.users.update_one(
                    {"id": document["user_id"]},
                    {"$set": {"kyc_status": "approved"}}
                )
        
        return {"message": "Document reviewed successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reviewing document: {str(e)}"
        )

@router.post("/bank-details", response_model=BankDetailsResponse)
async def add_bank_details(
    bank_details: BankDetailsCreate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Add bank details"""
    try:
        db = get_database()
        
        # Create bank details record
        bank_record = {
            "id": f"bank_{current_user.id}",
            "user_id": current_user.id,
            "bank_name": bank_details.bank_name,
            "account_name": bank_details.account_name,
            "account_number": bank_details.account_number,
            "routing_number": bank_details.routing_number,
            "swift_code": bank_details.swift_code,
            "iban": bank_details.iban,
            "bank_address": bank_details.bank_address,
            "account_type": bank_details.account_type,
            "verified": False,
            "created_at": datetime.utcnow()
        }
        
        # Save or update bank details
        await db.bank_details.replace_one(
            {"user_id": current_user.id},
            bank_record,
            upsert=True
        )
        
        return BankDetailsResponse(**bank_record)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding bank details: {str(e)}"
        )

@router.get("/bank-details", response_model=BankDetailsResponse)
async def get_bank_details(current_user: UserInDB = Depends(get_current_active_user)):
    """Get user's bank details"""
    try:
        db = get_database()
        bank_details = await db.bank_details.find_one({"user_id": current_user.id})
        
        if not bank_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank details not found"
            )
        
        return BankDetailsResponse(**bank_details)
        
    except Exception as e:
        if "Bank details not found" in str(e):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving bank details: {str(e)}"
        )

@router.put("/bank-details")
async def update_bank_details(
    bank_details: BankDetailsCreate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Update bank details"""
    try:
        db = get_database()
        
        # Update bank details
        update_data = {
            "bank_name": bank_details.bank_name,
            "account_name": bank_details.account_name,
            "account_number": bank_details.account_number,
            "routing_number": bank_details.routing_number,
            "swift_code": bank_details.swift_code,
            "iban": bank_details.iban,
            "bank_address": bank_details.bank_address,
            "account_type": bank_details.account_type,
            "verified": False  # Reset verification status
        }
        
        await db.bank_details.update_one(
            {"user_id": current_user.id},
            {"$set": update_data}
        )
        
        return {"message": "Bank details updated successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating bank details: {str(e)}"
        )

@router.delete("/bank-details")
async def delete_bank_details(current_user: UserInDB = Depends(get_current_active_user)):
    """Delete bank details"""
    try:
        db = get_database()
        
        result = await db.bank_details.delete_one({"user_id": current_user.id})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank details not found"
            )
        
        return {"message": "Bank details deleted successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting bank details: {str(e)}"
        )