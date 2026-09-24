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

def test_predictions_student_access(client, student_auth_headers):
    res = client.get('/api/predictions', headers=student_auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True

def test_emergency_fund_withdraw(client, student_auth_headers):
    # Contribute first
    res = client.post('/api/emergency-fund/contribute', json={'amount': 2000}, headers=student_auth_headers)
    assert res.status_code == 200
    
    # Withdraw
    res = client.post('/api/emergency-fund/withdraw', json={'amount': 1000}, headers=student_auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert data['data']['current'] >= 1000

def test_subscriptions_create_and_delete(client, prof_auth_headers):
    res = client.post('/api/subscriptions', json={
        'name': 'Spotify Premium',
        'amount': 119,
        'cycle': 'Monthly',
        'color': '#1DB954'
    }, headers=prof_auth_headers)
    assert res.status_code == 201
    sid = res.get_json()['data']['id']
    
    del_res = client.delete(f'/api/subscriptions/{sid}', headers=prof_auth_headers)
    assert del_res.status_code == 200

def test_change_password_endpoint(client, student_auth_headers):
    # Try invalid password
    res = client.post('/api/auth/change-password', json={
        'current_password': 'wrongpassword',
        'new_password': 'newpassword123'
    }, headers=student_auth_headers)
    assert res.status_code == 400

    # Valid password
    res = client.post('/api/auth/change-password', json={
        'current_password': 'student123',
        'new_password': 'newpassword123'
    }, headers=student_auth_headers)
    assert res.status_code == 200

    # Revert back
    res = client.post('/api/auth/change-password', json={
        'current_password': 'newpassword123',
        'new_password': 'student123'
    }, headers=student_auth_headers)
    assert res.status_code == 200

def test_export_transactions(client, student_auth_headers):
    res = client.get('/api/users/export', headers=student_auth_headers)
    assert res.status_code == 200
    assert 'text/csv' in res.content_type
    assert b'Amount (INR)' in res.data
