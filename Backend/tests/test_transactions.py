import pytest

def test_list_transactions(client, student_auth_headers):
    res = client.get('/api/transactions', headers=student_auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert len(data['data']['items']) >= 2
    assert data['data']['total'] >= 2

def test_create_expense_transaction(client, student_auth_headers):
    res = client.post('/api/transactions', headers=student_auth_headers, json={
        'name': 'Coffee',
        'amount': 150.0,
        'type': 'expense',
        'category': 'Food',
        'payment_method': 'UPI'
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data['success'] is True
    assert data['data']['name'] == 'Coffee'
    assert '150' in data['data']['amount']

def test_create_income_transaction(client, student_auth_headers):
    res = client.post('/api/transactions', headers=student_auth_headers, json={
        'name': 'Freelance Gig',
        'amount': 5000.0,
        'type': 'income',
        'category': 'Freelance',
        'payment_method': 'Bank Transfer'
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data['success'] is True
    assert '+' in data['data']['amount']

def test_create_transaction_invalid_data(client, student_auth_headers):
    res = client.post('/api/transactions', headers=student_auth_headers, json={
        'name': '',
        'amount': -100
    })
    assert res.status_code == 400

def test_delete_transaction(client, student_auth_headers):
    # First create
    create_res = client.post('/api/transactions', headers=student_auth_headers, json={
        'name': 'To Delete',
        'amount': 99.0,
        'type': 'expense'
    })
    tx_id = create_res.get_json()['data']['id']
    
    # Then delete
    del_res = client.delete(f'/api/transactions/{tx_id}', headers=student_auth_headers)
    assert del_res.status_code == 200
    assert del_res.get_json()['success'] is True
