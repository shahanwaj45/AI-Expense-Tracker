import pytest

def test_student_dashboard(client, student_auth_headers):
    res = client.get('/api/dashboard/student', headers=student_auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    payload = data['data']
    assert 'heroMetric' in payload
    assert 'statMetrics' in payload
    assert 'trendBars' in payload
    assert 'budgetCategories' in payload
    assert 'recentTransactions' in payload

def test_professional_dashboard(client, prof_auth_headers):
    res = client.get('/api/dashboard/professional', headers=prof_auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    payload = data['data']
    assert 'heroMetric' in payload
    assert 'statMetrics' in payload
    assert 'trendBars' in payload

def test_role_enforcement_student_forbidden_on_prof_endpoint(client, student_auth_headers):
    res = client.get('/api/income', headers=student_auth_headers)
    assert res.status_code == 403

def test_role_enforcement_prof_forbidden_on_student_endpoint(client, prof_auth_headers):
    res = client.get('/api/projects', headers=prof_auth_headers)
    assert res.status_code == 403
