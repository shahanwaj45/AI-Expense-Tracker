import pytest

def test_savings_goals(client, student_auth_headers):
    res = client.get('/api/savings-goals', headers=student_auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert len(data['data']) >= 1
    assert data['data'][0]['name'] == 'New Laptop'

def test_emergency_fund(client, student_auth_headers):
    res = client.get('/api/emergency-fund', headers=student_auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert data['data']['fund']['monthsCovered'] == 1.5

def test_subscriptions_professional(client, prof_auth_headers):
    res = client.get('/api/subscriptions', headers=prof_auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert data['data']['count'] == 1
    assert 'Netflix' in data['data']['items'][0]['name']

def test_income_professional(client, prof_auth_headers):
    res = client.get('/api/income', headers=prof_auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert data['data']['total'] == 85000.0

def test_predictions_endpoint(client, prof_auth_headers):
    res = client.get('/api/predictions', headers=prof_auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert 'available' in data['data']
