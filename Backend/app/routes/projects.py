from flask import Blueprint, request
from app import db
from app.models.project import Project, ProjectExpense
from app.utils.auth import require_auth, require_role, get_current_user, success_response, error_response

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('', methods=['GET'])
@require_auth
@require_role('student')
def list_projects():
    user = get_current_user()
    projects = Project.query.filter_by(user_id=user.id).all()
    return success_response([p.to_dict() for p in projects])

@projects_bp.route('', methods=['POST'])
@require_auth
@require_role('student')
def create_project():
    user = get_current_user()
    data = request.get_json()
    name = data.get('name', '').strip()
    if not name:
        return error_response('Project name required')
    try:
        budget = float(data.get('budget', 0))
    except (TypeError, ValueError):
        return error_response('Invalid budget amount')
    p = Project(user_id=user.id, name=name, budget=budget)
    db.session.add(p)
    db.session.commit()
    return success_response(p.to_dict(), status=201)

@projects_bp.route('/<pid>', methods=['GET'])
@require_auth
@require_role('student')
def get_project(pid):
    user = get_current_user()
    p = Project.query.filter_by(id=pid, user_id=user.id).first()
    if not p:
        return error_response('Project not found', 'NOT_FOUND', status=404)
    data = p.to_dict()
    data['expenses'] = [e.to_dict() for e in p.expenses.all()]
    return success_response(data)

@projects_bp.route('/<pid>/expenses', methods=['POST'])
@require_auth
@require_role('student')
def add_project_expense(pid):
    user = get_current_user()
    p = Project.query.filter_by(id=pid, user_id=user.id).first()
    if not p:
        return error_response('Project not found', 'NOT_FOUND', status=404)
    data = request.get_json()
    name = data.get('name', '').strip()
    if not name:
        return error_response('Expense name required')
    try:
        amount = float(data.get('amount', 0))
    except (TypeError, ValueError):
        return error_response('Invalid amount')
    e = ProjectExpense(project_id=p.id, name=name, amount=amount)
    db.session.add(e)
    db.session.commit()
    return success_response(p.to_dict(), status=201)

@projects_bp.route('/<pid>', methods=['DELETE'])
@require_auth
@require_role('student')
def delete_project(pid):
    user = get_current_user()
    p = Project.query.filter_by(id=pid, user_id=user.id).first()
    if not p:
        return error_response('Project not found', 'NOT_FOUND', status=404)
    db.session.delete(p)
    db.session.commit()
    return success_response(message='Project deleted')
