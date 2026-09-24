import io
from PIL import Image

def test_receipt_scan_no_file(client, student_auth_headers):
    res = client.post('/api/receipts/scan', headers=student_auth_headers)
    assert res.status_code == 400
    data = res.get_json()
    assert data['success'] is False

def test_receipt_scan_invalid_extension(client, student_auth_headers):
    data = {
        'file': (io.BytesIO(b'dummy content'), 'test.exe')
    }
    res = client.post('/api/receipts/scan', headers=student_auth_headers, data=data, content_type='multipart/form-data')
    assert res.status_code == 400
    res_data = res.get_json()
    assert res_data['success'] is False
    assert 'Invalid file type' in res_data['error']['message']

def test_receipt_confirm(client, student_auth_headers):
    payload = {
        'merchant': 'Supermarket Grocery',
        'amount': 350.50,
        'category': 'Food',
        'date': '2026-09-20'
    }
    res = client.post('/api/receipts/confirm', headers=student_auth_headers, json=payload)
    assert res.status_code == 201
    data = res.get_json()
    assert data['success'] is True
    assert data['data']['name'] == 'Supermarket Grocery'
    assert data['data']['amount_raw'] == 350.50
    assert data['data']['category'] == 'Food'
