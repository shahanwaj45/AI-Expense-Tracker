import pytest

def test_health_check(client):
    res = client.get('/api/health')
    assert res.status_code == 200
    data = res.get_json()
    assert data['status'] == 'ok'

def test_login_success(client):
    res = client.post('/api/auth/login', json={
        'email': 'student@test.com',
        'password': 'student123'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert 'token' in data['data']
    assert data['data']['user']['role'] == 'student'
    assert data['data']['user']['name'] == 'Test Student'

def test_login_invalid_password(client):
    res = client.post('/api/auth/login', json={
        'email': 'student@test.com',
        'password': 'wrongpassword'
    })
    assert res.status_code == 401
    data = res.get_json()
    assert data['success'] is False

def test_login_missing_fields(client):
    res = client.post('/api/auth/login', json={
        'email': 'student@test.com'
    })
    assert res.status_code == 400

def test_signup_student(client):
    res = client.post('/api/auth/register', json={
        'name': 'New Student',
        'email': 'newstudent@test.com',
        'password': 'password123',
        'role': 'student'
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data['success'] is True
    assert data['data']['user']['email'] == 'newstudent@test.com'
    assert data['data']['user']['role'] == 'student'

def test_signup_existing_email(client):
    res = client.post('/api/auth/register', json={
        'name': 'Duplicate',
        'email': 'student@test.com',
        'password': 'password123',
        'role': 'student'
    })
    assert res.status_code == 409

def test_get_me(client, student_auth_headers):
    res = client.get('/api/auth/me', headers=student_auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert data['data']['email'] == 'student@test.com'

def test_unauthorized_access(client):
    res = client.get('/api/auth/me')
    assert res.status_code == 401
