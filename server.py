import json
import os
import re
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

# Ensure stdout uses UTF-8
sys.stdout.reconfigure(encoding='utf-8')

# Path to service account JSON
SA_PATH = os.path.join(r'C:\Users\quoc\.gemini\antigravity\brain\da46bc22-485e-446b-b082-f81ff75d4081\scratch', 'service_account.json')
SPREADSHEET_ID = '1mEuMm3Pntsn3HenWQ33aNlRG50W9daVM5HjrV9pmxY8'
TARGET_SHEET = 'Chi tiết công MN (Tỉnh & HCM)'

# Initialize Google Sheets API Service
def get_sheets_service():
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    
    creds = service_account.Credentials.from_service_account_file(
        SA_PATH, 
        scopes=['https://www.googleapis.com/auth/spreadsheets']
    )
    return build('sheets', 'v4', credentials=creds)

class ChamCongHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status_code=200, content_type='application/json'):
        self.send_response(status_code)
        self.send_header('Content-Type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == '/api/chamcong' or parsed.path == '/api/chamcong/':
            try:
                params = parse_qs(parsed.query)
                selected_day = params.get('day', ['ALL'])[0].strip()
                
                service = get_sheets_service()
                result = service.spreadsheets().values().get(
                    spreadsheetId=SPREADSHEET_ID,
                    range=f"'{TARGET_SHEET}'!A1:L"
                ).execute()
                
                rows = result.get('values', [])
                records = []
                days_list = set()
                
                for idx, row in enumerate(rows[1:], start=2):
                    if len(row) > 1 and row[1]:
                        staff_name = str(row[1]).strip()
                        if staff_name in ['Tên NS', 'TỔNG CỘNG', 'STT']:
                            continue
                        day_val = str(row[4]).strip() if len(row) > 4 else ''
                        try:
                            day_number = int(day_val)
                        except (TypeError, ValueError):
                            continue

                        if day_number < 1 or day_number > 31:
                            continue

                        day_val = str(day_number)
                        days_list.add(day_number)
                            
                        if selected_day != 'ALL' and day_val != selected_day:
                            continue
                            
                        records.append({
                            'row_index': idx,
                            'stt': row[0] if len(row) > 0 else '',
                            'staff': row[1] if len(row) > 1 else '',
                            'ma_nv': row[2] if len(row) > 2 else '',
                            'thu': row[3] if len(row) > 3 else '',
                            'ngay': day_val,
                            'in_time': row[5] if len(row) > 5 else '',
                            'out_time': row[6] if len(row) > 6 else '',
                            'total_time': row[7] if len(row) > 7 else '',
                            'act_count': row[8] if len(row) > 8 else '',
                            'phat_muon': row[9] if len(row) > 9 else '',
                            'cham_cong': row[10] if len(row) > 10 else '',
                            'ghi_chu': row[11] if len(row) > 11 else ''
                        })
                
                response_data = {
                    'status': 'success',
                    'available_days': sorted(list(days_list)),
                    'selected_day': selected_day,
                    'total_records': len(records),
                    'data': records
                }
                
                self._set_headers(200)
                self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                import traceback
                traceback.print_exc()
                self._set_headers(500)
                err_resp = {'status': 'error', 'message': str(e)}
                self.wfile.write(json.dumps(err_resp, ensure_ascii=False).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({'status': 'error', 'message': 'Endpoint not found'}, ensure_ascii=False).encode('utf-8'))

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == '/api/chamcong/submit' or parsed.path == '/api/chamcong/submit/':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body_bytes = self.rfile.read(content_length)
                payload = json.loads(body_bytes.decode('utf-8'))
                
                updates = payload.get('updates', [])
                if not updates:
                    self._set_headers(400)
                    self.wfile.write(json.dumps({'status': 'error', 'message': 'Không có dữ liệu cập nhật'}, ensure_ascii=False).encode('utf-8'))
                    return
                
                service = get_sheets_service()
                data_batch = []
                
                for item in updates:
                    try:
                        row_idx = int(item.get('row_index'))
                    except (TypeError, ValueError):
                        continue

                    if row_idx < 2:
                        continue

                    cham_cong_val = item.get('cham_cong', '')
                    ghi_chu_val = item.get('ghi_chu', '')
                    
                    data_batch.append({
                        'range': f"'{TARGET_SHEET}'!K{row_idx}:L{row_idx}",
                        'values': [[cham_cong_val, ghi_chu_val]]
                    })
                
                if data_batch:
                    batch_body = {
                        'valueInputOption': 'USER_ENTERED',
                        'data': data_batch
                    }
                    service.spreadsheets().values().batchUpdate(
                        spreadsheetId=SPREADSHEET_ID,
                        body=batch_body
                    ).execute()
                
                response_data = {
                    'status': 'success',
                    'updated_count': len(data_batch),
                    'message': f"Đã cập nhật thành công {len(data_batch)} dòng lên Google Sheets!"
                }
                
                self._set_headers(200)
                self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                import traceback
                traceback.print_exc()
                self._set_headers(500)
                err_resp = {'status': 'error', 'message': str(e)}
                self.wfile.write(json.dumps(err_resp, ensure_ascii=False).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({'status': 'error', 'message': 'Endpoint not found'}, ensure_ascii=False).encode('utf-8'))

def run_server(port=3001):
    server_address = ('', port)
    httpd = HTTPServer(server_address, ChamCongHandler)
    print(f"🚀 API Server Chấm Công đang chạy tại http://localhost:{port}")
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
