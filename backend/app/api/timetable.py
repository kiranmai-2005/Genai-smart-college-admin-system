from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import TimetableConfiguration, TimetableDraft, XaiLog, Faculty, Subject, Room
from app.services.timetable_solver import generate_timetable_draft_with_xai
from datetime import datetime

timetable_bp = Blueprint('timetable', __name__)

@timetable_bp.route('/timetable/configs', methods=['GET'])
@jwt_required()
def get_timetable_configs():
    configs = TimetableConfiguration.query.all()
    output = []
    for config in configs:
        output.append({
            "id": config.id,
            "config_name": config.config_name,
            "academic_year": config.academic_year,
            "semester": config.semester,
            "branches": config.branches,
            "sections_per_branch": config.sections_per_branch,
            "slots_per_day": config.slots_per_day,
            "created_at": config.created_at.isoformat()
        })
    return jsonify(output), 200

@timetable_bp.route('/timetable/generate', methods=['POST'])
@jwt_required()
def generate_timetable():
    current_user_id = get_jwt_identity()
    data = request.json
    config_id = data.get('config_id')
    inputs = data.get('inputs') # This will contain detailed inputs from admin

    if not config_id or not inputs:
        return jsonify({"message": "Missing config_id or inputs"}), 400

    config = TimetableConfiguration.query.get(config_id)
    if not config:
        return jsonify({"message": "Timetable configuration not found"}), 404

    try:
        # Fetch necessary data from DB based on config and inputs
        faculties = Faculty.query.all()
        subjects = Subject.query.all()
        rooms = Room.query.all()

        draft_content, xai_logs_data = generate_timetable_draft_with_xai(
            config=config,
            inputs=inputs, # Admin-provided specific allocations/preferences
            all_faculties=faculties,
            all_subjects=subjects,
            all_rooms=rooms
        )

        new_draft = TimetableDraft(
            config_id=config_id,
            generated_by=current_user_id,
            draft_content=draft_content,
            status='draft'
        )
        db.session.add(new_draft)
        db.session.flush() # To get new_draft.id before committing

        # Store XAI logs
        for log_data in xai_logs_data:
            xai_log = XaiLog(
                timetable_draft_id=new_draft.id,
                log_type=log_data['log_type'],
                rule_name=log_data['rule_name'],
                slot_details=log_data['slot_details'],
                explanation=log_data['explanation'],
                priority=log_data.get('priority', 1)
            )
            db.session.add(xai_log)

        db.session.commit()

        # Prepare XAI logs for response (make them serializable)
        response_xai_logs = [{
            "log_type": log.log_type,
            "rule_name": log.rule_name,
            "slot_details": log.slot_details,
            "explanation": log.explanation,
            "priority": log.priority,
            "timestamp": log.timestamp.isoformat()
        } for log in new_draft.xai_logs]


        return jsonify({
            "message": "Timetable draft generated successfully",
            "draft_id": new_draft.id,
            "draft_content": draft_content,
            "xai_logs": response_xai_logs
        }), 201

    except Exception as e:
        current_app.logger.error(f"Timetable generation failed: {e}")
        db.session.rollback()
        return jsonify({"message": f"Failed to generate timetable draft: {str(e)}"}), 500

@timetable_bp.route('/timetable/drafts', methods=['GET'])
@jwt_required()
def get_timetable_drafts():
    current_user_id = get_jwt_identity()
    drafts = TimetableDraft.query.filter_by(generated_by=current_user_id).order_by(TimetableDraft.generation_date.desc()).all()
    output = []
    for draft in drafts:
        output.append({
            "id": draft.id,
            "config_id": draft.config_id,
            "generation_date": draft.generation_date.isoformat(),
            "status": draft.status,
            "config_name": draft.config.config_name # Access config name via relationship
        })
    return jsonify(output), 200

@timetable_bp.route('/timetable/drafts/<int:draft_id>', methods=['GET'])
@jwt_required()
def get_timetable_draft_details(draft_id):
    current_user_id = get_jwt_identity()
    draft = TimetableDraft.query.filter_by(id=draft_id, generated_by=current_user_id).first()

    if not draft:
        return jsonify({"message": "Timetable draft not found or unauthorized"}), 404

    # Also fetch XAI logs associated with this draft
    xai_logs = XaiLog.query.filter_by(timetable_draft_id=draft.id).order_by(XaiLog.timestamp).all()
    xai_logs_data = [{
        "log_type": log.log_type,
        "rule_name": log.rule_name,
        "slot_details": log.slot_details,
        "explanation": log.explanation,
        "priority": log.priority,
        "timestamp": log.timestamp.isoformat()
    } for log in xai_logs]

    return jsonify({
        "id": draft.id,
        "config_id": draft.config_id,
        "generation_date": draft.generation_date.isoformat(),
        "status": draft.status,
        "draft_content": draft.draft_content,
        "last_validated_at": draft.last_validated_at.isoformat() if draft.last_validated_at else None,
        "xai_logs": xai_logs_data
    }), 200

@timetable_bp.route('/timetable/drafts/<int:draft_id>', methods=['PUT'])
@jwt_required()
def update_timetable_draft(draft_id):
    current_user_id = get_jwt_identity()
    draft = TimetableDraft.query.filter_by(id=draft_id, generated_by=current_user_id).first()

    if not draft:
        return jsonify({"message": "Timetable draft not found or unauthorized"}), 404

    data = request.json
    updated_content = data.get('draft_content')
    status = data.get('status') # e.g., 'validated', 'approved'

    if updated_content:
        draft.draft_content = updated_content
        draft.last_validated_at = datetime.now() # Mark as validated/edited

    if status:
        draft.status = status

    # Re-validation logic can be called here if needed to ensure rules are still met
    # For now, simply update the content
    db.session.commit()

    return jsonify({"message": "Timetable draft updated successfully", "draft_id": draft.id}), 200
