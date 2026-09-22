import pytest

def test_analytics_trend_student(client, student_auth_headers):
    res = client.get('/api/analytics/trend', headers=student_auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert isinstance(data['data'], list)
    assert len(data['data']) == 12
    assert 'month' in data['data'][0]
    assert 'height' in data['data'][0]

def test_analytics_spending_trend_alias(client, prof_auth_headers):
    res = client.get('/api/analytics/spending-trend', headers=prof_auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert len(data['data']) == 12

def test_analytics_categories_and_summary(client, student_auth_headers):
    # Categories
    res = client.get('/api/analytics/categories', headers=student_auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert isinstance(data['data'], list)
    
    # Summary
    res_sum = client.get('/api/analytics/summary', headers=student_auth_headers)
    assert res_sum.status_code == 200
    sum_data = res_sum.get_json()
    assert sum_data['success'] is True
    assert 'total_spent' in sum_data['data']
    assert 'total_income' in sum_data['data']
    assert 'net' in sum_data['data']

def test_budgets_list_and_calculation(client, student_auth_headers):
    res = client.get('/api/budgets', headers=student_auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert 'categories' in data['data']
    assert 'usedPercent' in data['data']
    assert 'total_limit' in data['data']
    assert 'total_spent' in data['data']
    assert len(data['data']['categories']) >= 1
    assert data['data']['categories'][0]['category'] == 'Food'

def test_budgets_create(client, student_auth_headers):
    res = client.post('/api/budgets', headers=student_auth_headers, json={
        'category': 'Entertainment',
        'limit_amount': 3500.0,
        'color': '#f6ae8e'
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data['success'] is True
    assert data['data']['category'] == 'Entertainment'
    assert data['data']['limit_amount'] == 3500.0

def test_reports_list(client, student_auth_headers):
    res = client.get('/api/reports/list', headers=student_auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert isinstance(data['data'], list)
    assert len(data['data']) >= 3
    assert 'Monthly Summary' in data['data'][0]['name']

def test_reports_download_monthly_pdf(client, student_auth_headers):
    res = client.get('/api/reports/download?name=Monthly+Summary', headers=student_auth_headers)
    assert res.status_code == 200
    assert res.content_type == 'application/pdf'
    assert 'attachment;' in res.headers.get('Content-Disposition', '')
    # Check valid PDF magic bytes (%PDF)
    assert res.data.startswith(b'%PDF')
    assert len(res.data) > 1000  # Valid generated binary PDF

def test_reports_download_category_pdf(client, prof_auth_headers):
    res = client.get('/api/reports/download?name=Category+Breakdown', headers=prof_auth_headers)
    assert res.status_code == 200
    assert res.content_type == 'application/pdf'
    assert res.data.startswith(b'%PDF')
    assert len(res.data) > 1000

def test_reports_unauthorized(client):
    res = client.get('/api/reports/download')
    assert res.status_code == 401
